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

  /* ── router ────────────────────────────── */
  const scrWorld = document.getElementById("scr-world");
  const scrCity = document.getElementById("scr-city");

  function route() {
    const id = location.hash.replace(/^#\/?/, "");
    const city = cities.find(c => c.id === id && c.status === "ready");
    if (city) {
      document.getElementById("cityname").textContent = city.name;
      scrWorld.classList.remove("on");
      scrCity.classList.add("on");
      document.body.classList.add("city");
    } else {
      if (id) history.replaceState(null, "", "#/"); // unknown city -> world
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
