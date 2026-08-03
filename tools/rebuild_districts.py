"""Rebuild broken turistik district polygons from real OSM boundaries.

The original pipeline closed each member way of a boundary relation into its own
polygon instead of stitching them into one ring, so some cities ended up with a
handful of thin triangles where a neighbourhood should be (Barcelona's el Raval:
0.08 km² of slivers instead of 1.09 km²). Detection: perimeter^2/area — a real
district lands around 15-60, a sliver in the hundreds or thousands.

This pulls the boundary relation again and runs `polygonize` over the union of
its ways, which is what should have happened in the first place.

Usage: rebuild_districts.py <city|all> [--apply] [--limit N]
"""
import json, math, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ovp
from shapely.geometry import LineString, MultiPolygon, Polygon, mapping, shape
from shapely.ops import polygonize, unary_union

ROOT = os.environ.get("LOC_ROOT", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BAD_RATIO = 150.0      # perimeter^2/area above this = sliver, not a district
SIMPLIFY = 0.00012     # ~12 m, keeps the boundary readable but light
LAYER = "bolge-turistik"

# Tagging differs per city (docs/ETAPLAR.md notes this per city), so try the
# documented form first and fall back to the generic ones.
SELECTORS = {
    "barcelona": ['["admin_level"="10"]', '["boundary"="administrative"]'],
    "vienna": ['["admin_level"="9"]', '["boundary"="administrative"]'],
    "prague": ['["boundary"="cadastral"]', '["place"="cadastral_community"]'],
    "amsterdam": ['["place"~"quarter|neighbourhood|suburb"]', '["boundary"="administrative"]'],
    "lisbon": ['["place"~"suburb|neighbourhood|quarter"]', '["admin_level"="8"]'],
    "singapore": ['["place"~"suburb|quarter|neighbourhood"]', '["boundary"="administrative"]'],
}
GENERIC = ['["boundary"="administrative"]', '["place"~"quarter|suburb|neighbourhood"]']


def km2(geom):
    lat = geom.centroid.y
    return geom.area * 111 * 111 * math.cos(math.radians(lat))


def ratio(geom):
    return geom.length ** 2 / geom.area if geom.area > 0 else 1e9


def fetch_polygon(name, sel, bounds):
    (w, s), (e, n) = bounds
    esc = name.replace('"', '\\"')
    q = (f'[out:json][timeout:180];relation["name"="{esc}"]{sel}({s},{w},{n},{e});'
         f'way(r);out geom;')
    try:
        ways = ovp.ways(q, timeout=90, tries=2)
    except Exception:
        return None
    lines = [LineString(c) for c in ways if len(c) > 1]
    if not lines:
        return None
    polys = [p for p in polygonize(unary_union(lines)) if p.area > 0]
    if not polys:
        return None
    polys.sort(key=lambda p: p.area, reverse=True)
    keep = [polys[0]] + [p for p in polys[1:] if p.area > polys[0].area * 0.2]
    geom = unary_union(keep) if len(keep) > 1 else polys[0]
    return geom


def rebuild_city(city, apply=False, limit=None):
    fn = f"{ROOT}/data/{city}/layers/{LAYER}.geojson"
    if not os.path.exists(fn):
        return
    bounds = json.load(open(f"{ROOT}/data/{city}/city.json"))["maxBounds"]
    fc = json.load(open(fn))
    labels = {f["properties"].get("name"): f for f in fc["features"]
              if f["properties"].get("kind") == "district-label"}
    print(f"\n=== {city}/{LAYER} ({'YAZILDI' if apply else 'kuru çalışma'})")
    done = 0
    for ft in fc["features"]:
        g = ft["geometry"]
        if g["type"] not in ("Polygon", "MultiPolygon"):
            continue
        old = shape(g)
        if old.area > 0 and ratio(old) <= BAD_RATIO:
            continue
        name = ft["properties"].get("name")
        if limit and done >= limit:
            continue
        new = None
        for sel in SELECTORS.get(city, []) + GENERIC:
            new = fetch_polygon(name, sel, bounds)
            if new is not None and ratio(new) <= BAD_RATIO:
                break
            new = None
        if new is None:
            print(f"  {name:38s} BULUNAMADI (elle bakılmalı)")
            continue
        new = new.simplify(SIMPLIFY, preserve_topology=True)
        print(f"  {name:38s} {km2(old):6.2f} -> {km2(new):6.2f} km²  "
              f"oran {ratio(old):7.0f} -> {ratio(new):4.0f}")
        done += 1
        if apply:
            rounded = json.loads(json.dumps(mapping(new)))

            def rnd(c):
                return [[round(x, 5), round(y, 5)] for x, y in c]
            if rounded["type"] == "Polygon":
                rounded["coordinates"] = [rnd(r) for r in rounded["coordinates"]]
            else:
                rounded["coordinates"] = [[rnd(r) for r in poly] for poly in rounded["coordinates"]]
            ft["geometry"] = rounded
            lab = labels.get(name)
            if lab is not None:
                c = new.representative_point()
                lab["geometry"]["coordinates"] = [round(c.x, 5), round(c.y, 5)]
    if apply:
        with open(fn, "w") as fh:
            json.dump(fc, fh, separators=(",", ":"), ensure_ascii=False)


if __name__ == "__main__":
    target = sys.argv[1]
    apply = "--apply" in sys.argv
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])
    cities = sorted(SELECTORS) if target == "all" else [target]
    for c in cities:
        rebuild_city(c, apply, limit)
