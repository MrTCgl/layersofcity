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
    if (map) map.setStyle(`assets/basemap-${theme}.json`); // basemap follows the theme
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

  /* ── city screen: map + chrome ─────────── */
  let map = null;
  let manifest = null;      // data/<city>/city.json
  let clockTimer = null;
  let meMarker = null;
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

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
      map = new maplibregl.Map({
        container: "map",
        style: basemapUrl(),
        bounds: manifest.home,
        fitBoundsOptions: { padding: 30 },
        minZoom: manifest.zoom.min,
        maxZoom: manifest.zoom.max,
        maxBounds: manifest.maxBounds,
        attributionControl: { compact: true }
      });
      map.touchPitch.disable();
      map.dragRotate.disable();
    }

    clearInterval(clockTimer);
    clockTimer = setInterval(tickClock, 10000);
    tickClock();
  }

  function leaveCity() {
    clearInterval(clockTimer);
    clockTimer = null;
  }

  /* map chrome wiring (static elements, safe before map exists) */
  document.getElementById("zoom-in").onclick = () => map && map.zoomIn();
  document.getElementById("zoom-out").onclick = () => map && map.zoomOut();
  document.getElementById("zoom-home").onclick = () =>
    map && manifest && map.fitBounds(manifest.home, { padding: 30 });
  document.querySelectorAll("#panpad button").forEach(b => {
    b.onclick = () => map && map.panBy([+b.dataset.dx * 150, +b.dataset.dy * 150]);
  });

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

  /* layer-group chips: state now, map layers arrive in E3+ */
  document.querySelectorAll("#topchips .mchip, #drawer .dchip").forEach(b => {
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      // TODO(E3+): toggle the matching map layers
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
    if (show) { s.classList.add("show"); btn.setAttribute("aria-expanded", "true"); }
  }
  document.getElementById("bb-kesfet").onclick = function () { toggleSheet("sheet-kesfet", this); };
  document.getElementById("bb-ihtiyac").onclick = function () { toggleSheet("sheet-ihtiyac", this); };
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
        // TODO(E4/E6): toggle themed POIs on the map
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
