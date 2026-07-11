/* layers of city — app core (E1)
   Static, framework-free. Routes: #/ (world picker) and #/<cityId>.
   All user-facing text comes from i18n/<lang>.json (see docs/VERI.md). */

(function () {
  "use strict";

  const SUPPORTED_LANGS = ["tr", "en"]; // grows to 6 in later stages
  const FALLBACK_LANG = "en";
  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ── theme ─────────────────────────────── */
  const root = document.documentElement;
  let theme = localStorage.getItem("loc-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  function applyTheme() {
    root.dataset.theme = theme;
    document.getElementById("ic-moon").style.display = theme === "light" ? "" : "none";
    document.getElementById("ic-sun").style.display = theme === "dark" ? "" : "none";
  }
  document.getElementById("themebtn").onclick = () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("loc-theme", theme);
    applyTheme();
    if (map && basemapMode === "sade") {
      // setStyle wipes custom layers; 'style.load' only fires on first load in
      // this MapLibre build, so re-add explicitly once the new style settles.
      map.setStyle(`assets/basemap-${theme}.json?v=${BM_VER}`);
      map.once("idle", addCityLayers);
    }
  };

  /* ── i18n ──────────────────────────────── */
  const dicts = {}; // lang -> key/value map
  let lang = localStorage.getItem("loc-lang");
  if (!SUPPORTED_LANGS.includes(lang)) {
    const nav = (navigator.language || "en").slice(0, 2);
    lang = SUPPORTED_LANGS.includes(nav) ? nav : FALLBACK_LANG;
  }

  async function loadDict(code) {
    if (dicts[code]) return dicts[code];
    const res = await fetch(`i18n/${code}.json`);
    dicts[code] = res.ok ? await res.json() : {};
    return dicts[code];
  }

  function t(key) {
    return (dicts[lang] && dicts[lang][key]) ||
           (dicts[FALLBACK_LANG] && dicts[FALLBACK_LANG][key]) || key;
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-label]").forEach(el => {
      const v = t(el.dataset.i18nLabel);
      el.setAttribute("aria-label", v);
      el.setAttribute("title", v);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      el.setAttribute("placeholder", t(el.dataset.i18nPh));
    });
    document.getElementById("langbtn").textContent = lang.toUpperCase();
    document.querySelectorAll("#langmenu button").forEach(b =>
      b.classList.toggle("on", b.dataset.lang === lang));
    document.documentElement.lang = lang;
  }

  async function setLang(code) {
    lang = code;
    localStorage.setItem("loc-lang", code);
    await loadDict(code);
    applyI18n();
    renderWorld(); // soon-labels use i18n
    if (typeof tickClock === "function") tickClock(); // date format follows language
    if (typeof refreshLayerLabels === "function") refreshLayerLabels(); // map labels follow language
    if (typeof renderInfoCard === "function" && !document.getElementById("infocard").hidden) renderInfoCard();
  }
  const langMenu = document.getElementById("langmenu");
  function closeLangMenu() {
    langMenu.classList.remove("show"); langMenu.hidden = true;
    document.getElementById("langbtn").setAttribute("aria-expanded", "false");
  }
  document.getElementById("langbtn").onclick = function () {
    if (langMenu.hidden) {
      langMenu.hidden = false;
      requestAnimationFrame(() => langMenu.classList.add("show"));
      this.setAttribute("aria-expanded", "true");
    } else closeLangMenu();
  };
  document.querySelectorAll("#langmenu button").forEach(b => {
    b.onclick = () => { if (!b.disabled) { setLang(b.dataset.lang); closeLangMenu(); } };
  });

  /* ── world screen ──────────────────────── */
  const worldSvg = document.getElementById("worldmap");
  let cities = [];

  // Equirectangular projection matching the dot grid (1000x500 canvas)
  function project(lon, lat) {
    return [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500];
  }

  function renderWorld() {
    let html = "";
    for (let i = 0; i < WORLD_DOTS.length; i += 2) {
      html += `<circle class="worlddot" cx="${WORLD_DOTS[i]}" cy="${WORLD_DOTS[i + 1]}" r="2.1"/>`;
    }
    worldSvg.innerHTML = html;

    cities.forEach(c => {
      const [x, y] = project(c.lon, c.lat);
      const ax = x + (c.anchor ? c.anchor[0] : 8);
      const ay = y + (c.anchor ? c.anchor[1] : 4);
      const g = document.createElementNS(SVG_NS, "g");
      const ready = c.status === "ready";
      g.setAttribute("class", ready ? "city-ready" : "city-soon");
      g.innerHTML = ready
        ? `<circle class="hit" cx="${x}" cy="${y}" r="24" fill="transparent"/>
           <circle class="halo" cx="${x}" cy="${y}" r="14"/>
           <circle class="core" cx="${x}" cy="${y}" r="6"/>
           <text x="${ax}" y="${ay}">${c.name}</text>`
        : `<circle cx="${x}" cy="${y}" r="3.4"/>
           <text x="${ax}" y="${ay}">${c.name} · ${t("world.soon")}</text>`;
      if (ready) {
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        const go = () => { location.hash = "#/" + c.id; };
        g.addEventListener("click", go);
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") go(); });
      }
      worldSvg.appendChild(g);
    });
  }

  /* ── world zoom: wordmark + map scale/pan together, full-screen; header
        stays fixed (it lives outside #worldzoom, and page zoom is locked) ── */
  const worldZoom = document.getElementById("worldzoom");
  const worldSurface = document.getElementById("scr-world");
  let wScale = 1, wX = 0, wY = 0, wMode = null, wStartDist = 0, wStartScale = 1, wMid = null, wPan = null;
  const W_MAX = 6;
  function wApply() { worldZoom.style.transform = `translate(${wX}px,${wY}px) scale(${wScale})`; }
  function wClamp() {
    wScale = Math.max(1, Math.min(W_MAX, wScale));
    const w = worldSurface.clientWidth, h = worldSurface.clientHeight;
    wX = Math.max(w * (1 - wScale), Math.min(0, wX));
    wY = Math.max(h * (1 - wScale), Math.min(0, wY));
    if (wScale === 1) { wX = 0; wY = 0; }
  }
  function resetWorldZoom() { wScale = 1; wX = 0; wY = 0; wApply(); }
  const wDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const wMidpoint = t => { const r = worldSurface.getBoundingClientRect(); return { x: (t[0].clientX + t[1].clientX) / 2 - r.left, y: (t[0].clientY + t[1].clientY) / 2 - r.top }; };
  worldSurface.addEventListener("touchstart", e => {
    if (e.touches.length === 2) { wMode = "pinch"; wStartDist = wDist(e.touches); wStartScale = wScale; wMid = wMidpoint(e.touches); e.preventDefault(); }
    else if (e.touches.length === 1) { wMode = "pan"; wPan = { x: e.touches[0].clientX - wX, y: e.touches[0].clientY - wY }; }
  }, { passive: false });
  worldSurface.addEventListener("touchmove", e => {
    if (wMode === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      let ns = wStartScale * (wDist(e.touches) / wStartDist);
      ns = Math.max(1, Math.min(W_MAX, ns));
      wX = wMid.x - (wMid.x - wX) * (ns / wScale); // zoom around the pinch focal point
      wY = wMid.y - (wMid.y - wY) * (ns / wScale);
      wScale = ns; wClamp(); wApply();
    } else if (wMode === "pan" && e.touches.length === 1 && wScale > 1) {
      e.preventDefault();
      wX = e.touches[0].clientX - wPan.x; wY = e.touches[0].clientY - wPan.y;
      wClamp(); wApply();
    }
  }, { passive: false });
  worldSurface.addEventListener("touchend", e => { if (e.touches.length === 0) wMode = null; });

  /* ── city screen: map + chrome ─────────── */
  let map = null;
  let manifest = null;      // data/<city>/city.json
  let clockTimer = null;
  let meMarker = null;
  let mapFitted = false;    // has the map fit to home once it had real size?
  let longPressFired = false; // suppress the click that follows a long-press
  let weatherData = null;   // Open-Meteo current + 5-day (keyless)
  let fxToUsd = null;       // Frankfurter currency -> USD rate (keyless)

  // WMO weather code -> minimal line icon (stays on-brand; no bright fills)
  const WX_PATHS = {
    clear: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    partly: '<circle cx="8" cy="8" r="3"/><path d="M8 2.6v1.5M2.6 8h1.5M4.4 4.4l1 1"/><path d="M7 19h9a3.5 3.5 0 0 0 .2-7 4.5 4.5 0 0 0-8.4-1.2A3.2 3.2 0 0 0 7 19Z"/>',
    cloud: '<path d="M7 18h9.5a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.2A3.6 3.6 0 0 0 7 18Z"/>',
    rain: '<path d="M7 15h9.5a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.2A3.6 3.6 0 0 0 7 15Z"/><path d="M8.5 18.5l-1 2.5M12 18.5l-1 2.5M15.5 18.5l-1 2.5"/>',
    snow: '<path d="M7 15h9.5a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.2A3.6 3.6 0 0 0 7 15Z"/><path d="M9 19v.01M12.5 20v.01M16 19v.01"/>',
    fog: '<path d="M5 8.5h14M4 12h16M5 15.5h12M7 19h9"/>',
    storm: '<path d="M7 14h9.5a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.2A3.6 3.6 0 0 0 7 14Z"/><path d="M12 15l-2.2 3.3h3L10.6 22"/>'
  };
  function wxKey(c) {
    if (c === 0) return "clear";
    if (c === 1 || c === 2) return "partly";
    if (c === 3) return "cloud";
    if (c === 45 || c === 48) return "fog";
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "snow";
    if (c >= 95) return "storm";
    return "rain"; // 51-67, 80-82
  }
  function wxSvg(key) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${WX_PATHS[key] || WX_PATHS.cloud}</svg>`;
  }
  function updateCityBarWx() {
    const el = document.getElementById("cb-wx");
    if (!el) return;
    if (weatherData && weatherData.current) {
      el.innerHTML = wxSvg(wxKey(weatherData.current.weather_code)) +
        `<span>${Math.round(weatherData.current.temperature_2m)}°</span>`;
    } else { el.innerHTML = ""; }
  }
  // Fetch live weather + USD rate for the current city (keyless, best-effort).
  async function loadLiveData() {
    if (!manifest || !manifest.center) return;
    const [lon, lat] = manifest.center;
    weatherData = null; fxToUsd = null;
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=auto&forecast_days=5`;
      const r = await fetch(u);
      if (r.ok) weatherData = await r.json();
    } catch { /* offline / blocked -> section stays hidden */ }
    updateCityBarWx();
    if (manifest.currency && manifest.currency !== "USD") {
      try {
        const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=${manifest.currency}&symbols=USD`);
        if (r.ok) { const d = await r.json(); fxToUsd = d.rates && d.rates.USD; }
      } catch { /* ignore */ }
    }
    if (infoCard && !infoCard.hidden) renderInfoCard();
  }

  // Fit the whole-city view, with padding that clears the floating controls.
  function fitHome(animate) {
    if (!map || !manifest) return;
    map.fitBounds(manifest.home, {
      padding: { top: 96, right: 56, bottom: 72, left: 24 },
      animate: !!animate
    });
  }
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  /* place card: name + external Google Maps link (no key, no in-app nav) */
  const placeCard = document.getElementById("placecard");
  function showPlaceCard(name, lng, lat) {
    // Drop a Google Maps pin at the EXACT tapped coordinates (q=lat,lng), with
    // the name as the pin label — no text search, so it never snaps to a
    // same-named place or a nearby street. Unnamed points get a bare pin.
    const ll = lat.toFixed(6) + "," + lng.toFixed(6);
    document.getElementById("pc-name").textContent =
      name || (lat.toFixed(5) + ", " + lng.toFixed(5));
    document.getElementById("pc-dir").href =
      "https://www.google.com/maps?q=" + ll + (name ? "(" + encodeURIComponent(name) + ")" : "");
    placeCard.hidden = false;
    requestAnimationFrame(() => placeCard.classList.add("show"));
  }
  function hidePlaceCard() {
    placeCard.classList.remove("show");
    placeCard.hidden = true;
  }
  document.getElementById("pc-close").onclick = hidePlaceCard;

  /* ── basemap modes: sade (themed vector) / detay (OSM-look vector) / uydu ── */
  const BM_VER = "20260711-9"; // cache-bust for the basemap style JSON files
  let basemapMode = localStorage.getItem("loc-basemap") || "sade";
  if (!["sade", "detay", "uydu"].includes(basemapMode)) basemapMode = "sade";
  const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
  function rasterStyle(tiles, attribution) {
    return { version: 8, glyphs: GLYPHS,
      sources: { r: { type: "raster", tiles: [tiles], tileSize: 256, attribution } },
      // lift the darkest pixels a touch: this imagery has heavy shadows
      layers: [{ id: "r", type: "raster", source: "r",
        paint: { "raster-brightness-min": 0.08, "raster-contrast": -0.06, "raster-saturation": -0.04 } }] };
  }

  /* ── place-name skeleton: pale OSM labels shown on Sade + Uydu, independent
     of any layer toggle, so the map always "reads" as the city. One definition,
     laid over both basemaps from the live OpenFreeMap (omt) vector source. ── */
  const NAME = ["coalesce", ["get", "name:latin"], ["get", "name"]];
  const SK_COLORS = {
    light: { ink: "#5C5348", strong: "#453E35", water: "#7A80A4", green: "#69764F", road: "#847A6C", halo: "#F2EDE7", hw: 1.5 },
    dark:  { ink: "#CFC8D8", strong: "#E4DEEC", water: "#8E88AC", green: "#8C9578", road: "#8B849C", halo: "#26222C", hw: 1.5 },
    sat:   { ink: "#FFFFFF", strong: "#FFFFFF", water: "#CFE0FF", green: "#DDEBC8", road: "#FFEEC2", halo: "#151515", hw: 1.9 }
  };
  function skeletonLabels(c) {
    const F = ["Noto Sans Regular"];
    return [
      { id: "sk-water-name", type: "symbol", source: "omt", "source-layer": "water_name", minzoom: 10.5,
        layout: { "text-field": NAME, "text-font": F, "text-letter-spacing": 0.15, "symbol-placement": "line",
          "text-max-angle": 40, "text-size": ["interpolate", ["linear"], ["zoom"], 10.5, 11, 15, 14], "text-optional": true },
        paint: { "text-color": c.water, "text-halo-color": c.halo, "text-halo-width": 1.3, "text-halo-blur": 0.4 } },
      { id: "sk-park-name", type: "symbol", source: "omt", "source-layer": "park", minzoom: 12,
        layout: { "text-field": NAME, "text-font": F, "text-max-width": 7, "text-letter-spacing": 0.03,
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10.5, 15, 12.5], "text-optional": true },
        paint: { "text-color": c.green, "text-halo-color": c.halo, "text-halo-width": 1.3, "text-halo-blur": 0.4 } },
      { id: "sk-road-name", type: "symbol", source: "omt", "source-layer": "transportation_name",
        filter: ["in", "class", "motorway", "trunk", "primary", "secondary"], minzoom: 13,
        layout: { "text-field": NAME, "text-font": F, "symbol-placement": "line", "text-max-angle": 38,
          "text-size": ["interpolate", ["linear"], ["zoom"], 13, 10.5, 16, 12.5], "text-optional": true },
        paint: { "text-color": c.road, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.3 } },
      // landmark POIs: universities, hospitals, museums, stadiums… (Sapienza et al.)
      { id: "sk-poi", type: "symbol", source: "omt", "source-layer": "poi", minzoom: 14,
        filter: ["all", ["<=", ["get", "rank"], 8],
          ["in", ["get", "class"], ["literal", ["college", "university", "school", "hospital", "museum",
            "attraction", "monument", "memorial", "castle", "stadium", "pitch", "cemetery", "library",
            "theatre", "arts_centre", "town_hall", "townhall", "place_of_worship", "park", "garden", "zoo"]]]],
        layout: { "text-field": NAME, "text-font": F, "text-anchor": "top", "text-offset": [0, 0.5],
          "text-max-width": 8, "symbol-sort-key": ["get", "rank"], "text-padding": 4,
          "text-size": ["interpolate", ["linear"], ["zoom"], 14, 11, 17, 13.5], "text-optional": true },
        paint: { "text-color": c.ink, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.4 } },
      { id: "sk-place-suburb", type: "symbol", source: "omt", "source-layer": "place",
        filter: ["in", "class", "suburb", "quarter", "neighbourhood"], minzoom: 11.5,
        layout: { "text-field": NAME, "text-font": F, "text-letter-spacing": 0.08, "text-transform": "uppercase",
          "text-max-width": 8, "text-padding": 6, "text-size": ["interpolate", ["linear"], ["zoom"], 11.5, 11.5, 15, 15], "text-optional": true },
        paint: { "text-color": c.ink, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.4 } },
      { id: "sk-place-village", type: "symbol", source: "omt", "source-layer": "place",
        filter: ["in", "class", "village", "hamlet"], minzoom: 11,
        layout: { "text-field": NAME, "text-font": F, "text-max-width": 8, "text-padding": 6,
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 11, 14, 13], "text-optional": true },
        paint: { "text-color": c.ink, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.4 } },
      { id: "sk-place-town", type: "symbol", source: "omt", "source-layer": "place",
        filter: ["==", "class", "town"], minzoom: 9.5,
        layout: { "text-field": NAME, "text-font": F, "text-max-width": 8, "text-padding": 8,
          "text-size": ["interpolate", ["linear"], ["zoom"], 9.5, 11.5, 14, 15], "text-optional": true },
        paint: { "text-color": c.strong, "text-halo-color": c.halo, "text-halo-width": 1.6, "text-halo-blur": 0.4 } },
      { id: "sk-place-city", type: "symbol", source: "omt", "source-layer": "place",
        filter: ["==", "class", "city"], maxzoom: 13,
        layout: { "text-field": NAME, "text-font": F, "text-letter-spacing": 0.12, "text-transform": "uppercase", "text-padding": 10,
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 13, 11, 19], "text-optional": true },
        paint: { "text-color": c.strong, "text-halo-color": c.halo, "text-halo-width": 1.7, "text-halo-blur": 0.4 } }
    ];
  }
  function addSkeletonLabels() {
    if (!map || basemapMode === "detay") return; // OSM Detaylı brings its own labels
    if (!map.getSource("omt")) map.addSource("omt", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
    const c = basemapMode === "uydu" ? SK_COLORS.sat : SK_COLORS[theme];
    skeletonLabels(c).forEach(spec => {
      if (map.getLayer(spec.id)) map.removeLayer(spec.id);
      map.addLayer(spec);
    });
  }
  function basemapStyle() {
    if (basemapMode === "detay") return `assets/basemap-detail.json?v=${BM_VER}`;
    if (basemapMode === "uydu") return rasterStyle(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      "Esri, Maxar, Earthstar Geographics");
    return `assets/basemap-${theme}.json?v=${BM_VER}`;
  }
  function updateBasemapMenu() {
    document.querySelectorAll("#basemapmenu .bmopt").forEach(b =>
      b.setAttribute("aria-pressed", b.dataset.bm === basemapMode));
  }
  function applyBasemap(mode) {
    basemapMode = mode;
    localStorage.setItem("loc-basemap", mode);
    updateBasemapMenu();
    if (map) {
      // style.load doesn't refire after setStyle in this build -> re-add on idle
      map.setStyle(basemapStyle());
      map.once("idle", addCityLayers);
    }
  }

  /* OSM notes + GPS traces overlays (keyless), toggleable on any basemap */
  let notesOn = false, gpsOn = false, notesData = null;
  /* street-character overlay: pedestrian-priority vs vehicle arteries (from OSM) */
  let walkOn = false, walkData = null;
  function addOverlayExtras() {
    if (!map) return;
    const firstLyr = (map.getStyle().layers.find(l => l.id.startsWith("lyr-")) || {}).id;
    if (gpsOn && !map.getSource("gpstrace")) {
      map.addSource("gpstrace", { type: "raster", tileSize: 256,
        tiles: ["https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png"] });
      map.addLayer({ id: "gpstrace", type: "raster", source: "gpstrace",
        paint: { "raster-opacity": 0.7 } }, firstLyr);
    }
    if (!gpsOn && map.getLayer("gpstrace")) { map.removeLayer("gpstrace"); map.removeSource("gpstrace"); }
    if (notesOn && notesData && !map.getSource("osmnotes")) {
      map.addSource("osmnotes", { type: "geojson", data: notesData });
      map.addLayer({ id: "osmnotes-pt", type: "circle", source: "osmnotes",
        paint: { "circle-radius": 5.5, "circle-color": "#E0A24B",
          "circle-stroke-color": "#FFFFFF", "circle-stroke-width": 1.6 } });
    }
    if (!notesOn && map.getLayer("osmnotes-pt")) { map.removeLayer("osmnotes-pt"); map.removeSource("osmnotes"); }
    // walkability: arteries (warm) at the bottom, pedestrian areas + streets (green) on top
    if (walkOn && walkData && !map.getSource("walk")) {
      map.addSource("walk", { type: "geojson", data: walkData });
      const on = theme === "dark";
      // colour by tier: t1 = main axis (darkest/strongest) … t3 = minor (light).
      // Pedestrian tiers are SOFT (footways must stay readable); vehicle tiers
      // are SHARP (motorway/trunk should clearly dominate secondary).
      const pedC = on ? ["match", ["get", "t"], 1, "#74D69B", 2, "#63C58C", "#54B37D"]
                      : ["match", ["get", "t"], 1, "#2F8A54", 2, "#4C9E6C", "#67B183"];
      const artC = on ? ["match", ["get", "t"], 1, "#FFB472", 2, "#D98247", "#8F5C39"]
                      : ["match", ["get", "t"], 1, "#8A3406", 2, "#C7561F", "#EBB791"];
      const pedTop = on ? "#74D69B" : "#2F8A54";
      map.addLayer({ id: "walk-artery", type: "line", source: "walk", filter: ["==", ["get", "k"], "artery"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": artC,
          "line-opacity": ["match", ["get", "t"], 1, 0.95, 2, 0.78, 0.5],
          "line-width": ["interpolate", ["linear"], ["zoom"],
            11, ["match", ["get", "t"], 1, 2.8, 2, 1.5, 0.7],
            14, ["match", ["get", "t"], 1, 6, 2, 3.2, 1.5],
            17, ["match", ["get", "t"], 1, 10, 2, 5.5, 2.6]] } }, firstLyr);
      map.addLayer({ id: "walk-ped-area", type: "fill", source: "walk", filter: ["==", ["get", "k"], "ped-area"],
        paint: { "fill-color": pedTop, "fill-opacity": 0.22 } }, firstLyr);
      map.addLayer({ id: "walk-ped-line", type: "line", source: "walk", filter: ["==", ["get", "k"], "ped-line"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": pedC,
          "line-opacity": ["match", ["get", "t"], 1, 0.9, 2, 0.85, 0.8],
          "line-width": ["interpolate", ["linear"], ["zoom"],
            11, ["match", ["get", "t"], 1, 1.5, 2, 1.2, 1],
            14, ["match", ["get", "t"], 1, 3.2, 2, 2.6, 2],
            17, ["match", ["get", "t"], 1, 5.5, 2, 4.6, 3.6]] } }, firstLyr);
    }
    if (!walkOn) ["walk-ped-line", "walk-ped-area", "walk-artery"].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (!walkOn && map.getSource("walk")) map.removeSource("walk");
  }
  async function fetchWalk() {
    if (walkData || !manifest) return;
    try {
      const r = await fetch(`data/${manifest.id}/walkability.geojson?v=${BM_VER}`);
      if (r.ok) walkData = await r.json();
    } catch { /* offline -> toggle just does nothing visible */ }
  }
  async function fetchNotes() {
    if (notesData || !manifest) return;
    try {
      const [[w, s], [e, n]] = manifest.maxBounds;
      const r = await fetch(`https://api.openstreetmap.org/api/0.6/notes.json?bbox=${w},${s},${e},${n}&limit=100&closed=0`);
      if (r.ok) {
        const d = await r.json();
        notesData = { type: "FeatureCollection", features: (d.features || []).map(f => ({
          type: "Feature", geometry: f.geometry,
          properties: { name: ((f.properties.comments || [])[0] || {}).text || "OSM note" } })) };
      }
    } catch { /* offline -> toggle just does nothing visible */ }
  }

  function tickClock() {
    if (!manifest) return;
    const now = new Date();
    const loc = lang === "tr" ? "tr-TR" : "en-GB";
    document.getElementById("cb-date").textContent =
      new Intl.DateTimeFormat(loc, { timeZone: manifest.timezone, day: "numeric", month: "short" }).format(now);
    document.getElementById("cb-time").textContent =
      new Intl.DateTimeFormat(loc, { timeZone: manifest.timezone, hour: "2-digit", minute: "2-digit" }).format(now);
  }

  async function enterCity(city) {
    document.getElementById("cb-name").textContent = city.name;
    const ph = document.getElementById("cityph");
    try {
      const res = await fetch(`data/${city.id}/city.json`);
      if (!res.ok) throw new Error("no manifest");
      manifest = await res.json();
    } catch {
      // manifest missing -> quiet placeholder, no broken map
      manifest = null;
      document.getElementById("cityname").textContent = city.name;
      ph.hidden = false;
      return;
    }
    ph.hidden = true;

    if (!map) {
      await loadCityData(city.id);   // fetch layer geojson before the map draws
      map = new maplibregl.Map({
        container: "map",
        style: basemapStyle(),
        bounds: manifest.home,
        fitBoundsOptions: { padding: 24 },
        minZoom: manifest.zoom.min,
        maxZoom: manifest.zoom.max,
        maxBounds: manifest.maxBounds,
        attributionControl: { compact: true }
      });
      map.touchPitch.disable();
      map.dragRotate.disable();
      window.__map = map; // test/debug hook
      // fires on first load AND after every setStyle (theme change)
      map.on("style.load", addCityLayers);

      // Tap a POI, station, stop, hub or gate -> place card (name + Google
      // Maps). A tap on empty map closes it. Bound by layer id, so it keeps
      // working after layers are re-added on theme change.
      const tappable = ["lyr-kesfet-poi-poi", "lyr-ihtiyac-poi", "lyr-omurga-node",
                        "lyr-omurga-stop", "lyr-omurga-hub", "lyr-varis-gate"];
      tappable.forEach(id => {
        map.on("click", id, e => {
          const f = e.features && e.features[0];
          if (!f) return;
          const [lng, lat] = f.geometry.coordinates;
          showPlaceCard(f.properties._name || f.properties.name || "", lng, lat);
        });
        map.on("mouseenter", id, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", id, () => { map.getCanvas().style.cursor = ""; });
      });
      map.on("click", "osmnotes-pt", e => {
        const f = e.features && e.features[0];
        if (!f) return;
        const [lng, lat] = f.geometry.coordinates;
        showPlaceCard(f.properties.name || "OSM note", lng, lat);
      });
      // hovering a note shows its text in a small tooltip (desktop)
      let notePopup = null;
      map.on("mousemove", "osmnotes-pt", e => {
        const f = e.features && e.features[0];
        if (!f) return;
        map.getCanvas().style.cursor = "pointer";
        let txt = f.properties.name || "OSM note";
        if (txt.length > 220) txt = txt.slice(0, 220) + "…";
        if (!notePopup) notePopup = new maplibregl.Popup({
          closeButton: false, closeOnClick: false, offset: 10,
          maxWidth: "260px", className: "notepopup" });
        notePopup.setLngLat(f.geometry.coordinates).setText(txt).addTo(map);
      });
      map.on("mouseleave", "osmnotes-pt", () => {
        map.getCanvas().style.cursor = "";
        if (notePopup) notePopup.remove();
      });
      map.on("click", e => {
        if (longPressFired) { longPressFired = false; return; } // keep the long-press card open
        const live = tappable.concat(["osmnotes-pt"]).filter(id => map.getLayer(id));
        if (!live.length) return;
        const hits = map.queryRenderedFeatures(e.point, { layers: live });
        if (!hits.length) hidePlaceCard();
      });

      // Long-press anywhere on the map -> place card for that spot (coords),
      // whose Google Maps button hands the point over. Cancelled by movement,
      // a second finger (pinch) or map pan/zoom.
      const canvas = map.getCanvas();
      let lpTimer = null, lpStart = null, lpPointers = 0;
      const lpCancel = () => { clearTimeout(lpTimer); lpTimer = null; lpStart = null; };
      canvas.addEventListener("pointerdown", e => {
        lpPointers++;
        if (lpPointers > 1) { lpCancel(); return; }
        lpStart = { x: e.clientX, y: e.clientY };
        clearTimeout(lpTimer);
        lpTimer = setTimeout(() => {
          if (!lpStart) return;
          const rect = canvas.getBoundingClientRect();
          const ll = map.unproject([lpStart.x - rect.left, lpStart.y - rect.top]);
          longPressFired = true;
          dropCoordPin(ll.lng, ll.lat, false);
          showPlaceCard("", ll.lng, ll.lat);
          lpStart = null;
        }, 550);
      });
      canvas.addEventListener("pointermove", e => {
        if (lpStart && Math.hypot(e.clientX - lpStart.x, e.clientY - lpStart.y) > 8) lpCancel();
      });
      ["pointerup", "pointercancel"].forEach(t =>
        canvas.addEventListener(t, () => { lpPointers = Math.max(0, lpPointers - 1); if (!lpPointers) clearTimeout(lpTimer); lpStart = null; }));
      map.on("movestart", lpCancel);
      map.on("zoomstart", lpCancel);

      // Mobile hardening: if the container wasn't sized at init (screen still
      // transitioning), the map fits to 0×0 and over-zooms. Resize + fit once
      // the container has real dimensions, and resize on every orientation change.
      map.on("load", () => { map.resize(); fitHome(false); });
      const area = document.getElementById("maparea");
      const ro = new ResizeObserver(() => {
        if (!map) return;
        map.resize();
        if (!mapFitted && area.clientWidth > 0 && area.clientHeight > 0) {
          mapFitted = true;
          fitHome(false);
        }
      });
      ro.observe(area);
    }

    clearInterval(clockTimer);
    clockTimer = setInterval(tickClock, 10000);
    tickClock();
    loadLiveData(); // weather + USD rate, best-effort (non-blocking)
  }

  /* ── city layers (GeoJSON overlays over the basemap) ── */
  const LINE_COLORS = {
    "metro-a": "#C9682F", "metro-b": "#3D69A8", "metro-c": "#4F8A5F",
    "tram": "#6F6390", "rail": "#8D8272", "bus": "#A67C42", "train": "#5F7A94"
  };
  // POI marker tones: Keşfet = shades of lilac, İhtiyaç = shades of terracotta.
  // One hue per group, so the map reads as two families at a glance.
  const THEME_COLORS = {
    "kamu": "#4A3970", "tarihi": "#5F4A8C", "otel": "#7460A3", "modern": "#8A76B8",
    "doga": "#9F8CCA", "gastronomi": "#B3A2D9", "alisveris": "#C6B8E6", "yurt": "#8A5FA0",
    "hastane": "#B34F39", "eczane": "#C1654B", "kiralik-arac": "#CE7A5E",
    "yakit": "#DA8F72", "market": "#E4A487", "muze": "#EDB99D", "kutuphane": "#F4CDB4"
  };
  const poiColorExpr = ["match", ["get", "theme"],
    ...Object.entries(THEME_COLORS).flat(), "#B9A6DC"];
  // Zone colors — one color per zone TYPE (turistik/ticari/egitim/dogal)
  const BTYPE_COLORS = { "turistik": "#B85C6E", "ticari": "#5B8FBF", "egitim": "#B8863F", "dogal": "#5E9A6B" };
  const districtColorExpr = ["match", ["get", "btype"],
    ...Object.entries(BTYPE_COLORS).flat(), "#B9A6DC"];
  const PALETTE = {
    light: { ink: "#3E3A45", inkSoft: "#8B8494", surface: "#FFFFFF", halo: "#F0EBE6", lilac: "#B9A6DC", peach: "#F2BBA8", linkStrong: "#7C5FB0" },
    dark:  { ink: "#EDE9F2", inkSoft: "#9A93A6", surface: "#2C2833", halo: "#2A2631", lilac: "#C4B2E4", peach: "#E8B39E", linkStrong: "#9B85CC" }
  };
  // Transit sub-types inside the Hatlar (omurga) group, toggled from the
  // metro/tram/bus disclosure under the chip. Metromare (lineRef "rail")
  // rides with the metro toggle — it's the metro-like coastal line.
  const TRANSIT_REFS = { metro: ["metro-a", "metro-b", "metro-c", "rail"], tram: ["tram"], bus: ["bus"], train: ["train"] };
  const transitState = { metro: true, tram: true, bus: true, train: true };

  // Keşfet: theme chips filter the POIs; the crowd icon toggles the zone wash.
  const themeState = new Set();   // active POI themes; empty -> no POIs shown
  const ihState = new Set();      // active İhtiyaç categories; empty -> hidden
  const bolgeState = {};          // bolge layerId -> visible? (drawer chips, per layer)

  const cityData = {};          // layerId -> raw FeatureCollection
  const groupState = {};        // groupId -> visible?
  const baseFilters = {};       // full layer id -> its kind filter (before transit filtering)

  async function loadCityData(cityId) {
    // Only fetch layers marked available, so unfinished ones don't 404 in console.
    const all = [...new Set(manifest.groups.flatMap(g => g.layers))];
    const files = manifest.available ? all.filter(f => manifest.available.includes(f)) : all;
    await Promise.all(files.map(async f => {
      try {
        const res = await fetch(`data/${cityId}/layers/${f}.geojson`);
        if (res.ok) cityData[f] = await res.json();
      } catch { /* layer not ready yet -> skip silently */ }
    }));
    manifest.groups.forEach(g => { groupState[g.id] = !!g.defaultOn; });
  }

  // Inject language-resolved label fields, so MapLibre text-field can read them.
  function localize(fc) {
    return {
      type: "FeatureCollection",
      features: fc.features.map(f => {
        const p = f.properties;
        return { ...f, properties: {
          ...p,
          _name: p.nameKey ? t(p.nameKey) : (p.name || ""),
          _sub: p.subKey ? t(p.subKey) : ""
        }};
      })
    };
  }

  // Line/station colour is data-driven: a feature may carry its own `color`
  // (from the OSM `colour` tag), so a city with many lines shows each in its
  // real hue with no code change. Falls back to the lineRef palette (Rome).
  const lineRefColorExpr = ["match", ["get", "lineRef"],
    "metro-a", LINE_COLORS["metro-a"], "metro-b", LINE_COLORS["metro-b"],
    "metro-c", LINE_COLORS["metro-c"], "tram", LINE_COLORS["tram"],
    "rail", LINE_COLORS["rail"], "bus", LINE_COLORS["bus"],
    "train", LINE_COLORS["train"], "#B5ADA0"];
  const lineColorExpr = ["case",
    ["all", ["has", "color"], ["!=", ["get", "color"], ""]], ["get", "color"],
    lineRefColorExpr];

  // Gate glyphs (plane/train/bus/ship) rendered onto canvas -> map images.
  // Stroke paths reuse the app's 24x24 line-icon language; plane is a fill glyph.
  const GATE_GLYPHS = {
    plane: { fill: "M21 15l-8-4V4.5C13 3.7 12.3 3 11.5 3S10 3.7 10 4.5V11l-8 4v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4.5l8 2.5z" },
    train: { strokes: ["M6 14V8c0-3 2.5-4.5 6-4.5s6 1.5 6 4.5v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z", "M6 11h12", "M8.5 21l1.7-3", "M15.5 21l-1.7-3"] },
    bus: { strokes: ["M6 4h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", "M4 11h16", "M8 21l1-4", "M16 21l-1-4"] },
    ship: { strokes: ["M4 15l2 4.5h12l2-4.5", "M4 15l8-2.5 8 2.5", "M12 12.5V4", "M12 5l5 2.5M12 5L7 7.5"] }
  };
  function makeGateIcons() {
    if (!map) return;
    const pal = PALETTE[theme];
    Object.entries(GATE_GLYPHS).forEach(([mode, g]) => {
      const c = document.createElement("canvas");
      c.width = 92; c.height = 92;
      const x = c.getContext("2d");
      x.beginPath(); x.arc(46, 46, 42, 0, Math.PI * 2);
      x.fillStyle = pal.surface; x.fill();
      x.lineWidth = 4; x.strokeStyle = pal.inkSoft; x.stroke();
      x.translate(19.6, 19.6); x.scale(2.2, 2.2);
      x.lineWidth = 1.6; x.lineCap = "round"; x.lineJoin = "round";
      x.strokeStyle = pal.ink; x.fillStyle = pal.ink;
      if (g.fill) x.fill(new Path2D(g.fill));
      (g.strokes || []).forEach(d => x.stroke(new Path2D(d)));
      const id = "gate-" + mode;
      if (map.hasImage(id)) map.removeImage(id);
      map.addImage(id, x.getImageData(0, 0, 92, 92), { pixelRatio: 2 });
    });
  }

  function addCityLayers() {
    if (!map || !manifest) return;
    const pal = PALETTE[theme];
    makeGateIcons();
    addSkeletonLabels();   // pale place names first, so our overlays sit on top
    Object.keys(cityData).forEach(layerId => {
      const src = "lyr-" + layerId;
      // idempotent: drop any stale copy so this is safe on every style.load
      map.getStyle().layers.forEach(l => { if (l.id.startsWith(src) && map.getLayer(l.id)) map.removeLayer(l.id); });
      if (map.getSource(src)) map.removeSource(src);
      map.addSource(src, { type: "geojson", data: localize(cityData[layerId]) });

      const add = (suffix, spec) => {
        baseFilters[src + suffix] = spec.filter; // remember for transit filtering
        map.addLayer(Object.assign({ id: src + suffix, source: src }, spec));
      };

      // gate -> center connector (dashed lilac)
      add("-link", { type: "line", filter: ["==", ["get", "kind"], "link"],
        paint: { "line-color": pal.linkStrong, "line-width": 3, "line-dasharray": [1, 2.2], "line-opacity": 0.95 },
        layout: { "line-cap": "round" } });
      // regional rail (FL trains) — drawn beneath metro/tram/bus, thin
      add("-railline", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["==", ["get", "lineRef"], "train"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": lineColorExpr, "line-opacity": 0.9,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.2, 14, 2.6] } });
      // transit lines (metro/tram/bus/rail — not the FL train network)
      add("-line", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["!=", ["get", "lineRef"], "train"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": lineColorExpr,
          "line-width": ["interpolate", ["linear"], ["zoom"],
            10, ["match", ["get", "lineRef"], "rail", 1.6, "tram", 2.2, "bus", 1.4, 2.8],
            14, ["match", ["get", "lineRef"], "rail", 2.4, "tram", 3.6, "bus", 2.4, 5]] } });
      // historic-center ring + dot
      add("-center", { type: "circle", filter: ["==", ["get", "kind"], "center"],
        paint: { "circle-radius": 9, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": pal.peach, "circle-stroke-width": 2 } });
      add("-center-dot", { type: "circle", filter: ["==", ["get", "kind"], "center"],
        paint: { "circle-radius": 2.6, "circle-color": pal.peach } });
      // stations (metro + Metromare) — grow with zoom
      add("-node", { type: "circle", filter: ["==", ["get", "kind"], "node"],
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 13, 4.5, 16, 6],
          "circle-color": pal.surface, "circle-stroke-color": lineColorExpr, "circle-stroke-width": 2 } });
      // tram/bus stops — small, appear from z12.5, tappable like stations
      add("-stop", { type: "circle", filter: ["==", ["get", "kind"], "stop"], minzoom: 12.5,
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 12.5, 1.8, 16, 4],
          "circle-color": pal.surface, "circle-stroke-color": lineColorExpr, "circle-stroke-width": 1.4,
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 12.5, 0, 13.2, 1],
          "circle-stroke-opacity": ["interpolate", ["linear"], ["zoom"], 12.5, 0, 13.2, 1] } });
      add("-stop-label", { type: "symbol", filter: ["==", ["get", "kind"], "stop"], minzoom: 15,
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"], "text-size": 9.5,
          "text-anchor": "top", "text-offset": [0, 0.6], "text-optional": true },
        paint: { "text-color": pal.inkSoft, "text-halo-color": pal.halo, "text-halo-width": 1.2 } });
      // Termini hub
      add("-hub", { type: "circle", filter: ["==", ["get", "kind"], "hub"],
        paint: { "circle-radius": 7, "circle-color": pal.surface, "circle-stroke-color": pal.ink, "circle-stroke-width": 2.5 } });
      // gates: mode icon (plane/train/bus/ship)
      add("-gate", { type: "symbol", filter: ["==", ["get", "kind"], "gate"],
        layout: { "icon-image": ["concat", "gate-", ["get", "mode"]],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 0.55, 13, 0.75],
          "icon-allow-overlap": true } });
      // C east hint dot
      add("-hint", { type: "circle", filter: ["==", ["get", "kind"], "hint"],
        paint: { "circle-radius": 3, "circle-color": pal.inkSoft } });
      // line ref badges (A/B/C letters, tram + bus numbers)
      add("-badge", { type: "circle", filter: ["==", ["get", "kind"], "badge"],
        paint: { "circle-radius": ["case", [">", ["length", ["get", "ref"]], 1], 10, 9],
          "circle-color": lineColorExpr, "circle-stroke-color": pal.surface, "circle-stroke-width": 1.6 } });
      add("-badge-label", { type: "symbol", filter: ["==", ["get", "kind"], "badge"],
        layout: { "text-field": ["get", "ref"], "text-font": ["Noto Sans Regular"],
          "text-size": ["case", [">", ["length", ["get", "ref"]], 2], 9, 12], "text-allow-overlap": true },
        paint: { "text-color": "#ffffff" } });
      // important place labels (hub, center, hint) — always visible so the map
      // never reads as anonymous: only the landmarks that orient a newcomer.
      add("-label", { type: "symbol",
        filter: ["all", ["==", ["get", "lab"], 1],
          ["any", ["==", ["get", "kind"], "hub"], ["==", ["get", "kind"], "center"], ["==", ["get", "kind"], "hint"]]],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"],
          "text-size": ["match", ["get", "kind"], "hub", 13, 11],
          "text-anchor": "top", "text-offset": [0, 0.7], "text-optional": true },
        paint: { "text-color": ["match", ["get", "kind"], "hint", pal.inkSoft, pal.ink],
          "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
      // station names (nodes) — the crowd; only surface once the user zooms in
      // to read a neighbourhood, so the far view stays uncluttered.
      add("-node-label", { type: "symbol",
        filter: ["all", ["==", ["get", "lab"], 1], ["==", ["get", "kind"], "node"]], minzoom: 12.8,
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"], "text-size": 10.5,
          "text-anchor": "top", "text-offset": [0, 0.7], "text-optional": true },
        paint: { "text-color": pal.ink, "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
      // gate / hub subtitles (the arrival answer)
      add("-sub", { type: "symbol",
        filter: ["any", ["==", ["get", "kind"], "gate"], ["==", ["get", "kind"], "hub"]],
        layout: { "text-field": ["get", "_sub"], "text-font": ["Noto Sans Regular"],
          "text-size": 9.5, "text-anchor": "top", "text-offset": [0, 2.0], "text-optional": true },
        paint: { "text-color": pal.inkSoft, "text-halo-color": pal.halo, "text-halo-width": 1.2 } });
      // Yaşam: district areas (soft lilac wash + short label) + sub-center axis
      add("-axis", { type: "line", filter: ["==", ["get", "kind"], "axis"],
        paint: { "line-color": pal.lilac, "line-width": 1.2, "line-dasharray": [2, 3], "line-opacity": 0.5 } });
      add("-district", { type: "fill", filter: ["==", ["get", "kind"], "district"],
        paint: { "fill-color": districtColorExpr, "fill-opacity": 0.18 } });
      add("-district-line", { type: "line", filter: ["==", ["get", "kind"], "district"],
        paint: { "line-color": districtColorExpr, "line-width": 1.4, "line-opacity": 0.65 } });
      add("-district-label", { type: "symbol", filter: ["==", ["get", "kind"], "district-label"],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"], "text-size": 11.5, "text-optional": true },
        paint: { "text-color": pal.ink, "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
      // Keşfet/İhtiyaç: POI markers + labels (stroke tone = theme family)
      add("-poi", { type: "circle", filter: ["==", ["get", "kind"], "poi"],
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3.5, 14, 5.5],
          "circle-color": pal.surface, "circle-stroke-color": poiColorExpr, "circle-stroke-width": 2 } });
      add("-poi-label", { type: "symbol", filter: ["==", ["get", "kind"], "poi"],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"], "text-size": 11,
          "text-anchor": "top", "text-offset": [0, 0.7], "text-optional": true },
        paint: { "text-color": pal.ink, "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
    });
    // Layers are added in fetch-resolution order, so pin depth explicitly:
    // area washes (district fills + crowd wash) sink to the bottom, POI markers rise to the top.
    const washes = ["lyr-bolge-turistik-district", "lyr-bolge-ticari-district",
      "lyr-bolge-egitim-district", "lyr-bolge-dogal-district"];
    washes.forEach(fillId => {
      if (!map.getLayer(fillId)) return;
      const firstOther = map.getStyle().layers.find(l => l.id.startsWith("lyr-") && !washes.includes(l.id));
      if (firstOther) map.moveLayer(fillId, firstOther.id);
    });
    ["lyr-kesfet-poi-poi", "lyr-kesfet-poi-poi-label", "lyr-ihtiyac-poi", "lyr-ihtiyac-poi-label"].forEach(id => {
      if (map.getLayer(id)) map.moveLayer(id); // no beforeId -> move to top
    });
    // gate icons are larger than the old dots -> push their labels down a bit
    if (map.getLayer("lyr-varis-label")) map.setLayoutProperty("lyr-varis-label", "text-offset", [0, 1.2]);
    if (map.getLayer("lyr-varis-sub")) map.setLayoutProperty("lyr-varis-sub", "text-offset", [0, 2.5]);
    applyGroupVisibility();
    applyTransitFilter();
    applyKesfetVisibility();
    applyIhtiyacVisibility();
    applyBolgeVisibility();
    addOverlayExtras();
  }

  // Show only the transit sub-types currently enabled. Features without a
  // lineRef (hubs, historic center) ride along while ANY type is on; when the
  // user turns everything off, the whole backbone disappears — no stray dots
  // or labels left on an otherwise empty map.
  function applyTransitFilter() {
    if (!map) return;
    const refPreds = [];
    Object.keys(TRANSIT_REFS).forEach(t => {
      if (transitState[t]) TRANSIT_REFS[t].forEach(r => refPreds.push(["==", ["get", "lineRef"], r]));
    });
    const anyOn = refPreds.length > 0;
    const pred = ["any", ["!", ["has", "lineRef"]], ...refPreds];
    ["-railline", "-line", "-node", "-stop", "-stop-label", "-badge", "-badge-label",
     "-label", "-node-label", "-hub", "-center", "-center-dot", "-hint", "-sub"].forEach(suf => {
      const id = "lyr-omurga" + suf;
      if (!map.getLayer(id)) return;
      map.setLayoutProperty(id, "visibility", anyOn ? "visible" : "none");
      if (!anyOn) return;
      const base = baseFilters[id];
      map.setFilter(id, base ? ["all", base, pred] : pred);
    });
  }

  function groupOf(layerId) {
    const g = manifest.groups.find(gr => gr.layers.includes(layerId));
    return g ? g.id : null;
  }
  function applyGroupVisibility() {
    if (!map) return;
    Object.keys(cityData).forEach(layerId => {
      const g = groupOf(layerId);
      if (g === "kesfet" || g === "bolgeler" || g === "ihtiyaclar") return; // owned by their own visibility fns
      const vis = groupState[g] ? "visible" : "none";
      map.getStyle().layers.forEach(l => {
        if (l.id.startsWith("lyr-" + layerId)) map.setLayoutProperty(l.id, "visibility", vis);
      });
    });
  }

  // City zones toggle per layer from the left-edge drawer, independent of
  // the group machinery (like Keşfet).
  function applyBolgeVisibility() {
    if (!map) return;
    ["bolge-turistik", "bolge-ticari", "bolge-egitim", "bolge-dogal"].forEach(layerId => {
      if (!cityData[layerId]) return;
      const vis = bolgeState[layerId] ? "visible" : "none";
      map.getStyle().layers.forEach(l => {
        if (l.id.startsWith("lyr-" + layerId)) map.setLayoutProperty(l.id, "visibility", vis);
      });
    });
  }

  // POIs show only for the picked themes (none picked -> hidden); the crowd
  // wash follows its own icon. Independent of the group on/off machinery.
  function applyKesfetVisibility() {
    if (!map) return;
    const themes = [...themeState];
    const poiVis = themes.length ? "visible" : "none";
    ["-poi", "-poi-label"].forEach(suf => {
      const id = "lyr-kesfet-poi" + suf;
      if (!map.getLayer(id)) return;
      map.setLayoutProperty(id, "visibility", poiVis);
      const base = baseFilters[id];
      const pred = ["any", ...themes.map(th => ["==", ["get", "theme"], th])];
      map.setFilter(id, themes.length ? ["all", base, pred] : base);
    });
    document.getElementById("bb-kesfet").classList.toggle("haslayers", themeState.size > 0);
  }

  // İhtiyaç POIs: same machinery as Keşfet, own category set.
  function applyIhtiyacVisibility() {
    if (!map) return;
    const cats = [...ihState];
    const vis = cats.length ? "visible" : "none";
    ["-poi", "-poi-label"].forEach(suf => {
      const id = "lyr-ihtiyac" + suf;
      if (!map.getLayer(id)) return;
      map.setLayoutProperty(id, "visibility", vis);
      const base = baseFilters[id];
      const pred = ["any", ...cats.map(c => ["==", ["get", "theme"], c])];
      map.setFilter(id, cats.length ? ["all", base, pred] : base);
    });
    document.getElementById("bb-ihtiyac").classList.toggle("haslayers", ihState.size > 0);
  }
  function refreshLayerLabels() { // on language change
    if (!map) return;
    Object.keys(cityData).forEach(layerId => {
      const s = map.getSource("lyr-" + layerId);
      if (s) s.setData(localize(cityData[layerId]));
    });
  }

  function leaveCity() {
    clearInterval(clockTimer);
    clockTimer = null;
    hidePlaceCard();
    if (typeof closeInfoCard === "function") closeInfoCard();
  }

  /* map chrome wiring (static elements, safe before map exists) */
  document.getElementById("zoom-in").onclick = () => map && map.zoomIn();
  document.getElementById("zoom-out").onclick = () => map && map.zoomOut();
  /* basemap menu + overlay toggles */
  const basemapMenu = document.getElementById("basemapmenu");
  function closeBasemapMenu() {
    basemapMenu.classList.remove("show");
    basemapMenu.hidden = true;
    document.getElementById("basemapbtn").setAttribute("aria-expanded", "false");
  }
  document.getElementById("basemapbtn").onclick = function () {
    if (basemapMenu.hidden) {
      updateBasemapMenu();
      basemapMenu.hidden = false;
      requestAnimationFrame(() => basemapMenu.classList.add("show"));
      this.setAttribute("aria-expanded", "true");
      closeCoordBox();
    } else closeBasemapMenu();
  };
  document.querySelectorAll("#basemapmenu .bmopt").forEach(b => {
    b.onclick = () => { applyBasemap(b.dataset.bm); };
  });
  document.getElementById("tog-notes").onclick = async function () {
    notesOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", notesOn);
    if (notesOn) await fetchNotes();
    addOverlayExtras();
  };
  document.getElementById("tog-gps").onclick = function () {
    gpsOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", gpsOn);
    addOverlayExtras();
  };
  document.getElementById("tog-walk").onclick = async function () {
    walkOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", walkOn);
    if (walkOn) { await fetchWalk(); showToast(t("base.walk.hint")); }
    addOverlayExtras();
  };

  /* coordinate box: paste "lat, lon" -> fly there + place card */
  const coordBox = document.getElementById("coordbox");
  const coordInput = document.getElementById("coordinput");
  function closeCoordBox() {
    coordBox.classList.remove("show");
    coordBox.hidden = true;
  }
  document.getElementById("coordbtn").onclick = function () {
    if (coordBox.hidden) {
      coordBox.hidden = false;
      requestAnimationFrame(() => { coordBox.classList.add("show"); coordInput.focus(); });
      closeBasemapMenu();
    } else closeCoordBox();
  };
  function tryGoCoord() {
    if (!map || !manifest) return;
    const m = coordInput.value.match(/(-?\d{1,3}(?:\.\d+)?)[,;\s]+(-?\d{1,3}(?:\.\d+)?)/);
    if (!m) return;
    let lat = +m[1], lon = +m[2];
    const [[w, s], [e, n]] = manifest.maxBounds;
    const ok = (la, lo) => la > s && la < n && lo > w && lo < e;
    if (!ok(lat, lon)) { if (ok(lon, lat)) { const tmp = lat; lat = lon; lon = tmp; } else return; }
    map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 15) });
    dropCoordPin(lon, lat, true);
    showPlaceCard("", lon, lat);
  }
  /* temporary pin marking a chosen point (coordinate jump or long-press);
     clears on the next user-driven map move */
  let coordPin = null;
  function dropCoordPin(lon, lat, afterFly) {
    if (coordPin) { coordPin.remove(); coordPin = null; }
    const el = document.createElement("div");
    el.className = "coord-pin";
    coordPin = new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map);
    const clear = () => { if (coordPin) { coordPin.remove(); coordPin = null; } };
    // after a flyTo: wait for it to settle, THEN arm on the next real move.
    // long-press (no camera move): arm on the next move straight away.
    if (afterFly) map.once("moveend", () => { map.once("movestart", clear); });
    else map.once("movestart", clear);
  }
  coordInput.addEventListener("keydown", e => { if (e.key === "Enter") tryGoCoord(); });
  coordInput.addEventListener("paste", () => setTimeout(tryGoCoord, 0));
  document.getElementById("coordgo").onclick = tryGoCoord;

  const zoomctl = document.getElementById("zoomctl");
  document.getElementById("zoom-home").onclick = () => {
    // no hover on touch: first tap reveals the hidden +/−/pan stack
    if (matchMedia("(hover: none)").matches && !zoomctl.classList.contains("open")) {
      zoomctl.classList.add("open");
      return;
    }
    fitHome(true);
  };

  /* grab-pan: press the hand button and drag to move the map, no mouse-drag on
     the map needed. Pointer capture keeps it tracking outside the button. */
  const panbtn = document.getElementById("panbtn");
  let panLast = null;
  panbtn.addEventListener("pointerdown", e => {
    if (!map) return;
    panbtn.setPointerCapture(e.pointerId);
    panLast = { x: e.clientX, y: e.clientY };
    panbtn.classList.add("active");
    e.preventDefault();
  });
  panbtn.addEventListener("pointermove", e => {
    if (!panLast || !map) return;
    const dx = e.clientX - panLast.x, dy = e.clientY - panLast.y;
    panLast = { x: e.clientX, y: e.clientY };
    map.panBy([-dx, -dy], { duration: 0 }); // grab feel: drag hand = drag map
  });
  function endPan() { if (panLast) { panLast = null; panbtn.classList.remove("active"); } }
  panbtn.addEventListener("pointerup", endPan);
  panbtn.addEventListener("pointercancel", endPan);

  document.getElementById("locbtn").onclick = function () {
    if (!map || !navigator.geolocation) return;
    const btn = this;
    if (meMarker) { // toggle off
      meMarker.remove(); meMarker = null;
      btn.setAttribute("aria-pressed", "false");
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const lngLat = [pos.coords.longitude, pos.coords.latitude];
      const inside =
        lngLat[0] > manifest.maxBounds[0][0] && lngLat[0] < manifest.maxBounds[1][0] &&
        lngLat[1] > manifest.maxBounds[0][1] && lngLat[1] < manifest.maxBounds[1][1];
      if (!inside) { showToast(t("loc.outside")); return; }
      const el = document.createElement("div");
      el.className = "me-marker";
      meMarker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
      btn.setAttribute("aria-pressed", "true");
      map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 13) });
    }, () => { /* permission denied -> stay quiet */ });
  };

  /* Girişler chip -> toggle its whole layer group */
  document.querySelectorAll("#topchips .mchip[data-group]").forEach(b => {
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      groupState[b.dataset.group] = on;
      applyGroupVisibility();
    };
  });
  /* Hatlar chip -> reveal metro/tram/bus icons; each icon toggles that transit type */
  const lineMenu = document.getElementById("linemenu");
  document.getElementById("chip-omurga").onclick = function () {
    const open = lineMenu.hidden;
    if (open) closeSheets();            // don't leave a bottom sheet open behind it
    lineMenu.hidden = !open;
    this.setAttribute("aria-expanded", open);
  };
  // Hatlar stays "active" (lilac) as long as at least one transit line is on.
  function updateOmurgaActive() {
    const any = Object.keys(TRANSIT_REFS).some(t => transitState[t]);
    document.getElementById("chip-omurga").setAttribute("aria-pressed", any);
  }
  document.querySelectorAll("#linemenu .lchip").forEach(b => {
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      transitState[b.dataset.transit] = on;
      applyTransitFilter();
      updateOmurgaActive();
    };
  });
  /* zone drawer chips -> toggle the matching zone layer */
  document.querySelectorAll("#drawer .dchip").forEach(b => {
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      bolgeState[b.dataset.layer] = on;
      applyBolgeVisibility();
    };
  });
  const drawerwrap = document.getElementById("drawerwrap");
  function closeDrawer() {
    if (!drawerwrap.classList.contains("open")) return;
    drawerwrap.classList.remove("open");
    document.getElementById("drawertab").setAttribute("aria-expanded", "false");
  }
  document.getElementById("drawertab").onclick = function () {
    const open = drawerwrap.classList.toggle("open");
    this.setAttribute("aria-expanded", open);
    if (open) { closeSheets(); closeLineMenu(); closeInfoCard(); } // don't leave other menus open behind it
  };

  /* city info card (künye): language, currency, editorial price table */
  const infoCard = document.getElementById("infocard");
  const PRICE_ORDER = ["water05", "petrol1l", "milk1l", "meat1kg", "cheese1kg",
    "beer05", "bigmac", "espresso", "transitTicket", "airportTrain"];
  const CURRENCY_SYM = { EUR: "€", USD: "$", GBP: "£", TRY: "₺", JPY: "¥" };
  function renderInfoCard() {
    if (!manifest) return;
    document.getElementById("ic-city").textContent = document.getElementById("cb-name").textContent;
    const lk = "lang." + (manifest.language || "");
    document.getElementById("ic-lang").textContent = t(lk) !== lk ? t(lk) : (manifest.language || "—");
    const sym = CURRENCY_SYM[manifest.currency] || (manifest.currency ? manifest.currency + " " : "");
    document.getElementById("ic-currency").textContent =
      (manifest.currency || "—") + (fxToUsd ? ` · 1${sym} ≈ $${fxToUsd.toFixed(2)}` : "");
    const P = manifest.prices || {};
    document.getElementById("ic-prices").innerHTML = PRICE_ORDER
      .filter(k => typeof P[k] === "number")
      .map(k => `<div class="ic-price"><span>${t("price." + k)}</span><span>${sym}${P[k].toFixed(2)}</span></div>`)
      .join("");
    // 5-day forecast (hidden if weather didn't load)
    const wxEl = document.getElementById("ic-weather");
    if (weatherData && weatherData.daily && weatherData.daily.time) {
      const d = weatherData.daily, loc = lang === "tr" ? "tr-TR" : "en-GB";
      wxEl.innerHTML = d.time.map((iso, i) => {
        const day = new Intl.DateTimeFormat(loc, { weekday: "short", timeZone: manifest.timezone }).format(new Date(iso + "T12:00"));
        return `<div class="ic-wx"><span class="ic-wd">${day}</span>` +
          `<span class="ic-wi">${wxSvg(wxKey(d.weather_code[i]))}</span>` +
          `<span class="ic-wt">${Math.round(d.temperature_2m_min[i])}° / ${Math.round(d.temperature_2m_max[i])}°</span></div>`;
      }).join("");
    } else { wxEl.innerHTML = ""; }
    document.getElementById("ic-updated").textContent = P.updated ? t("info.updated") + " " + P.updated : "";
  }
  function closeInfoCard() {
    if (infoCard.hidden) return;
    infoCard.classList.remove("show");
    infoCard.hidden = true;
    document.getElementById("citybar").setAttribute("aria-expanded", "false");
  }
  document.getElementById("citybar").onclick = function () {
    if (infoCard.hidden) {
      renderInfoCard();
      closeSheets(); closeLineMenu(); closeDrawer();
      infoCard.hidden = false;
      requestAnimationFrame(() => infoCard.classList.add("show"));
      this.setAttribute("aria-expanded", "true");
    } else { closeInfoCard(); }
  };
  document.getElementById("ic-close").onclick = closeInfoCard;
  function closeSheets() {
    document.querySelectorAll(".sheet").forEach(s => s.classList.remove("show"));
    document.querySelectorAll("#bottombar [aria-expanded]").forEach(b => b.setAttribute("aria-expanded", "false"));
  }
  function toggleSheet(id, btn) {
    const s = document.getElementById(id);
    const show = !s.classList.contains("show");
    closeSheets();
    closeLineMenu();                     // don't leave the Hatlar icons open behind it
    if (show) { s.classList.add("show"); btn.setAttribute("aria-expanded", "true"); }
  }
  document.getElementById("bb-kesfet").onclick = function () { toggleSheet("sheet-kesfet", this); };
  document.getElementById("bb-ihtiyac").onclick = function () { toggleSheet("sheet-ihtiyac", this); };

  // Close any open pop-up menu (Hatlar icons, Keşfet/İhtiyaç sheets) when the
  // user taps the map or anywhere outside the menu and its trigger button.
  function closeLineMenu() {
    if (lineMenu.hidden) return;
    lineMenu.hidden = true;
    document.getElementById("chip-omurga").setAttribute("aria-expanded", "false");
  }
  document.addEventListener("click", e => {
    if (e.target.closest("#sheet-kesfet, #sheet-ihtiyac, #linemenu, #drawer, #infocard, #basemapmenu, #coordbox, #langmenu")) return; // inside a menu
    if (e.target.closest("#bb-kesfet, #bb-ihtiyac, #chip-omurga, #drawertab, #citybar, #basemapbtn, #coordbtn, #langbtn")) return; // a trigger toggles itself
    closeSheets();
    closeLineMenu();
    closeDrawer();
    closeInfoCard();
    closeBasemapMenu();
    closeCoordBox();
    closeLangMenu();
    if (!e.target.closest("#zoomctl")) zoomctl.classList.remove("open");
  });
  document.querySelectorAll(".sheet .chip").forEach(b => {
    b.onclick = () => {
      {
        const on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", on);
        if (b.dataset.th) {                       // Keşfet theme chip -> filter POIs
          if (on) themeState.add(b.dataset.th); else themeState.delete(b.dataset.th);
          applyKesfetVisibility();
        } else if (b.dataset.ih) {                // İhtiyaç category chip -> filter need points
          if (on) ihState.add(b.dataset.ih); else ihState.delete(b.dataset.ih);
          applyIhtiyacVisibility();
        }
      }
    };
  });

  /* ── router ────────────────────────────── */
  const scrWorld = document.getElementById("scr-world");
  const scrCity = document.getElementById("scr-city");

  function route() {
    const id = location.hash.replace(/^#\/?/, "");
    const city = cities.find(c => c.id === id && c.status === "ready");
    if (city) {
      scrWorld.classList.remove("on");
      scrCity.classList.add("on");
      document.body.classList.add("city");
      enterCity(city);
    } else {
      if (id) history.replaceState(null, "", "#/"); // unknown city -> world
      leaveCity();
      scrCity.classList.remove("on");
      scrWorld.classList.add("on");
      document.body.classList.remove("city");
      if (typeof resetWorldZoom === "function") resetWorldZoom();
    }
  }
  window.addEventListener("hashchange", route);
  document.getElementById("homebtn").onclick = () => { location.hash = "#/"; };

  /* ── boot ──────────────────────────────── */
  async function boot() {
    applyTheme();
    await Promise.all([loadDict(FALLBACK_LANG), loadDict(lang)]);
    const res = await fetch("data/cities.json");
    cities = res.ok ? (await res.json()).cities : [];
    applyI18n();
    renderWorld();
    route();
  }
  boot();
})();
