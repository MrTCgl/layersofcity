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
import glob, json, math, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ovp
from shapely.geometry import LineString, MultiPolygon, Polygon, mapping, shape
from shapely.ops import polygonize, unary_union

ROOT = os.environ.get("LOC_ROOT", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BAD_RATIO = 150.0      # perimeter^2/area above this = sliver, not a district
SIMPLIFY = 0.00012     # ~12 m, keeps the boundary readable but light
LAYERS = ["bolge-turistik", "bolge-dogal", "bolge-egitim", "bolge-ticari"]
# what an area of this kind is tagged as in OSM, tried in order
LAYER_SELECTORS = {
    "bolge-dogal": ['["leisure"="park"]', '["leisure"="nature_reserve"]',
                    '["boundary"="protected_area"]', '["landuse"="forest"]'],
    "bolge-egitim": ['["amenity"="university"]', '["amenity"="college"]'],
    "bolge-ticari": ['["landuse"~"commercial|retail"]', '["place"~"quarter|neighbourhood"]'],
}

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
ALIASES = {
    "UCL": "University College London",
    "UAL": "University of the Arts London",
    "LSE": "London School of Economics and Political Science",
    "Greenwich Uni": "University of Greenwich",
    "Westminster Uni": "University of Westminster",
}
GENERIC = ['["boundary"="administrative"]', '["place"~"quarter|suburb|neighbourhood"]']


def km2(geom):
    lat = geom.centroid.y
    return geom.area * 111 * 111 * math.cos(math.radians(lat))


def ratio(geom):
    return geom.length ** 2 / geom.area if geom.area > 0 else 1e9


def area_index(sel, bounds):
    """name -> [(type, id)] for one selector, fetched once per city+selector.

    Both element types matter: administrative boundaries are relations, but a
    park or a campus is usually a single closed way, which is why the first
    version of this tool found neither UCL nor most of the parks.
    """
    (w, s), (e, n) = bounds
    q = (f'[out:json][timeout:180];(relation{sel}({s},{w},{n},{e});'
         f'way{sel}({s},{w},{n},{e}););out ids tags;')
    try:
        body = ovp.fetch(q, timeout=90, tries=2, allow_empty=True)
    except Exception:
        return {}
    idx = {}
    for el in body.get("elements", []):
        nm = (el.get("tags") or {}).get("name")
        if not nm:
            continue
        ref = (el["type"], el["id"])
        idx.setdefault(nm, []).append(ref)
        idx.setdefault(nm.casefold(), []).append(ref)
    return idx


def polygon_from_ids(refs):
    rels = [i for t, i in refs if t == "relation"]
    ways = [i for t, i in refs if t == "way"]
    parts = []
    if rels:
        q = ('[out:json][timeout:180];relation(id:' + ",".join(map(str, rels)) +
             ');way(r);out geom;')
        parts.append(q)
    if ways:
        q = '[out:json][timeout:180];way(id:' + ",".join(map(str, ways)) + ');out geom;'
        parts.append(q)
    coords = []
    for q in parts:
        try:
            coords += ovp.ways(q, timeout=90, tries=2)
        except Exception:
            continue
    lines = [LineString(c) for c in coords if len(c) > 1]
    if not lines:
        return None
    polys = [p for p in polygonize(unary_union(lines)) if p.area > 0]
    if not polys:
        return None
    # Keep every ring the matched OSM object polygonizes into: a park split by
    # roads (Tiergarten: 0.89 + 0.40 + 0.24 km²) is still one park, and dropping
    # the smaller pieces silently shrinks it.
    return unary_union(polys) if len(polys) > 1 else polys[0]


def rebuild_city(city, layer="bolge-turistik", apply=False, limit=None):
    fn = f"{ROOT}/data/{city}/layers/{layer}.geojson"
    if not os.path.exists(fn):
        return
    bounds = json.load(open(f"{ROOT}/data/{city}/city.json"))["maxBounds"]
    fc = json.load(open(fn))
    labels = {f["properties"].get("name"): f for f in fc["features"]
              if f["properties"].get("kind") == "district-label"}
    print(f"\n=== {city}/{layer} ({'YAZILDI' if apply else 'kuru çalışma'})", flush=True)
    index_cache = {}
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
        chain = (LAYER_SELECTORS.get(layer) or SELECTORS.get(city, [])) + GENERIC
        for sel in chain:
            idx = index_cache.get(sel)
            if idx is None:
                idx = index_cache[sel] = area_index(sel, bounds)
            alias = ALIASES.get(name)
            ids = (idx.get(name) or idx.get((name or "").casefold())
                   or (idx.get(alias) if alias else None))
            if not ids:
                continue
            new = polygon_from_ids(ids[:3])
            # A name-matched OSM object is trustworthy by construction; a park
            # made of disjoint pieces keeps a high ratio no matter how correct
            # it is, so growing back to at least the old area also counts.
            if new is not None and (ratio(new) <= BAD_RATIO or km2(new) >= km2(old)):
                break
            new = None
        if new is None:
            print(f"  {name:38s} BULUNAMADI (elle bakılmalı)", flush=True)
            continue
        # An elongated or multi-part park keeps a high ratio however correct it
        # is (Tiergarten 1.78 km² measured 1.79 in OSM), so only replace when the
        # current shape really is a shrunken sliver, not merely a thin one.
        if km2(new) < km2(old) * 1.5 and ratio(old) < 500:
            print(f"  {name:38s} atlandı (mevcut geometri zaten doğru: "
                  f"{km2(old):.2f} vs {km2(new):.2f} km²)", flush=True)
            continue
        new = new.simplify(SIMPLIFY, preserve_topology=True)
        print(f"  {name:38s} {km2(old):6.2f} -> {km2(new):6.2f} km²  "
              f"oran {ratio(old):7.0f} -> {ratio(new):4.0f}", flush=True)
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
    layer = "bolge-turistik"
    if "--layer" in sys.argv:
        layer = sys.argv[sys.argv.index("--layer") + 1]
    cities = sorted(p.split(os.sep)[-2] for p in glob.glob(f"{ROOT}/data/*/city.json")) \
        if target == "all" else [target]
    for c in cities:
        rebuild_city(c, layer, apply, limit)
