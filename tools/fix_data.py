"""Apply the mechanical fixes audit_data.py finds.

Covers only the unambiguous ones:

  ids     duplicate feature ids inside a layer (two different parks both called
          "dogal-0" — the file was built from two independently numbered batches)
  lab     lab:1 on a feature with no name, which would draw an empty label
  bounds  feature outside the city's maxBounds — unreachable, the map clamps there
  dup     two POIs of the same layer on the exact same spot (one place = one pin)

Not covered on purpose: station points far from the drawn network, and the same
museum appearing in both kesfet-poi and ihtiyac — both need a judgement call.

Usage: fix_data.py [--apply]
"""
import glob, json, os, sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.environ.get("LOC_ROOT", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
# docs/VERI.md step 6: which theme wins when one spot carries two
THEME_RANK = ["doga", "gastronomi", "tarihi", "modern", "otel", "yurt", "alisveris", "kamu"]


def rank(theme):
    return THEME_RANK.index(theme) if theme in THEME_RANK else len(THEME_RANK)


def fix_ids(fc, log, layer):
    ids = [f["properties"].get("id") for f in fc["features"]]
    dups = {i for i, n in Counter(ids).items() if n > 1}
    if not dups:
        return 0
    prefix = layer.split("-")[-1]
    by_name = {}
    n = 0
    for ft in fc["features"]:
        p = ft["properties"]
        if p.get("kind") == "district-label":
            continue
        new = f"{prefix}-{n}"
        by_name[p.get("name")] = n
        p["id"] = new
        n += 1
    for ft in fc["features"]:
        p = ft["properties"]
        if p.get("kind") == "district-label" and p.get("name") in by_name:
            p["id"] = f"{prefix}-lab-{by_name[p['name']]}"
    log.append(f"    id: {len(dups)} çakışma -> {n} feature yeniden numaralandı")
    return len(dups)


def fix_lab(fc, log):
    n = 0
    for ft in fc["features"]:
        p = ft["properties"]
        if p.get("lab") and not (p.get("name") or p.get("ref")):
            del p["lab"]
            n += 1
    if n:
        log.append(f"    lab: {n} adsız feature'dan lab:1 kaldırıldı")
    return n


def fix_bounds(fc, bounds, log):
    """Drop anything the map can never reach — maxBounds clamps panning there.

    Polygons count too (London's "Greenwich Uni" matched the Medway campus in
    Kent), and a district's label goes with its polygon.
    """
    from shapely.geometry import shape
    (w, s), (e, n) = bounds

    def outside(ft):
        g = ft["geometry"]
        if g["type"] == "Point":
            x, y = g["coordinates"]
        elif g["type"] in ("Polygon", "MultiPolygon"):
            pt = shape(g).representative_point()
            x, y = pt.x, pt.y
        else:
            return False
        return not (w <= x <= e and s <= y <= n)

    gone_names = {ft["properties"].get("name") for ft in fc["features"]
                  if ft["properties"].get("kind") == "district" and outside(ft)}
    keep, dropped = [], []
    for ft in fc["features"]:
        pr = ft["properties"]
        if outside(ft) or (pr.get("kind") == "district-label" and pr.get("name") in gone_names):
            dropped.append(pr.get("name") or pr.get("id"))
            continue
        keep.append(ft)
    if dropped:
        fc["features"] = keep
        log.append(f"    bounds: {len(dropped)} feature silindi ({', '.join(str(d) for d in dropped[:3])})")
    return len(dropped)


def fix_dup(fc, log):
    """One place = one pin, within a layer."""
    at = defaultdict(list)
    for i, ft in enumerate(fc["features"]):
        if ft["geometry"]["type"] == "Point":
            at[tuple(ft["geometry"]["coordinates"])].append(i)
    drop = set()
    for coord, idx in at.items():
        if len(idx) < 2:
            continue
        idx.sort(key=lambda i: rank(fc["features"][i]["properties"].get("theme")))
        for i in idx[1:]:
            drop.add(i)
    if drop:
        names = [fc["features"][i]["properties"].get("name") for i in sorted(drop)][:3]
        fc["features"] = [f for i, f in enumerate(fc["features"]) if i not in drop]
        log.append(f"    dup: {len(drop)} üst üste binen pin silindi ({', '.join(str(n) for n in names)})")
    return len(drop)


if __name__ == "__main__":
    apply = "--apply" in sys.argv
    total = Counter()
    for city_dir in sorted(glob.glob(f"{ROOT}/data/*/city.json")):
        city = city_dir.split(os.sep)[-2]
        bounds = json.load(open(city_dir))["maxBounds"]
        for fn in sorted(glob.glob(f"{ROOT}/data/{city}/layers/*.geojson")):
            layer = os.path.basename(fn)[:-8]
            fc = json.load(open(fn))
            log = []
            total["id"] += fix_ids(fc, log, layer)
            total["lab"] += fix_lab(fc, log)
            total["bounds"] += fix_bounds(fc, bounds, log)
            if layer in ("kesfet-poi", "ihtiyac"):
                total["dup"] += fix_dup(fc, log)
            if log:
                print(f"  {city}/{layer}")
                print("\n".join(log))
                if apply:
                    with open(fn, "w") as fh:
                        json.dump(fc, fh, separators=(",", ":"), ensure_ascii=False)
    print(f"\n{'YAZILDI' if apply else 'kuru çalışma'} — " +
          " · ".join(f"{k} {v}" for k, v in total.items()))
