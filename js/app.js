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
    if (map) {
      // setStyle wipes custom layers; 'style.load' only fires on first load in
      // this MapLibre build, so re-add explicitly once the new style settles.
      map.setStyle(`assets/basemap-${theme}.json`);
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
    SUPPORTED_LANGS.forEach(code => {
      const btn = document.getElementById("lang-" + code);
      if (btn) btn.setAttribute("aria-pressed", code === lang);
    });
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
  }
  SUPPORTED_LANGS.forEach(code => {
    const btn = document.getElementById("lang-" + code);
    if (btn) btn.onclick = () => setLang(code);
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

  function basemapUrl() {
    return `assets/basemap-${theme}.json`;
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
        style: basemapUrl(),
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
      const tappable = ["lyr-kesfet-poi-poi", "lyr-omurga-node", "lyr-omurga-stop",
                        "lyr-omurga-hub", "lyr-varis-gate"];
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
      map.on("click", e => {
        if (longPressFired) { longPressFired = false; return; } // keep the long-press card open
        const live = tappable.filter(id => map.getLayer(id));
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
  }

  /* ── city layers (GeoJSON overlays over the basemap) ── */
  const LINE_COLORS = {
    "metro-a": "#E08A5B", "metro-b": "#6E93C4", "metro-c": "#7FA98A",
    "tram": "#A8A0B5", "rail": "#B5ADA0", "bus": "#C9AE85", "train": "#8FA1B3"
  };
  const PALETTE = {
    light: { ink: "#3E3A45", inkSoft: "#8B8494", surface: "#FFFFFF", halo: "#F0EBE6", lilac: "#B9A6DC", peach: "#F2BBA8" },
    dark:  { ink: "#EDE9F2", inkSoft: "#9A93A6", surface: "#2C2833", halo: "#2A2631", lilac: "#C4B2E4", peach: "#E8B39E" }
  };
  // Transit sub-types inside the Hatlar (omurga) group, toggled from the
  // metro/tram/bus disclosure under the chip. Metromare (lineRef "rail")
  // rides with the metro toggle — it's the metro-like coastal line.
  const TRANSIT_REFS = { metro: ["metro-a", "metro-b", "metro-c", "rail"], tram: ["tram"], bus: ["bus"], train: ["train"] };
  const transitState = { metro: true, tram: true, bus: true, train: true };

  // Keşfet: theme chips filter the POIs; the crowd icon toggles the zone wash.
  const themeState = new Set();   // active POI themes; empty -> no POIs shown
  let crowdOn = false;            // crowded-zone wash visible?
  const yasamState = {};          // yasam layerId -> visible? (drawer chips, per layer)

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

  const lineColorExpr = ["match", ["get", "lineRef"],
    "metro-a", LINE_COLORS["metro-a"], "metro-b", LINE_COLORS["metro-b"],
    "metro-c", LINE_COLORS["metro-c"], "tram", LINE_COLORS["tram"],
    "rail", LINE_COLORS["rail"], "bus", LINE_COLORS["bus"],
    "train", LINE_COLORS["train"], "#B5ADA0"];

  function addCityLayers() {
    if (!map || !manifest) return;
    const pal = PALETTE[theme];
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
        paint: { "line-color": pal.lilac, "line-width": 2.4, "line-dasharray": [1, 2.5], "line-opacity": 0.85 },
        layout: { "line-cap": "round" } });
      // regional rail (FL trains) — drawn beneath metro/tram/bus, thin
      add("-railline", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["==", ["get", "lineRef"], "train"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": LINE_COLORS.train, "line-opacity": 0.85,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.8, 14, 2] } });
      // transit lines (metro/tram/bus/rail — not the FL train network)
      add("-line", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["!=", ["get", "lineRef"], "train"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": lineColorExpr,
          "line-width": ["interpolate", ["linear"], ["zoom"],
            10, ["match", ["get", "lineRef"], "rail", 1.4, "tram", 1.8, "bus", 1.2, 2.6],
            14, ["match", ["get", "lineRef"], "rail", 2, "tram", 3, "bus", 2.2, 5]] } });
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
      // gates
      add("-gate", { type: "circle", filter: ["==", ["get", "kind"], "gate"],
        paint: { "circle-radius": 7, "circle-color": pal.surface, "circle-stroke-color": pal.inkSoft, "circle-stroke-width": 1.6 } });
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
      // place labels (nodes, hub, gates, center, hint)
      add("-label", { type: "symbol",
        filter: ["all", ["==", ["get", "lab"], 1], ["!=", ["get", "kind"], "badge"]],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"],
          "text-size": ["match", ["get", "kind"], "hub", 13, 11],
          "text-anchor": "top", "text-offset": [0, 0.7], "text-optional": true },
        paint: { "text-color": ["match", ["get", "kind"], "hint", pal.inkSoft, pal.ink],
          "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
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
        paint: { "fill-color": pal.lilac, "fill-opacity": 0.16 } });
      add("-district-line", { type: "line", filter: ["==", ["get", "kind"], "district"],
        paint: { "line-color": pal.lilac, "line-width": 1, "line-opacity": 0.55 } });
      add("-district-label", { type: "symbol", filter: ["==", ["get", "kind"], "district-label"],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"], "text-size": 11.5, "text-optional": true },
        paint: { "text-color": pal.ink, "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
      // Keşfet: crowded-zone wash (soft fill, no crisp border — interpretation, not cadastre)
      add("-fill", { type: "fill", filter: ["==", ["get", "kind"], "area"],
        paint: { "fill-color": pal.peach, "fill-opacity": 0.20 } });
      add("-area-label", { type: "symbol", filter: ["==", ["get", "kind"], "area-label"],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"],
          "text-size": 11, "text-optional": true },
        paint: { "text-color": pal.inkSoft, "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
      // Keşfet: POI markers + labels
      add("-poi", { type: "circle", filter: ["==", ["get", "kind"], "poi"],
        paint: { "circle-radius": 5, "circle-color": pal.surface, "circle-stroke-color": pal.lilac, "circle-stroke-width": 2 } });
      add("-poi-label", { type: "symbol", filter: ["==", ["get", "kind"], "poi"],
        layout: { "text-field": ["get", "_name"], "text-font": ["Noto Sans Regular"], "text-size": 11,
          "text-anchor": "top", "text-offset": [0, 0.7], "text-optional": true },
        paint: { "text-color": pal.ink, "text-halo-color": pal.halo, "text-halo-width": 1.4 } });
    });
    // Layers are added in fetch-resolution order, so pin depth explicitly:
    // area washes (district fills + crowd wash) sink to the bottom, POI markers rise to the top.
    const washes = ["lyr-yasam-otel-district", "lyr-yasam-konut-district",
      "lyr-yasam-altmerkez-district", "lyr-yasam-ogrenci-district", "lyr-kesfet-yogunluk-fill"];
    washes.forEach(fillId => {
      if (!map.getLayer(fillId)) return;
      const firstOther = map.getStyle().layers.find(l => l.id.startsWith("lyr-") && !washes.includes(l.id));
      if (firstOther) map.moveLayer(fillId, firstOther.id);
    });
    ["lyr-kesfet-poi-poi", "lyr-kesfet-poi-poi-label"].forEach(id => {
      if (map.getLayer(id)) map.moveLayer(id); // no beforeId -> move to top
    });
    applyGroupVisibility();
    applyTransitFilter();
    applyKesfetVisibility();
    applyYasamVisibility();
  }

  // Show only the transit sub-types currently enabled. Features without a
  // lineRef (hub, historic center, hint labels) are always kept.
  function applyTransitFilter() {
    if (!map) return;
    const refPreds = [];
    Object.keys(TRANSIT_REFS).forEach(t => {
      if (transitState[t]) TRANSIT_REFS[t].forEach(r => refPreds.push(["==", ["get", "lineRef"], r]));
    });
    const pred = ["any", ["!", ["has", "lineRef"]], ...refPreds];
    ["-railline", "-line", "-node", "-stop", "-stop-label", "-badge", "-badge-label", "-label"].forEach(suf => {
      const id = "lyr-omurga" + suf;
      if (!map.getLayer(id)) return;
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
      if (g === "kesfet" || g === "yasam") return; // owned by their own visibility fns
      const vis = groupState[g] ? "visible" : "none";
      map.getStyle().layers.forEach(l => {
        if (l.id.startsWith("lyr-" + layerId)) map.setLayoutProperty(l.id, "visibility", vis);
      });
    });
  }

  // Yaşam districts toggle per layer from the right-edge drawer, independent of
  // the group machinery (like Keşfet).
  function applyYasamVisibility() {
    if (!map) return;
    ["yasam-otel", "yasam-konut", "yasam-altmerkez", "yasam-ogrenci"].forEach(layerId => {
      if (!cityData[layerId]) return;
      const vis = yasamState[layerId] ? "visible" : "none";
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
    ["-fill", "-area-label"].forEach(suf => {
      const id = "lyr-kesfet-yogunluk" + suf;
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", crowdOn ? "visible" : "none");
    });
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
  }

  /* map chrome wiring (static elements, safe before map exists) */
  document.getElementById("zoom-in").onclick = () => map && map.zoomIn();
  document.getElementById("zoom-out").onclick = () => map && map.zoomOut();
  document.getElementById("zoom-home").onclick = () => fitHome(true);

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
  /* Yaşam drawer chips -> toggle the matching district layer */
  document.querySelectorAll("#drawer .dchip").forEach(b => {
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      yasamState[b.dataset.layer] = on;
      applyYasamVisibility();
    };
  });
  const drawerwrap = document.getElementById("drawerwrap");
  document.getElementById("drawertab").onclick = function () {
    const open = drawerwrap.classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  };
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
    if (e.target.closest("#sheet-kesfet, #sheet-ihtiyac, #linemenu")) return; // inside a menu
    if (e.target.closest("#bb-kesfet, #bb-ihtiyac, #chip-omurga")) return;    // a trigger toggles itself
    closeSheets();
    closeLineMenu();
  });
  document.querySelectorAll(".sheet .chip, #stars button").forEach(b => {
    b.onclick = () => {
      if (b.dataset.b) { // budget stars: single-select with re-tap to clear
        const v = +b.dataset.b;
        const cur = +(document.getElementById("stars").dataset.budget || 0);
        const next = cur === v ? 0 : v;
        document.getElementById("stars").dataset.budget = next;
        document.querySelectorAll("#stars button").forEach(x =>
          x.classList.toggle("on", next > 0 && +x.dataset.b <= next));
        // TODO(E8): filter kesfet/yasam/ihtiyac by budget
      } else {
        const on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", on);
        if (b.dataset.th) {                       // Keşfet theme chip -> filter POIs
          if (on) themeState.add(b.dataset.th); else themeState.delete(b.dataset.th);
          applyKesfetVisibility();
        } else if (b.id === "chip-yog") {         // crowded-zone wash
          crowdOn = on;
          applyKesfetVisibility();
        }
        // TODO(E6): İhtiyaç (data-ih) chips toggle need-category points
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
