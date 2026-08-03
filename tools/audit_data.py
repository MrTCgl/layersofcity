"""Data quality sweep across every city layer (offline checks).

Complements audit_omurga.py (which only looks at straight segments). Checks the
rules the project already committed to in docs/VERI.md:

  id      duplicate feature ids inside a file
  dup     two points sitting on the same spot (one place = one pin)
  orphan  station / stop / hub / badge far from the line it belongs to
  bounds  feature outside the city's maxBounds
  label   labelled feature with no name, or unknown theme value
  box     district polygon drawn as a 3-5 corner box instead of a real boundary
  size    layer file over the size target

Usage: audit_data.py [check ...] [--city <name>]   (no args = every check)
"""
import glob, json, math, os, sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geo

ROOT = os.environ.get("LOC_ROOT", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

KESFET_THEMES = {"tarihi", "modern", "doga", "gastronomi", "alisveris", "otel",
                 "yurt", "kamu", "saglik", "yogunluk"}
IHTIYAC_THEMES = {"eczane", "market", "yakit", "kiralik-arac", "kutuphane",
                  "muze", "hastane"}
BTYPES = {"turistik", "ticari", "egitim", "dogal"}
SIZE_LIMIT_KB = {"omurga": 400}
DEFAULT_SIZE_KB = 200


def load(city, layer):
    fn = f"{ROOT}/data/{city}/layers/{layer}.geojson"
    if not os.path.exists(fn):
        return None
    return json.load(open(fn))


def layers(city):
    for fn in sorted(glob.glob(f"{ROOT}/data/{city}/layers/*.geojson")):
        yield os.path.basename(fn)[:-8], json.load(open(fn)), fn


def points_of(ft):
    g = ft["geometry"]
    if g["type"] == "Point":
        return [g["coordinates"]]
    return []


def check_id(city, out):
    for layer, fc, _ in layers(city):
        ids = [f["properties"].get("id") for f in fc["features"]]
        for i, n in Counter(ids).items():
            if n > 1:
                out.append(("id", f"{layer}: id '{i}' {n} kez"))


def check_dup(city, out):
    """One place = one pin (docs/VERI.md step 6) — across POI layers too."""
    seen = defaultdict(list)
    for layer, fc, _ in layers(city):
        if layer not in ("kesfet-poi", "ihtiyac"):
            continue
        for ft in fc["features"]:
            for c in points_of(ft):
                seen[(round(c[0], 5), round(c[1], 5))].append(
                    (layer, ft["properties"].get("id"), ft["properties"].get("name")))
    for coord, rows in seen.items():
        if len(rows) > 1:
            out.append(("dup", f"{coord}: " + " | ".join(f"{l}/{i} {n}" for l, i, n in rows)))


def check_orphan(city, out):
    """Station/stop/hub/badge points should sit on the network they label."""
    fc = load(city, "omurga")
    if not fc:
        return
    lines = []
    for ft in fc["features"]:
        if ft["properties"].get("kind") == "line":
            lines += geo.parts_of(ft["geometry"])
    if not lines:
        return
    from shapely.geometry import LineString, MultiLineString, Point
    net = MultiLineString([LineString(p) for p in lines if len(p) > 1])
    limits = {"node": 250, "stop": 250, "hub": 400, "badge": 150}
    for ft in fc["features"]:
        kind = ft["properties"].get("kind")
        if kind not in limits:
            continue
        for c in points_of(ft):
            d = Point(c).distance(net) * 111000
            if d > limits[kind]:
                out.append(("orphan", f"omurga/{ft['properties'].get('id')} "
                                      f"({kind} {ft['properties'].get('name') or ft['properties'].get('ref')}) "
                                      f"hattan {d:.0f} m uzakta"))


def check_bounds(city, out):
    (w, s), (e, n) = json.load(open(f"{ROOT}/data/{city}/city.json"))["maxBounds"]
    for layer, fc, _ in layers(city):
        for ft in fc["features"]:
            for c in points_of(ft):
                if not (w <= c[0] <= e and s <= c[1] <= n):
                    out.append(("bounds", f"{layer}/{ft['properties'].get('id')} "
                                          f"{ft['properties'].get('name')} {c} maxBounds dışında"))


def check_label(city, out):
    for layer, fc, _ in layers(city):
        for ft in fc["features"]:
            p = ft["properties"]
            if p.get("lab") and not (p.get("name") or p.get("ref")):
                out.append(("label", f"{layer}/{p.get('id')}: lab:1 ama adı yok"))
            if layer == "kesfet-poi" and p.get("kind") == "poi" and p.get("theme") not in KESFET_THEMES:
                out.append(("label", f"{layer}/{p.get('id')}: bilinmeyen theme '{p.get('theme')}'"))
            if layer == "ihtiyac" and p.get("kind") == "poi" and p.get("theme") not in IHTIYAC_THEMES:
                out.append(("label", f"{layer}/{p.get('id')}: bilinmeyen theme '{p.get('theme')}'"))
            if layer.startswith("bolge-") and p.get("btype") not in BTYPES and p.get("btype"):
                out.append(("label", f"{layer}/{p.get('id')}: bilinmeyen btype '{p.get('btype')}'"))


def check_box(city, out):
    """docs/VERI.md: a district polygon may not be a 3-5 corner hand-drawn box."""
    for layer, fc, _ in layers(city):
        if not layer.startswith("bolge-"):
            continue
        for ft in fc["features"]:
            g = ft["geometry"]
            rings = []
            if g["type"] == "Polygon":
                rings = [g["coordinates"][0]]
            elif g["type"] == "MultiPolygon":
                rings = [poly[0] for poly in g["coordinates"]]
            for r in rings:
                if len(r) - 1 <= 5:   # closed ring: last point repeats the first
                    out.append(("box", f"{layer}/{ft['properties'].get('id')} "
                                       f"{ft['properties'].get('name')}: {len(r)-1} köşeli kutu"))
                    break


def check_size(city, out):
    for layer, _, fn in layers(city):
        kb = os.path.getsize(fn) / 1024
        limit = SIZE_LIMIT_KB.get(layer, DEFAULT_SIZE_KB)
        if kb > limit:
            out.append(("size", f"{layer}: {kb:.0f} KB (hedef {limit} KB)"))


CHECKS = {"id": check_id, "dup": check_dup, "orphan": check_orphan,
          "bounds": check_bounds, "label": check_label, "box": check_box,
          "size": check_size}


if __name__ == "__main__":
    args = sys.argv[1:]
    only_city = None
    if "--city" in args:
        i = args.index("--city")
        only_city = args[i + 1]
        args = args[:i] + args[i + 2:]
    wanted = [a for a in args if a in CHECKS] or list(CHECKS)
    cities = [only_city] if only_city else sorted(
        p.split(os.sep)[-2] for p in glob.glob(f"{ROOT}/data/*/city.json"))
    totals = Counter()
    for city in cities:
        out = []
        for name in wanted:
            CHECKS[name](city, out)
        if out:
            print(f"\n### {city} — {len(out)} bulgu")
            for kind, msg in out:
                totals[kind] += 1
                print(f"  [{kind}] {msg}")
    print("\n=== özet ===")
    for k in wanted:
        print(f"  {k:7s} {totals[k]}")
    print(f"  TOPLAM {sum(totals.values())} bulgu / {len(cities)} şehir")
