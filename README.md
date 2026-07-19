# layers of city

Read a new city, layer by layer.

**layers of city** is a static web app that helps someone arriving in an
unfamiliar metropolis *orient* themselves — not navigate. On one calm map you
peel the city open in layers: how you arrive, the transit backbone, places to
explore, districts, and everyday needs.

Live at **[layersofcity.com](https://layersofcity.com)**.

## What it does

- **Full-screen map, no side panels.** Every control floats over the map.
- **Layer groups:** Arrivals, Backbone (metro/tram/bus/train/ferry), Explore,
  Districts, and Needs.
- **Orientation, not routing.** Pick a place and a small card opens; the
  "Directions" button hands off to Google Maps via a keyless URL — the app
  never tries to route you itself.
- **Live, optional data:** weather (Open-Meteo), currency (Frankfurter). If a
  live source is unavailable the app degrades quietly — nothing breaks.
- **Multi-city by design.** A city is just a `data/<city>/` folder; adding one
  needs no code changes.
- **6 UI languages** (en, de, fr, it, es, tr). Per-city content is localized
  too, falling back to English where a string is missing.
- **Light + dark themes;** the map basemap follows the theme.

## Cities

Berlin, Istanbul, İzmir, London, Madrid, New York, Paris, Rome, Tokyo.
Transit geometry comes from OpenStreetMap; editorial content (arrival hints,
price levels) is curated per city and dated.

## Tech

Pure static site — no server, no database, no build step, no API keys.

- Vanilla HTML / CSS / JavaScript
- [MapLibre GL JS](https://maplibre.org/) (bundled locally) for the map
- Keyless / free tiles and data only: OpenFreeMap, Open-Meteo, Frankfurter

No frameworks. No membership. Preferences live in `localStorage`.

## Run locally

Any static file server works, e.g.:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project layout

```
index.html            entry point
css/                  styles
js/                   app logic (vanilla)
assets/               bundled MapLibre, fonts, basemap styles
i18n/                 UI strings, one JSON per language
data/<city>/          per-city manifest, layers (GeoJSON) and content
docs/                 concept, design, data schema, coding stages (Turkish)
```

## Analytics (optional)

No analytics run by default. To enable privacy-friendly, cookieless analytics,
fill in **one** value in the small config block near the bottom of `index.html`:

- **Umami** (free tier): set `umamiId` to your website id, or
- **Plausible:** set `plausibleDomain` to `layersofcity.com`.

While both fields are empty, no analytics script loads and no request is sent.

## License notes

The "layers of city" wordmark uses the **Ballet** typeface
(Omnibus-Type, SIL Open Font License), bundled locally.

## Contact

layersofcity@gmail.com
