/* layers of city — app core (E1)
   Static, framework-free. Routes: #/ (world picker) and #/<cityId>.
   All user-facing text comes from i18n/<lang>.json (see docs/VERI.md). */

(function () {
  "use strict";

  const SUPPORTED_LANGS = ["tr", "en", "de", "fr", "it", "es"];
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
    const res = await fetch(`i18n/${code}.json?v=${BM_VER}`);
    dicts[code] = res.ok ? await res.json() : {};
    return dicts[code];
  }

  // City-specific strings (gate/hub/center labels) live in
  // data/<city>/content/<lang>.json and are merged on top of the global
  // dictionary while that city is open. Keeps i18n/<lang>.json small as
  // cities grow, and avoids one file everyone downloads ballooning.
  let cityContent = {};     // lang -> key/value for the active city
  let contentCityId = null; // which city cityContent belongs to
  async function loadCityContent(cityId, code) {
    try {
      const res = await fetch(`data/${cityId}/content/${code}.json?v=${BM_VER}`);
      return res.ok ? await res.json() : {};
    } catch { return {}; }
  }
  async function setCityContent(cityId) {
    contentCityId = cityId;
    cityContent = {};
    for (const code of [...new Set([lang, FALLBACK_LANG])]) {
      cityContent[code] = await loadCityContent(cityId, code);
    }
  }

  function t(key) {
    return (cityContent[lang] && cityContent[lang][key]) ||
           (cityContent[FALLBACK_LANG] && cityContent[FALLBACK_LANG][key]) ||
           (dicts[lang] && dicts[lang][key]) ||
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
    if (contentCityId) await setCityContent(contentCityId); // city labels follow language
    applyI18n();
    renderCities(); // names + soon-labels follow the active language
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

  // Delegated navigation: markers are re-rendered on every zoom, so bind the
  // handlers to the (persistent) svg rather than to each city group.
  worldSvg.addEventListener("click", e => {
    const g = e.target.closest("[data-city]");
    if (g) location.hash = "#/" + g.dataset.city;
  });
  worldSvg.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = e.target.closest("[data-city]");
    if (g) { e.preventDefault(); location.hash = "#/" + g.dataset.city; }
  });

  // Equirectangular projection matching the dot grid (1000x500 canvas)
  function project(lon, lat) {
    return [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500];
  }

  // Auto-place a city label so it clears every dot and every already-placed
  // label. The search fans a label *outward* from the local pack (away from the
  // centroid of nearby dots) and takes the nearest collision-free slot, so a
  // dense cluster (İstanbul/İzmir, or the Europe knot) reads cleanly at any
  // zoom without hand-tuned offsets. All sizes are in *user units* and passed in
  // by the caller: markers keep a constant on-screen size (see renderCities), so
  // the geometry the placer works in shrinks as the map zooms in and clusters
  // spread apart, staying legible.
  const boxHit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  function labelBox(ax, ay, anchor, w, fs) {
    let x0 = ax;
    if (anchor === "end") x0 = ax - w;
    else if (anchor === "middle") x0 = ax - w / 2;
    return { x0, y0: ay - fs * 0.8, x1: x0 + w, y1: ay + fs * 0.25 };
  }

  // Direction to push a label: away from the mean pull of nearby city dots.
  // Uses fixed dot positions (independent of zoom), so the fan-out is stable.
  function outwardDir(x, y) {
    let vx = 0, vy = 0;
    for (const c of cities) {
      const [ox, oy] = project(c.lon, c.lat);
      const dx = x - ox, dy = y - oy, d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < 3600) { const d = Math.sqrt(d2); vx += dx / d; vy += dy / d; }
    }
    return (vx === 0 && vy === 0) ? 0 : Math.atan2(vy, vx);
  }

  const LBL_RINGS = [1.3, 1.7, 2.2, 2.8, 3.5, 4.4, 5.5, 6.8, 8.2]; // × font, near → far
  const LBL_STEP = Math.PI / 8;                                    // 16 directions/ring
  function placeLabel(x, y, w, fs, obstacles) {
    const base = outwardDir(x, y);
    // angles fanned out from the outward direction: base, base±step, base±2step…
    const angles = [];
    for (let k = 0; k < 16; k++) angles.push(base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * LBL_STEP);
    for (const m of LBL_RINGS) {
      const r = m * fs;
      for (const a of angles) {
        const dx = r * Math.cos(a), dy = r * Math.sin(a);
        const anchor = dx > fs * 0.5 ? "start" : dx < -fs * 0.5 ? "end" : "middle";
        // nudge the baseline down a touch so side labels sit centred on the ray
        const ax = x + dx, ay = y + dy + fs * 0.28, box = labelBox(ax, ay, anchor, w, fs);
        if (!obstacles.some(o => boxHit(o, box))) return { ax, ay, anchor, box };
      }
    }
    const ax = x + fs * 1.3, ay = y + fs * 0.5; // last resort (rings are large enough this never hits)
    return { ax, ay, anchor: "start", box: labelBox(ax, ay, "start", w, fs) };
  }

  // Opening frame. Desktop shows the whole world (static). Mobile (touch) keeps
  // the SAME whole-world map but *lands zoomed on Africa*, European cities up
  // top — a fuller, more inviting splash. Since the full world is still there,
  // pinching out (down to the whole world) and panning reach New York, Tokyo
  // and every other city. The zoom is a transform, not a viewBox crop.
  const isMobileSplash = () => matchMedia("(hover: none) and (pointer: coarse)").matches;
  const AFR = { x0: 408, y0: 70, w: 260 };     // Africa+Europe window in the dot-grid canvas
  const VB = { x: 40, y: 16, w: 920, h: 400 }; // the map's SVG viewBox
  // reset the frame if the device crosses the mobile/desktop breakpoint
  matchMedia("(hover: none) and (pointer: coarse)").addEventListener("change", () => {
    if (typeof resetWorldZoom === "function") resetWorldZoom();
  });

  // City name for the active language (falls back to English, then the raw id).
  function cityLabel(c) {
    return (c.names && (c.names[lang] || c.names[FALLBACK_LANG])) || c.name;
  }

  // On-screen target sizes (CSS px) for a city marker. renderCities converts
  // these to user units for the current zoom so the marker looks the same size
  // at every zoom level — see renderCities.
  const CITY_TXT = 14, CITY_SOON_TXT = 12, CITY_CORE = 8.5, CITY_HALO = 20,
        CITY_HIT = 34, CITY_SOOND = 5, CITY_STROKE = 2, CITY_CW = 0.56;

  let cityLayer = null, cityRenderScale = -1, cityRenderRAF = 0;

  // Grey world dots are map fabric — drawn once and left to scale with the map.
  function renderWorldDots() {
    let html = "";
    for (let i = 0; i < WORLD_DOTS.length; i += 2)
      html += `<circle class="worlddot" cx="${WORLD_DOTS[i]}" cy="${WORLD_DOTS[i + 1]}" r="1.4"/>`;
    worldSvg.innerHTML = html;
    cityLayer = document.createElementNS(SVG_NS, "g");
    cityLayer.setAttribute("id", "citylayer");
    worldSvg.appendChild(cityLayer);
  }

  // City dots + names, redrawn at a constant on-screen size. `u` is user units
  // per on-screen pixel at the current zoom; every size/offset is multiplied by
  // it, so the map (grey dots, land) grows on zoom-in while the city markers stay
  // put — dots pull apart and names re-flow to keep clear of each other. Re-run
  // on zoom, language change and layout resize.
  function renderCities() {
    if (!cityLayer) return;
    const mw = worldMapLayer.clientWidth;
    if (!mw) return; // no layout yet — retried after first frame / on zoom
    const u = VB.w / mw / wScale;
    cityRenderScale = wScale;
    const fs = CITY_TXT * u, soonFs = CITY_SOON_TXT * u;
    const coreR = CITY_CORE * u, haloR = CITY_HALO * u, hitR = CITY_HIT * u,
          soonR = CITY_SOOND * u, stroke = CITY_STROKE * u;

    // Every dot is an obstacle sized to its halo (so labels clear the ring);
    // placed labels join the list so later labels dodge earlier ones. Ready
    // cities first (their names matter most), then soon cities fill the gaps.
    const obstacles = cities.map(c => {
      const [x, y] = project(c.lon, c.lat);
      return { x0: x - haloR, y0: y - haloR, x1: x + haloR, y1: y + haloR };
    });
    const ordered = [...cities].sort((a, b) => (b.status === "ready") - (a.status === "ready"));

    let html = "";
    ordered.forEach(c => {
      const [x, y] = project(c.lon, c.lat);
      const ready = c.status === "ready";
      const name = cityLabel(c);
      const label = ready ? name : `${name} · ${t("world.soon")}`;
      const f = ready ? fs : soonFs;
      const w = label.length * CITY_CW * f;
      const p = placeLabel(x, y, w, f, obstacles);
      obstacles.push(p.box);
      html += ready
        ? `<g class="city-ready" role="button" tabindex="0" data-city="${c.id}">
             <circle class="hit" cx="${x}" cy="${y}" r="${hitR}" fill="transparent"/>
             <circle class="halo" cx="${x}" cy="${y}" r="${haloR}"/>
             <circle class="core" cx="${x}" cy="${y}" r="${coreR}" stroke-width="${stroke}"/>
             <text x="${p.ax}" y="${p.ay}" text-anchor="${p.anchor}" font-size="${f}">${name}</text>
           </g>`
        : `<g class="city-soon">
             <circle cx="${x}" cy="${y}" r="${soonR}"/>
             <text x="${p.ax}" y="${p.ay}" text-anchor="${p.anchor}" font-size="${f}">${label}</text>
           </g>`;
    });
    cityLayer.innerHTML = html;
  }

  // Re-render markers after a zoom change (rAF-throttled; a pan leaves the scale
  // untouched so it is skipped). Panning moves markers with the map for free.
  function scheduleCityRender() {
    if (cityRenderRAF) return;
    cityRenderRAF = requestAnimationFrame(() => {
      cityRenderRAF = 0;
      if (cityRenderScale < 0 || Math.abs(wScale - cityRenderScale) / cityRenderScale > 0.02)
        renderCities();
    });
  }

  /* ── world zoom (touch only, i.e. mobile): the dotted map scales/pans behind
        a fixed-size wordmark. Only the map (#worldwrap) is transformed, so the
        logotype stays put at its layout size; the pan/clamp math is relative to
        the map's own rest box. Desktop has no touch, so the map keeps identity
        transform and the current framing is preserved untouched. ── */
  const worldMapLayer = document.getElementById("worldwrap");
  const worldSurface = document.getElementById("scr-world");
  const mapClip = document.getElementById("mapclip"); // visible (clipped) viewport
  let wScale = 1, wX = 0, wY = 0, wMode = null, wStartDist = 0, wStartScale = 1, wMid = null, wPan = null;
  // rest box of the map (layout size/position, unaffected by the transform)
  let wBoxW = 0, wBoxH = 0;
  const W_MAX = 6;
  function wApply() {
    worldMapLayer.style.transform = wScale === 1 && wX === 0 && wY === 0
      ? "" : `translate(${wX}px,${wY}px) scale(${wScale})`;
    scheduleCityRender(); // keep marker sizes constant as the map zooms
  }
  function wClamp() {
    wScale = Math.max(1, Math.min(W_MAX, wScale));
    // Horizontal: the map fills the clip width, so keep it covering its footprint.
    wX = Math.max(wBoxW * (1 - wScale), Math.min(0, wX));
    // Vertical: on mobile the clip (#mapclip) is taller than the map's rest box,
    // so clamp against the *clip*, not the map. When the scaled map is taller
    // than the clip it must cover it; when it is shorter (zoomed out), let it pan
    // freely between the clip's top and bottom instead of pinning to the top edge.
    const clipH = mapClip.clientHeight || wBoxH;
    const spanH = wScale * wBoxH;
    wY = spanH >= clipH
      ? Math.max(clipH - spanH, Math.min(0, wY))     // cover the clip
      : Math.max(0, Math.min(clipH - spanH, wY));    // free within the clip
  }
  // Frame the whole-world map on Africa (mobile opening view). Computed from the
  // map's live pixel size, so it's identical on every device. Returns false if
  // the map has no layout size yet (retried after layout).
  function frameAfrica() {
    const mw = worldMapLayer.clientWidth;
    if (!mw) return false;
    const mh = mw * VB.h / VB.w;
    wBoxW = mw; wBoxH = mh;
    wScale = Math.min(VB.w / AFR.w, W_MAX);      // fit the Africa window to the width
    wX = -wScale * (AFR.x0 - VB.x) / VB.w * mw;
    wY = -wScale * (AFR.y0 - VB.y) / VB.h * mh;
    wClamp(); wApply();
    return true;
  }
  function resetWorldZoom() {
    if (isMobileSplash() && frameAfrica()) return; // mobile home = Africa frame
    wScale = 1; wX = 0; wY = 0; wBoxW = wBoxH = 0; wApply();
  }
  const wDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  // Derive the map's rest box (top-left + size in surface coords) from the
  // current rendered rect and the active transform, then return the pinch
  // focal point relative to that rest top-left.
  function wFocal(t) {
    const r = worldMapLayer.getBoundingClientRect(), s = worldSurface.getBoundingClientRect();
    wBoxW = r.width / wScale; wBoxH = r.height / wScale;
    const restX = (r.left - s.left) - wX, restY = (r.top - s.top) - wY;
    return { x: (t[0].clientX + t[1].clientX) / 2 - s.left - restX,
             y: (t[0].clientY + t[1].clientY) / 2 - s.top - restY };
  }
  worldSurface.addEventListener("touchstart", e => {
    if (e.touches.length === 2) { wMode = "pinch"; wStartDist = wDist(e.touches); wStartScale = wScale; wMid = wFocal(e.touches); e.preventDefault(); }
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
    } else if (wMode === "pan" && e.touches.length === 1 &&
               (wScale > 1 || mapClip.clientHeight > wScale * wBoxH + 1)) {
      // pan when zoomed in, or when the map is shorter than the clip and can
      // still slide vertically (so a zoomed-out map isn't stuck at the top)
      e.preventDefault();
      wX = e.touches[0].clientX - wPan.x; wY = e.touches[0].clientY - wPan.y;
      wClamp(); wApply();
    }
  }, { passive: false });
  worldSurface.addEventListener("touchend", e => { if (e.touches.length === 0) wMode = null; });

  /* Desktop (mouse): wheel zooms the map toward the cursor, drag pans once
     zoomed in. Same transform-only model as the touch path — the wordmark
     stays fixed, only #worldwrap scales/pans inside its clip box. Touch
     devices keep the pinch path above and are skipped here. */
  // recompute the map's rest box + return the cursor point relative to its top-left
  function wCursorFocal(clientX, clientY) {
    const r = worldMapLayer.getBoundingClientRect(), s = worldSurface.getBoundingClientRect();
    wBoxW = r.width / wScale; wBoxH = r.height / wScale;
    const restX = (r.left - s.left) - wX, restY = (r.top - s.top) - wY;
    return { x: clientX - s.left - restX, y: clientY - s.top - restY };
  }
  worldSurface.addEventListener("wheel", e => {
    if (isMobileSplash()) return; // touch devices use the pinch path
    e.preventDefault();
    const f = wCursorFocal(e.clientX, e.clientY);
    let ns = wScale * Math.exp(-e.deltaY * 0.0015);
    ns = Math.max(1, Math.min(W_MAX, ns));
    wX = f.x - (f.x - wX) * (ns / wScale); // zoom around the cursor
    wY = f.y - (f.y - wY) * (ns / wScale);
    wScale = ns; wClamp(); wApply();
  }, { passive: false });
  let wMouse = null;
  worldSurface.addEventListener("mousedown", e => {
    if (isMobileSplash() || wScale <= 1 || e.button !== 0) return;
    wMouse = { x: e.clientX - wX, y: e.clientY - wY };
    worldMapLayer.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", e => {
    if (!wMouse) return;
    wX = e.clientX - wMouse.x; wY = e.clientY - wMouse.y; wClamp(); wApply();
  });
  window.addEventListener("mouseup", () => {
    if (!wMouse) return;
    wMouse = null; worldMapLayer.style.cursor = "";
  });

  /* ── city screen: map + chrome ─────────── */
  let map = null;
  let manifest = null;      // data/<city>/city.json
  let clockTimer = null;
  let meMarker = null;
  let mapFitted = false;    // has the map fit to home once it had real size?
  let pendingShare = null;  // shared point/list from the URL, applied once the map is ready
  let resizeObs = null;     // ResizeObserver on the map area; torn down with the map
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
  // Human label for a point's TYPE (line/mode or POI theme), reusing existing
  // i18n labels; simple one word (transit.* / th.* / ih.* / pt.*).
  const GATE_PT = { plane: "air", train: "rail", bus: "road", ship: "ship" };
  function featureTypeLabel(p, layerId) {
    const k = p.kind;
    if (k === "node" || k === "stop") return t("transit." + (p.lineRef || "metro"));
    if (k === "hub") return t("pt.hub");
    if (k === "gate") return t("pt." + (GATE_PT[p.mode] || "rail"));
    if (k === "poi") {
      const ih = layerId && layerId.indexOf("ihtiyac") >= 0;
      let th = p.theme;
      if (ih && th === "kiralik-arac") th = "kiralama"; // key uses "kiralama"
      return t((ih ? "ih." : "th.") + th);
    }
    return "";
  }

  function showPlaceCard(name, lng, lat, note, type) {
    // Drop a Google Maps pin at the EXACT tapped coordinates (q=lat,lng), with
    // the label as the pin text — no text search, so it never snaps to a
    // same-named place or a nearby street. Unlabeled points get a bare pin.
    // For a saved point the user's own note is the label (note > name > coords,
    // same order the saved-list uses), so the card shows what they wrote.
    const ll = lat.toFixed(6) + "," + lng.toFixed(6);
    const label = (note && note.trim()) || name || "";
    document.getElementById("pc-name").textContent =
      label || (lat.toFixed(5) + ", " + lng.toFixed(5));
    const pcType = document.getElementById("pc-type");
    pcType.textContent = type || "";
    pcType.hidden = !type;
    document.getElementById("pc-dir").href =
      "https://www.google.com/maps?q=" + ll + (label ? "(" + encodeURIComponent(label) + ")" : "");
    // remember this point so the pencil can bookmark it; show a filled pencil
    // when it is already saved
    pcPoint = { lng, lat, name: name || "", note: note || "" };
    const already = loadBookmarks().some(b => bmRound(b.lng) === bmRound(lng) && bmRound(b.lat) === bmRound(lat));
    document.getElementById("pc-edit").setAttribute("aria-pressed", already ? "true" : "false");
    placeCard.hidden = false;
    requestAnimationFrame(() => placeCard.classList.add("show"));
  }
  function hidePlaceCard() {
    placeCard.classList.remove("show");
    placeCard.hidden = true;
  }
  document.getElementById("pc-close").onclick = hidePlaceCard;

  /* ── basemap modes: sade (themed vector) / detay (OSM-look vector) / uydu ── */
  const BM_VER = "20260911-1"; // cache-bust for basemap styles + city/layer data
  let basemapMode = localStorage.getItem("loc-basemap") || "sade";
  if (basemapMode === "detay+uydu") basemapMode = "karma"; // legacy value
  if (!["sade", "detay", "uydu", "uyduhd", "karma"].includes(basemapMode)) basemapMode = "sade";
  // OSM layer opacity in the Karma (OSM + satellite) basemap
  let osmOpacity = parseFloat(localStorage.getItem("loc-osm-op"));
  if (!(osmOpacity >= 0.1 && osmOpacity <= 1)) osmOpacity = 0.55;
  const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
  function rasterStyle(tiles, attribution, paint) {
    // maxzoom 18: Esri has no imagery past z18 in many districts and serves
    // "Map data not yet available" placeholder tiles instead — cap requests
    // there and let MapLibre overzoom the last real level up to z19.
    return { version: 8, glyphs: GLYPHS,
      sources: { r: { type: "raster", tiles: [tiles], tileSize: 256, maxzoom: 18, attribution } },
      // brighter + crisper: lift shadows more and add a touch of contrast so
      // the imagery reads clearly instead of murky (user request 2026-07-14)
      layers: [{ id: "r", type: "raster", source: "r",
        paint: paint || { "raster-brightness-min": 0.24, "raster-contrast": 0.16, "raster-saturation": 0.12 } }] };
  }

  /* ── place-name skeleton: pale OSM labels shown on Sade + Uydu, independent
     of any layer toggle, so the map always "reads" as the city. One definition,
     laid over both basemaps from the live OpenFreeMap (omt) vector source. ── */
  const NAME = ["coalesce", ["get", "name:latin"], ["get", "name"]];
  // Label palette follows the basemap: the "sade" style is single-hue (sand),
  // so water/green/road labels are tints of that same hue, told apart by
  // lightness only — no competing blue/green.
  const SK_COLORS = {
    light: { ink: "#5C5348", strong: "#453E35", water: "#9A9080", green: "#8A8071", road: "#847A6C", halo: "#F4F0E9", hw: 1.5 },
    dark:  { ink: "#CFC6BA", strong: "#E6DFD4", water: "#8A8175", green: "#948B7D", road: "#A0968A", halo: "#221E1B", hw: 1.5 },
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
      /* Text detail grows with zoom (no icons, text only):
         far = districts (suburb) → closer = neighbourhoods (quarter/mahalle)
         → closer = street names (majors first, then all) → closest = building
         and landmark names. Each tier fades in at its own minzoom. */
      // major roads first (z13+)…
      { id: "sk-road-name", type: "symbol", source: "omt", "source-layer": "transportation_name",
        filter: ["in", "class", "motorway", "trunk", "primary", "secondary"], minzoom: 13,
        layout: { "text-field": NAME, "text-font": F, "symbol-placement": "line", "text-max-angle": 38,
          "text-size": ["interpolate", ["linear"], ["zoom"], 13, 10.5, 16, 12.5], "text-optional": true },
        paint: { "text-color": c.road, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.3 } },
      // …then every named street once close enough to walk it (z15+)
      { id: "sk-road-name-minor", type: "symbol", source: "omt", "source-layer": "transportation_name",
        filter: ["in", "class", "tertiary", "minor", "service", "path", "pedestrian", "track"], minzoom: 15,
        layout: { "text-field": NAME, "text-font": F, "symbol-placement": "line", "text-max-angle": 38,
          "text-size": ["interpolate", ["linear"], ["zoom"], 15, 10, 18, 12.5], "text-optional": true },
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
      // closest tier: every named building/venue, quiet small text (z16.5+)
      { id: "sk-poi-fine", type: "symbol", source: "omt", "source-layer": "poi", minzoom: 16.5,
        filter: [">", ["get", "rank"], 8],
        layout: { "text-field": NAME, "text-font": F, "text-anchor": "top", "text-offset": [0, 0.4],
          "text-max-width": 8, "symbol-sort-key": ["get", "rank"], "text-padding": 3,
          "text-size": ["interpolate", ["linear"], ["zoom"], 16.5, 10, 19, 12], "text-optional": true },
        paint: { "text-color": c.ink, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.4 } },
      // districts (ilçe) read from far away…
      { id: "sk-place-suburb", type: "symbol", source: "omt", "source-layer": "place",
        filter: ["==", "class", "suburb"], minzoom: 10,
        layout: { "text-field": NAME, "text-font": F, "text-letter-spacing": 0.08, "text-transform": "uppercase",
          "text-max-width": 8, "text-padding": 6, "text-size": ["interpolate", ["linear"], ["zoom"], 10, 11, 14, 14.5], "text-optional": true },
        paint: { "text-color": c.ink, "text-halo-color": c.halo, "text-halo-width": c.hw, "text-halo-blur": 0.4 } },
      // …neighbourhoods (mahalle) only once the user starts reading an area
      { id: "sk-place-hood", type: "symbol", source: "omt", "source-layer": "place",
        filter: ["in", "class", "quarter", "neighbourhood"], minzoom: 12.5,
        layout: { "text-field": NAME, "text-font": F, "text-letter-spacing": 0.06, "text-transform": "uppercase",
          "text-max-width": 8, "text-padding": 6, "text-size": ["interpolate", ["linear"], ["zoom"], 12.5, 10.5, 16, 13.5], "text-optional": true },
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
    if (!map || basemapMode === "detay" || basemapMode === "karma") return; // OSM etiketleri zaten var
    if (!map.getSource("omt")) map.addSource("omt", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
    const c = (basemapMode === "uydu" || basemapMode === "uyduhd") ? SK_COLORS.sat : SK_COLORS[theme];
    skeletonLabels(c).forEach(spec => {
      if (map.getLayer(spec.id)) map.removeLayer(spec.id);
      map.addLayer(spec);
    });
  }
  const ESRI_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const ESRI_ATTR = "Esri, Maxar, Earthstar Geographics";
  // "Uydu HD" = Esri World Imagery Clarity: a different, sharper capture of the
  // same areas (keyless, same attribution). It is not brighter everywhere —
  // sharper and lighter in Barcelona/Istanbul/Tokyo, darker in New York/Roma —
  // so it sits next to the plain satellite instead of replacing it. Its own
  // paint values: the imagery already carries contrast, so it needs less.
  const CLARITY_TILES = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const CLARITY_PAINT = { "raster-brightness-min": 0.28, "raster-contrast": 0.06, "raster-saturation": 0.10 };
  function basemapStyle() {
    // "detay" = official OSM Shortbread vector tiles (vector.openstreetmap.org),
    // local style copy with OpenFreeMap glyphs so no key is ever needed.
    if (basemapMode === "detay") return `assets/basemap-shortbread.json?v=${BM_VER}`;
    if (basemapMode === "uydu") return rasterStyle(ESRI_TILES, ESRI_ATTR);
    if (basemapMode === "uyduhd") return rasterStyle(CLARITY_TILES, ESRI_ATTR, CLARITY_PAINT);
    return `assets/basemap-${theme}.json?v=${BM_VER}`;
  }
  // "Karma" basemap: the Shortbread style with the satellite raster slid
  // underneath and the OSM layers faded via a slider. The imagery is Clarity
  // (Uydu HD) — under half-transparent OSM line work the sharper capture is
  // what carries the view.
  let shortbreadJson = null;
  async function hybridStyle() {
    if (!shortbreadJson) {
      const r = await fetch(`assets/basemap-shortbread.json?v=${BM_VER}`);
      shortbreadJson = await r.json();
    }
    const s = JSON.parse(JSON.stringify(shortbreadJson));
    s.sources.esri = { type: "raster", tiles: [CLARITY_TILES], tileSize: 256, maxzoom: 18, attribution: ESRI_ATTR };
    // raster sits above the flat background but below every OSM layer
    const bgIdx = s.layers.findIndex(l => l.type === "background");
    s.layers.splice(bgIdx + 1, 0, { id: "esri-hybrid", type: "raster", source: "esri",
      paint: CLARITY_PAINT });
    return s;
  }
  // Fade the Shortbread area/line work so the imagery shows through; labels
  // stay solid so the map keeps reading. Applied on load and from the slider.
  function applyOsmOpacity() {
    if (!map || basemapMode !== "karma") return;
    const o = osmOpacity;
    map.getStyle().layers.forEach(l => {
      if (l.id === "esri-hybrid" || l.id.startsWith("lyr-") || l.id.startsWith("sk-") ||
          l.id === "gpstrace" || l.id.startsWith("walk") || l.id.startsWith("osmnotes")) return;
      try {
        if (l.type === "fill") map.setPaintProperty(l.id, "fill-opacity", o);
        else if (l.type === "line") map.setPaintProperty(l.id, "line-opacity", o);
        else if (l.type === "background") map.setPaintProperty(l.id, "background-opacity", 0);
        else if (l.type === "fill-extrusion") map.setPaintProperty(l.id, "fill-extrusion-opacity", o);
      } catch (e) { /* per-layer paint quirks -> skip */ }
    });
  }
  function updateBasemapMenu() {
    document.querySelectorAll("#basemapmenu .bmopt").forEach(b =>
      b.setAttribute("aria-pressed", b.dataset.bm === basemapMode));
    document.getElementById("osmoprow").hidden = basemapMode !== "karma";
  }
  function setMapStyle() {
    if (!map) return;
    if (basemapMode === "karma") {
      hybridStyle().then(s => {
        map.setStyle(s);
        map.once("idle", () => { applyOsmOpacity(); addCityLayers(); });
      });
    } else {
      map.setStyle(basemapStyle());
      map.once("idle", addCityLayers);
    }
  }
  function applyBasemap(mode) {
    basemapMode = mode;
    localStorage.setItem("loc-basemap", mode);
    updateBasemapMenu();
    setMapStyle(); // style.load doesn't refire after setStyle in this build -> re-add on idle
  }

  /* OSM notes + GPS traces overlays (keyless), toggleable on any basemap */
  let notesOn = false, gpsOn = false, notesData = null;
  // GPS-trace overlay opacity, user-tunable from a slider under its toggle
  let gpsOpacity = parseFloat(localStorage.getItem("loc-gps-op"));
  if (!(gpsOpacity >= 0.1 && gpsOpacity <= 1)) gpsOpacity = 0.7;
  /* street-character overlay: pedestrian-priority vs vehicle arteries (from OSM) */
  let walkOn = false, walkData = null;
  function addOverlayExtras() {
    if (!map) return;
    const firstLyr = (map.getStyle().layers.find(l => l.id.startsWith("lyr-")) || {}).id;
    if (gpsOn && !map.getSource("gpstrace")) {
      map.addSource("gpstrace", { type: "raster", tileSize: 256,
        tiles: ["https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png"] });
      map.addLayer({ id: "gpstrace", type: "raster", source: "gpstrace",
        paint: { "raster-opacity": gpsOpacity } }, firstLyr);
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

  /* ── saved points (bookmarks) ─────────────────────────────────────────────
     On-device only (localStorage), per city — no account, no server, matching
     the "preferences stay on the device, never sent" rule. Two independent
     commands live under the basemap menu: a visibility toggle (Kayıtlılar) and
     a list (Kayıtlılar listesi). A point is saved from the place-card pencil. */
  let savedOn = false;
  let pcPoint = null;   // {lng, lat, name} of the point currently in the place card
  let bmPopup = null;
  const bmRound = n => Math.round(n * 1e5);   // ~1 m match tolerance
  function bmKey() { return "loc-bm-" + (loadedCityId || (manifest && manifest.id) || "x"); }
  function loadBookmarks() {
    try { return JSON.parse(localStorage.getItem(bmKey())) || []; } catch { return []; }
  }
  function saveBookmarks(arr) { localStorage.setItem(bmKey(), JSON.stringify(arr)); }
  function bookmarksFC() {
    return { type: "FeatureCollection", features: loadBookmarks().map(b => ({
      type: "Feature", geometry: { type: "Point", coordinates: [b.lng, b.lat] },
      properties: { id: b.id, note: b.note || "", name: b.name || "" } })) };
  }
  // A filled peach star marker, distinct from the outlined POI circles. Redrawn
  // per theme (like the gate icons) so it re-registers on every style.load.
  function makeBookmarkIcon() {
    if (!map) return;
    const pal = PALETTE[theme];
    const c = document.createElement("canvas");
    c.width = 92; c.height = 92;
    const x = c.getContext("2d");
    x.beginPath(); x.arc(46, 46, 40, 0, Math.PI * 2);
    x.fillStyle = pal.peach; x.fill();
    x.lineWidth = 4; x.strokeStyle = pal.surface; x.stroke();
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + i * Math.PI / 5;
      const rad = i % 2 === 0 ? 20 : 8.2;
      const px = 46 + rad * Math.cos(ang), py = 46 + rad * Math.sin(ang);
      i === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.closePath(); x.fillStyle = pal.surface; x.fill();
    if (map.hasImage("bm-star")) map.removeImage("bm-star");
    map.addImage("bm-star", x.getImageData(0, 0, 92, 92), { pixelRatio: 2 });
  }
  function applyBookmarks() {
    if (!map) return;
    const src = "lyr-bm";
    if (map.getSource(src)) map.getSource(src).setData(bookmarksFC());
    if (savedOn) {
      if (!map.getSource(src)) map.addSource(src, { type: "geojson", data: bookmarksFC() });
      if (!map.getLayer("lyr-bm-dot")) {
        map.addLayer({ id: "lyr-bm-dot", type: "symbol", source: src,
          layout: { "icon-image": "bm-star",
            "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.42, 14, 0.6],
            "icon-allow-overlap": true } });
      }
    } else {
      if (map.getLayer("lyr-bm-dot")) map.removeLayer("lyr-bm-dot");
      if (map.getSource(src)) map.removeSource(src);
      if (bmPopup) { bmPopup.remove(); bmPopup = null; }
    }
  }
  function openBookmarkPopup(lng, lat, note, name) {
    if (!map) return;
    const txt = (note && note.trim()) || name || (lat.toFixed(5) + ", " + lng.toFixed(5));
    if (bmPopup) bmPopup.remove();
    bmPopup = new maplibregl.Popup({ offset: 14, closeButton: true, closeOnClick: true,
      maxWidth: "240px", className: "bmpopup" }).setLngLat([lng, lat]).setText(txt).addTo(map);
  }

  // Note editor (opened from the place-card pencil for the current pcPoint)
  const bmEdit = document.getElementById("bmedit");
  const bmEditText = document.getElementById("bmedit-text");
  function openBookmarkEditor() {
    if (!pcPoint) return;
    const ex = loadBookmarks().find(b => bmRound(b.lng) === bmRound(pcPoint.lng) && bmRound(b.lat) === bmRound(pcPoint.lat));
    bmEditText.value = ex ? (ex.note || "") : "";
    document.getElementById("bmedit-del").hidden = !ex;
    bmEdit.hidden = false;
    requestAnimationFrame(() => { bmEdit.classList.add("show"); bmEditText.focus(); });
  }
  function closeBookmarkEditor() { bmEdit.classList.remove("show"); bmEdit.hidden = true; }
  function enableSavedLayer() {
    savedOn = true;
    document.getElementById("tog-saved").setAttribute("aria-pressed", "true");
  }
  document.getElementById("pc-edit").onclick = openBookmarkEditor;
  document.getElementById("bmedit-cancel").onclick = closeBookmarkEditor;
  bmEdit.addEventListener("click", e => { if (e.target === bmEdit) closeBookmarkEditor(); });
  document.getElementById("bmedit-save").onclick = function () {
    if (!pcPoint) return closeBookmarkEditor();
    const note = bmEditText.value.trim();
    const arr = loadBookmarks();
    const ex = arr.find(b => bmRound(b.lng) === bmRound(pcPoint.lng) && bmRound(b.lat) === bmRound(pcPoint.lat));
    if (ex) ex.note = note;
    else arr.push({ id: "bm-" + Date.now(), lng: pcPoint.lng, lat: pcPoint.lat,
      name: pcPoint.name || "", note, createdAt: Date.now() });
    saveBookmarks(arr);
    closeBookmarkEditor();
    hidePlaceCard();
    enableSavedLayer();     // surface the new marker straight away
    applyBookmarks();
    showToast(t("bookmark.saved"));
  };
  document.getElementById("bmedit-del").onclick = function () {
    if (!pcPoint) return;
    saveBookmarks(loadBookmarks().filter(b => !(bmRound(b.lng) === bmRound(pcPoint.lng) && bmRound(b.lat) === bmRound(pcPoint.lat))));
    closeBookmarkEditor();
    hidePlaceCard();
    applyBookmarks();
    showToast(t("bookmark.removed"));
  };

  // Saved-points list
  const bmList = document.getElementById("bmlist");
  function closeBookmarkList() { bmList.classList.remove("show"); bmList.hidden = true; }
  function openBookmarkList() {
    renderBookmarkList();
    bmList.hidden = false;
    requestAnimationFrame(() => bmList.classList.add("show"));
  }
  function goToBookmark(b) {
    closeBookmarkList();
    if (!map) return;
    if (!savedOn) { enableSavedLayer(); applyBookmarks(); }
    map.flyTo({ center: [b.lng, b.lat], zoom: Math.max(map.getZoom(), 15) });
    // open the note straight away (popup is anchored to the point, so it rides
    // along with the camera) — avoids relying on a moveend that never fires when
    // the target equals the current view.
    openBookmarkPopup(b.lng, b.lat, b.note, b.name);
  }
  function renderBookmarkList() {
    const body = document.getElementById("bmlist-body");
    const arr = loadBookmarks().slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    if (!arr.length) { body.innerHTML = `<div class="bmlist-empty">${t("bookmark.empty")}</div>`; return; }
    body.innerHTML = "";
    arr.forEach(b => {
      const row = document.createElement("div");
      row.className = "bmrow";
      const go = document.createElement("button");
      go.className = "bmrow-go";
      const label = (b.note && b.note.trim()) || b.name || "";
      if (label) go.textContent = label;                    // textContent -> no injection
      else go.innerHTML = `<span class="bmrow-coord">${b.lat.toFixed(5)}, ${b.lng.toFixed(5)}</span>`;
      go.onclick = () => goToBookmark(b);
      const del = document.createElement("button");
      del.className = "bmrow-del";
      del.setAttribute("aria-label", t("bookmark.delete"));
      del.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>`;
      del.onclick = () => { saveBookmarks(loadBookmarks().filter(x => x.id !== b.id)); applyBookmarks(); renderBookmarkList(); };
      row.appendChild(go); row.appendChild(del);
      body.appendChild(row);
    });
  }
  document.getElementById("bmlist-close").onclick = closeBookmarkList;
  bmList.addEventListener("click", e => { if (e.target === bmList) closeBookmarkList(); });

  /* ── sharing ───────────────────────────────────────────────────────────────
     A shared point/list is a plain layersofcity.com link with the payload in the
     hash: `#/<city>?p=lat,lng&t=name` for one point, `#/<city>?list=<b64>` for the
     saved list. The receiver opens the link, the app parses it in route() and
     focuses the point (or imports the list on their own device). No server, no
     account — the whole payload rides in the URL, matching the static-site rule. */
  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlDecode(s) {
    try {
      s = s.replace(/-/g, "+").replace(/_/g, "/");
      const bin = atob(s);
      return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
    } catch { return ""; }
  }
  function shareBaseURL() {
    return location.origin + location.pathname + "#/" + (loadedCityId || "");
  }
  function pointShareURL(pt) {
    const params = new URLSearchParams();
    params.set("p", pt.lat.toFixed(6) + "," + pt.lng.toFixed(6));
    if (pt.name) params.set("t", pt.name);
    if (pt.note) params.set("n", pt.note);   // carries the note so the receiver keeps it
    if (pt.save) params.set("s", "1");        // it was a saved point -> receiver saves it too
    return shareBaseURL() + "?" + params.toString();
  }
  function listShareURL(arr) {
    const compact = arr.map(b => [+b.lat.toFixed(6), +b.lng.toFixed(6), b.name || "", b.note || ""]);
    return shareBaseURL() + "?list=" + b64urlEncode(JSON.stringify(compact));
  }
  // Native share sheet (mail, WhatsApp, …) when available; otherwise copy the
  // link to the clipboard, and as a last resort show it for manual copy.
  async function shareOrCopy(payload) {
    if (navigator.share) {
      try { await navigator.share(payload); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(payload.url); showToast(t("share.copied")); return; }
    catch (e) { /* clipboard blocked -> manual */ }
    window.prompt(t("share.copyManual"), payload.url);
  }
  document.getElementById("pc-share").onclick = () => {
    if (!pcPoint) return;
    // Pull the saved note even if the card was opened from a POI/long-press, so
    // sharing a point you've saved always carries your note to the receiver.
    const saved = loadBookmarks().find(b => bmRound(b.lng) === bmRound(pcPoint.lng) && bmRound(b.lat) === bmRound(pcPoint.lat));
    const name = pcPoint.name || "";
    const note = pcPoint.note || (saved && saved.note) || "";
    const coord = pcPoint.lat.toFixed(5) + ", " + pcPoint.lng.toFixed(5);
    const label = (note && note.trim()) || name || coord;
    const url = pointShareURL({ lat: pcPoint.lat, lng: pcPoint.lng, name, note, save: !!saved });
    shareOrCopy({ title: label, text: label + " — layers of city", url });
  };
  document.getElementById("bmlist-share").onclick = () => {
    const arr = loadBookmarks();
    if (!arr.length) { showToast(t("bookmark.empty")); return; }
    shareOrCopy({ title: t("share.listTitle"), text: t("share.listTitle"), url: listShareURL(arr) });
  };

  // Merge shared points into this device's saved list (dedup by ~1 m coordinate).
  // Returns how many were newly added.
  function mergeBookmarks(items) {
    const arr = loadBookmarks();
    let added = 0;
    items.forEach(item => {
      const dup = arr.some(b => bmRound(b.lng) === bmRound(item.lng) && bmRound(b.lat) === bmRound(item.lat));
      if (dup) return;
      arr.push({ id: "bm-" + Date.now() + "-" + added, lng: item.lng, lat: item.lat,
        name: item.name || "", note: item.note || "", createdAt: Date.now() + added });
      added++;
    });
    saveBookmarks(arr);
    return added;
  }
  // Adding the marker source needs a fully-loaded style; a shared link can land
  // before tiles finish, so defer until the style is ready (addSource would
  // otherwise throw "Style is not done loading").
  function showSavedMarkersWhenReady() {
    const addMarkers = () => { try { applyBookmarks(); } catch (e) { /* style gone */ } };
    if (map && map.isStyleLoaded()) addMarkers();
    else if (map) map.once("idle", addMarkers);
  }
  // Import a shared saved-list into this device and open the list.
  function importSharedList(list) {
    const added = mergeBookmarks(list);
    openBookmarkList();      // the list itself is the outcome — show it regardless of map state
    showToast(added ? t("share.imported") : t("share.importedNone"));
    enableSavedLayer();
    fitToPoints(list);
    showSavedMarkersWhenReady();
  }
  function fitToPoints(list) {
    if (!map || !list.length) return;
    if (list.length === 1) { map.flyTo({ center: [list[0].lng, list[0].lat], zoom: 15 }); return; }
    let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
    list.forEach(b => { w = Math.min(w, b.lng); e = Math.max(e, b.lng); s = Math.min(s, b.lat); n = Math.max(n, b.lat); });
    map.fitBounds([[w, s], [e, n]], { padding: 60, maxZoom: 15 });
  }
  // Consumed once the map for the shared city is ready (see enterCity).
  function applyPendingShare() {
    if (!pendingShare || !map) return;
    const share = pendingShare; pendingShare = null;
    if (share.list && share.list.length) {
      importSharedList(share.list);
    } else if (share.focus) {
      const { lat, lng, name, note, save } = share.focus;
      // If the sender shared a point they had saved, it becomes the receiver's
      // saved point too (deduped) — lands in their list and shows as a star.
      if (save) {
        const added = mergeBookmarks([{ lat, lng, name, note }]);
        enableSavedLayer();
        showSavedMarkersWhenReady();
        if (added) showToast(t("share.imported"));
      }
      map.flyTo({ center: [lng, lat], zoom: 16 });
      dropCoordPin(lng, lat, true);
      showPlaceCard(name, lng, lat, note);
    }
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

  let loadedCityId = null;  // which city's map is currently live
  async function enterCity(city) {
    // Switching straight from one city to another (e.g. an edited URL, without
    // passing through the world screen) must also rebuild the map from scratch.
    if (map && loadedCityId && loadedCityId !== city.id) leaveCity();
    document.getElementById("cb-name").textContent = city.name;
    const ph = document.getElementById("cityph");
    try {
      const res = await fetch(`data/${city.id}/city.json?v=${BM_VER}`);
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
    await setCityContent(city.id);   // city-specific i18n before labels resolve

    if (!map) {
      await loadCityData(city.id);   // fetch layer geojson before the map draws
      map = new maplibregl.Map({
        container: "map",
        style: basemapMode === "karma" ? await hybridStyle() : basemapStyle(),
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
      // Hover a point for a moment -> small popup with its type + name (desktop
      // only; touch shows the same on the place card when a point is tapped).
      const noHover = matchMedia("(hover: none)").matches;
      let typePop = null, typeTimer = null, typeKey = null;
      function clearHoverType() {
        typeKey = null; clearTimeout(typeTimer);
        if (typePop) { typePop.remove(); typePop = null; }
      }
      function onHoverType(e, id) {
        const f = e.features && e.features[0];
        if (!f) return;
        const c = f.geometry.coordinates;
        const key = id + ":" + c.join(",");
        if (key === typeKey) return;      // still on the same point
        typeKey = key;
        clearTimeout(typeTimer);
        if (typePop) { typePop.remove(); typePop = null; }
        const p = f.properties;
        typeTimer = setTimeout(() => {
          const type = featureTypeLabel(p, id);
          const nm = p._name || p.name || "";
          if (!type && !nm) return;
          const box = document.createElement("div");
          if (type) { const a = document.createElement("div"); a.className = "tp-type"; a.textContent = type; box.appendChild(a); }
          if (nm)   { const b = document.createElement("div"); b.className = "tp-name"; b.textContent = nm; box.appendChild(b); }
          typePop = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: "typepop" })
            .setLngLat(c).setDOMContent(box).addTo(map);
        }, 450);
      }
      tappable.forEach(id => {
        map.on("click", id, e => {
          const f = e.features && e.features[0];
          if (!f) return;
          const [lng, lat] = f.geometry.coordinates;
          clearHoverType();
          showPlaceCard(f.properties._name || f.properties.name || "", lng, lat,
                        undefined, featureTypeLabel(f.properties, id));
        });
        map.on("mouseenter", id, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", id, () => { map.getCanvas().style.cursor = ""; clearHoverType(); });
        if (!noHover) map.on("mousemove", id, e => onHoverType(e, id));
      });
      map.on("click", "osmnotes-pt", e => {
        const f = e.features && e.features[0];
        if (!f) return;
        const [lng, lat] = f.geometry.coordinates;
        showPlaceCard(f.properties.name || "OSM note", lng, lat);
      });
      // tap a saved marker -> the same place card as any other point, titled
      // with the note the user saved (its pencil reflects the saved state)
      map.on("click", "lyr-bm-dot", e => {
        const f = e.features && e.features[0];
        if (!f) return;
        const [lng, lat] = f.geometry.coordinates;
        showPlaceCard(f.properties.name || "", lng, lat, f.properties.note || "");
      });
      map.on("mouseenter", "lyr-bm-dot", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "lyr-bm-dot", () => { map.getCanvas().style.cursor = ""; });
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
        const live = tappable.concat(["osmnotes-pt", "lyr-bm-dot"]).filter(id => map.getLayer(id));
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
      // Reset on WINDOW, not the canvas: a finger-lift can land on an element
      // dropped under it mid-press (e.g. the coord pin), and a canvas-only
      // listener would then miss the pointerup and leave lpPointers wedged > 0,
      // which permanently disables long-press for the rest of the session.
      ["pointerup", "pointercancel"].forEach(t =>
        window.addEventListener(t, () => { lpPointers = Math.max(0, lpPointers - 1); if (!lpPointers) clearTimeout(lpTimer); lpStart = null; }));
      map.on("movestart", lpCancel);
      map.on("zoomstart", lpCancel);

      // Mobile hardening: if the container wasn't sized at init (screen still
      // transitioning), the map fits to 0×0 and over-zooms. Resize + fit once
      // the container has real dimensions, and resize on every orientation change.
      map.on("load", () => { map.resize(); if (!mapFitted) fitHome(false); });
      const area = document.getElementById("maparea");
      resizeObs = new ResizeObserver(() => {
        if (!map) return;
        map.resize();
        // Position the map once the container has real dimensions: a shared
        // point/list focuses that instead of the default home view. Gated on
        // size because the list's fitBounds needs a sized viewport to zoom right.
        if (!mapFitted && area.clientWidth > 0 && area.clientHeight > 0) {
          mapFitted = true;
          if (pendingShare) applyPendingShare();
          else fitHome(false);
        }
      });
      resizeObs.observe(area);
    }

    loadedCityId = city.id;
    clearInterval(clockTimer);
    clockTimer = setInterval(tickClock, 10000);
    tickClock();
    loadLiveData(); // weather + USD rate, best-effort (non-blocking)
    // Map already live and positioned (re-routing to the same city with a fresh
    // shared link): the ResizeObserver won't fire again, so apply the payload now.
    if (map && mapFitted && pendingShare) applyPendingShare();
  }

  /* ── city layers (GeoJSON overlays over the basemap) ── */
  const LINE_COLORS = {
    "metro-a": "#C9682F", "metro-b": "#3D69A8", "metro-c": "#4F8A5F",
    "tram": "#6F6390", "rail": "#8D8272", "bus": "#A67C42", "train": "#5F7A94",
    "ferry": "#1f8aa6"
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
  // Each disclosure category maps to the lineRef values that belong to it.
  // Rome uses per-line refs (metro-a/b/c); other cities may use the generic
  // class name ("metro"/"tram"/"bus"/"train") — both are listed so either works.
  const TRANSIT_REFS = { metro: ["metro-a", "metro-b", "metro-c", "rail", "metro"], tram: ["tram"], bus: ["bus"], train: ["train"], ferry: ["ferry"] };
  const transitState = { metro: true, tram: true, bus: true, train: true, ferry: true };

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
        const res = await fetch(`data/${cityId}/layers/${f}.geojson?v=${BM_VER}`);
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
    "train", LINE_COLORS["train"], "ferry", LINE_COLORS["ferry"], "#B5ADA0"];
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
    applyOsmOpacity();  // hybrid basemap keeps its fade across style reloads
    const pal = PALETTE[theme];
    makeGateIcons();
    makeBookmarkIcon();
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

      // gate -> center connector (dashed lilac) — bold + tight dash so the
      // arrival route reads clearly over the basemap
      add("-link", { type: "line", filter: ["==", ["get", "kind"], "link"],
        paint: { "line-color": pal.linkStrong,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3.2, 14, 4.5],
          "line-dasharray": [1.6, 1.4], "line-opacity": 1 },
        layout: { "line-cap": "round", "line-join": "round" } });
      // regional rail (FL trains) — drawn beneath metro/tram/bus, thin
      add("-railline", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["==", ["get", "lineRef"], "train"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": lineColorExpr, "line-opacity": 0.9,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.2, 14, 2.6] } });
      // ferry routes (sea crossings) — drawn dashed so they read as water links
      add("-ferryline", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["==", ["get", "lineRef"], "ferry"]],
        layout: { "line-cap": "butt", "line-join": "round" },
        paint: { "line-color": lineColorExpr, "line-opacity": 0.85,
          "line-dasharray": [2, 2.2],
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.6, 14, 3] } });
      // transit lines (metro/tram/bus/rail — not the FL train nor ferry network)
      add("-line", { type: "line",
        filter: ["all", ["==", ["get", "kind"], "line"], ["!=", ["get", "lineRef"], "train"], ["!=", ["get", "lineRef"], "ferry"]],
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
          // always draw the icon AND don't let it push its own name label out
          "icon-allow-overlap": true, "icon-ignore-placement": true } });
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
          ["any", ["==", ["get", "kind"], "hub"], ["==", ["get", "kind"], "center"],
           ["==", ["get", "kind"], "hint"], ["==", ["get", "kind"], "gate"]]],
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
    // Gate icons are larger than the old dots, so their name sits below the
    // icon; the subtitle stacks under the name. These are the few curated
    // arrival gates, so their names must always show — otherwise the symbol
    // collider (dense basemap place labels always outrank an overlay label)
    // drops the name and only the subtitle survives, which is exactly what
    // left every ferry pier reading a nameless "vapur iskelesi".
    if (map.getLayer("lyr-varis-label")) {
      map.setLayoutProperty("lyr-varis-label", "text-offset", [0, 2.0]);
      map.setLayoutProperty("lyr-varis-label", "text-allow-overlap", true);
    }
    if (map.getLayer("lyr-varis-sub")) map.setLayoutProperty("lyr-varis-sub", "text-offset", [0, 3.2]);
    applyGroupVisibility();
    applyTransitFilter();
    applyKesfetVisibility();
    applyIhtiyacVisibility();
    applyBolgeVisibility();
    addOverlayExtras();
    applyBookmarks();   // re-add saved markers on top after a theme/style reload
  }

  // Show only the transit sub-types currently enabled. Features without a
  // lineRef ride along while ANY type is on (historic center). A hub/gate may
  // instead carry a `modes` array (the modes it actually serves): it shows only
  // when one of those modes is active, so an inland rail interchange doesn't
  // linger on a ferry-only view. When the user turns everything off, the whole
  // backbone disappears — no stray dots or labels on an otherwise empty map.
  function applyTransitFilter() {
    if (!map) return;
    const refPreds = [];
    const modePreds = [];
    Object.keys(TRANSIT_REFS).forEach(t => {
      if (transitState[t]) {
        TRANSIT_REFS[t].forEach(r => refPreds.push(["==", ["get", "lineRef"], r]));
        modePreds.push(["in", t, ["coalesce", ["get", "modes"], ["literal", ""]]]);
      }
    });
    const anyOn = refPreds.length > 0;
    // generic anchors (no lineRef, no modes) always ride along; typed features
    // match by lineRef; multi-mode anchors match if one of their modes is on.
    const pred = ["any",
      ["all", ["!", ["has", "lineRef"]], ["!", ["has", "modes"]]],
      ...refPreds, ...modePreds];
    ["-railline", "-ferryline", "-line", "-node", "-stop", "-stop-label", "-badge", "-badge-label",
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
      // These groups own their own visibility fns; omurga is driven by the
      // transit sub-filter (applyTransitFilter), so don't let a sibling toggle
      // (e.g. Girişler) force the backbone back on here.
      if (g === "kesfet" || g === "bolgeler" || g === "ihtiyaclar" || g === "omurga") return;
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
    // Tear the map fully down so the NEXT city enters through the same full
    // init path a page reload would take (fresh bounds, data and layers).
    // enterCity only loads a city inside its `if (!map)` branch, so without
    // this teardown, picking a different city keeps the old map and shows the
    // wrong city until a manual refresh.
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
    if (meMarker) { meMarker.remove(); meMarker = null; }
    if (map) { map.remove(); map = null; }
    loadedCityId = null;
    cityContent = {}; contentCityId = null; // drop city-specific i18n
    mapFitted = false;
    // drop per-city caches + overlay state so nothing bleeds across cities
    weatherData = null; fxToUsd = null;
    notesData = null; walkData = null;
    notesOn = gpsOn = walkOn = savedOn = false;
    if (bmPopup) { bmPopup.remove(); bmPopup = null; }
    pcPoint = null;
    closeBookmarkEditor();
    closeBookmarkList();
    ["tog-notes", "tog-gps", "tog-walk", "tog-saved"].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.setAttribute("aria-pressed", "false");
    });
    document.getElementById("gpsoprow").hidden = true; // follows its toggle

    Object.keys(cityData).forEach(k => delete cityData[k]);
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
  const osmOpInput = document.getElementById("osmop");
  osmOpInput.value = Math.round(osmOpacity * 100);
  osmOpInput.addEventListener("input", function () {
    osmOpacity = this.value / 100;
    localStorage.setItem("loc-osm-op", osmOpacity);
    requestAnimationFrame(applyOsmOpacity);
  });
  document.getElementById("tog-notes").onclick = async function () {
    notesOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", notesOn);
    if (notesOn) await fetchNotes();
    addOverlayExtras();
  };
  const gpsOpRow = document.getElementById("gpsoprow");
  const gpsOpInput = document.getElementById("gpsop");
  gpsOpInput.value = Math.round(gpsOpacity * 100);
  document.getElementById("tog-gps").onclick = function () {
    gpsOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", gpsOn);
    gpsOpRow.hidden = !gpsOn;           // opacity slider only makes sense while on
    addOverlayExtras();
  };
  gpsOpInput.addEventListener("input", function () {
    gpsOpacity = this.value / 100;
    localStorage.setItem("loc-gps-op", gpsOpacity);
    if (map && map.getLayer("gpstrace")) map.setPaintProperty("gpstrace", "raster-opacity", gpsOpacity);
  });
  document.getElementById("tog-walk").onclick = async function () {
    walkOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", walkOn);
    if (walkOn) { await fetchWalk(); showToast(t("base.walk.hint")); }
    addOverlayExtras();
  };
  document.getElementById("tog-saved").onclick = function () {
    savedOn = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", savedOn);
    applyBookmarks();
  };
  document.getElementById("bmlist-btn").onclick = function () {
    closeBasemapMenu();
    openBookmarkList();
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

  // immersive (clean map) mode: hide every floating control but the logo and
  // this toggle, so the bare map can be read; tap again to restore them all.
  document.getElementById("immersivebtn").onclick = function () {
    const on = document.body.classList.toggle("immersive");
    this.setAttribute("aria-pressed", on ? "true" : "false");
    document.getElementById("ic-fs-enter").style.display = on ? "none" : "";
    document.getElementById("ic-fs-exit").style.display = on ? "" : "none";
    this.setAttribute("aria-label", t(on ? "aria.exitImmersive" : "aria.immersive"));
    this.setAttribute("title", t(on ? "aria.exitImmersive" : "aria.immersive"));
  };

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
  const CURRENCY_SYM = { EUR: "€", USD: "$", GBP: "£", TRY: "₺", JPY: "¥", CZK: "Kč", SGD: "S$" };
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

  /* app features popup (world screen ⓘ) */
  const appInfo = document.getElementById("appinfo");
  const infoBtn = document.getElementById("infobtn");
  function closeAppInfo() {
    appInfo.classList.remove("show"); appInfo.hidden = true;
    infoBtn.setAttribute("aria-expanded", "false");
  }
  function openAppInfo() {
    appInfo.hidden = false;
    requestAnimationFrame(() => appInfo.classList.add("show"));
    infoBtn.setAttribute("aria-expanded", "true");
    closeLangMenu();
  }
  function toggleAppInfo() { if (appInfo.hidden) openAppInfo(); else closeAppInfo(); }
  infoBtn.onclick = toggleAppInfo;
  // no ✕ button — tap the info toggle again or the backdrop to dismiss
  appInfo.addEventListener("click", e => { if (e.target === appInfo) closeAppInfo(); });
  // On the city screen the header ⓘ is hidden; the bottom-right map-info button
  // (MapLibre's compact attribution control) opens/closes this popup alongside
  // the map credits, so app info stays reachable there too.
  document.addEventListener("click", e => {
    if (e.target.closest && e.target.closest(".maplibregl-ctrl-attrib-button")) toggleAppInfo();
  });

  /* ── router ────────────────────────────── */
  const scrWorld = document.getElementById("scr-world");
  const scrCity = document.getElementById("scr-city");

  function parseShare(params) {
    const out = {};
    const p = params.get("p");
    if (p) {
      const [la, lo] = p.split(",").map(Number);
      if (isFinite(la) && isFinite(lo)) out.focus = { lat: la, lng: lo, name: params.get("t") || "", note: params.get("n") || "", save: params.get("s") === "1" };
    }
    const list = params.get("list");
    if (list) {
      try {
        const raw = JSON.parse(b64urlDecode(list));
        if (Array.isArray(raw)) out.list = raw
          .map(x => ({ lat: +x[0], lng: +x[1], name: x[2] || "", note: x[3] || "" }))
          .filter(x => isFinite(x.lat) && isFinite(x.lng));
      } catch { /* malformed payload -> ignored */ }
    }
    return (out.focus || (out.list && out.list.length)) ? out : null;
  }

  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const qi = raw.indexOf("?");
    const id = qi >= 0 ? raw.slice(0, qi) : raw;
    pendingShare = qi >= 0 ? parseShare(new URLSearchParams(raw.slice(qi + 1))) : null;
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
    const res = await fetch(`data/cities.json?v=${BM_VER}`);
    cities = res.ok ? (await res.json()).cities : [];
    applyI18n();
    renderWorldDots();
    renderCities();
    route();
    // once the map has real layout size, land the mobile Africa frame (avoids a
    // first-paint where clientWidth was still 0)
    requestAnimationFrame(() => {
      if (!document.body.classList.contains("city")) resetWorldZoom();
    });
  }
  boot();
  // rotating the device reframes the opening view
  window.addEventListener("orientationchange", () => {
    if (isMobileSplash() && !document.body.classList.contains("city"))
      requestAnimationFrame(() => requestAnimationFrame(resetWorldZoom));
  });
  // a resize changes the map's pixel size (px-per-unit), so redraw markers at
  // their constant on-screen size for the new layout
  let worldResizeTimer = 0;
  window.addEventListener("resize", () => {
    if (document.body.classList.contains("city")) return;
    clearTimeout(worldResizeTimer);
    worldResizeTimer = setTimeout(() => { cityRenderScale = -1; renderCities(); }, 150);
  });
})();
