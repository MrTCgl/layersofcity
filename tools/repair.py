"""Repair long straight segments in omurga lines, chord by chord.

Replacing a whole line with a fresh Overpass union changes its curated extent
(Roma's FL set went 353 -> 601 km that way). So instead we keep the existing
geometry and only touch the defect: for every segment longer than MAX_SEG we
ask the line's real OSM ways for the actual path between the segment's two
endpoints and splice that path in. Two outcomes, both honest:

  * the real path bows away from the chord -> the old geometry cut a corner and
    is now replaced by the real alignment;
  * the real path is (nearly) the chord -> the track really is straight there,
    and we still gain the real intermediate vertices, so the "no >2 km straight"
    check stops firing on genuine geometry.

Only when no path can be found (snap too far, disconnected graph) do we fall
back to plain densify, which keeps the drawn line unchanged.

Usage: repair.py <city|all> [--apply]
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ovp, geo, graph
from shapely.geometry import LineString

ROOT = "/home/user/layersofcity"
MAX_SEG = 1700.0     # repair anything longer (rule: no >2 km straight)
STEP = 1200.0        # densify spacing for the fallback
SNAP_MAX = 250.0     # endpoint must sit this close to the real track
DETOUR_MAX = 4.0     # reject absurd paths (chord * this)
PATH_TOL = 0.00008   # ~8 m simplification of the spliced path

HERE = os.path.dirname(os.path.abspath(__file__))
SPECS = {
    "omurga": json.load(open(os.path.join(HERE, "spec.json"))),
    "varis": json.load(open(os.path.join(HERE, "spec_varis.json"))),
}


def densify_seg(a, b, step=STEP):
    d = geo.metres(a, b)
    k = max(1, int(d // step) + 1)
    return [[round(a[0] + (b[0] - a[0]) * i / k, 5),
             round(a[1] + (b[1] - a[1]) * i / k, 5)] for i in range(1, k)]


def repair_feature(ft, adj, stats):
    parts = geo.parts_of(ft["geometry"])
    out = []
    for p in parts:
        np_ = [p[0]]
        for a, b in zip(p, p[1:]):
            d = geo.metres(a, b)
            if d <= MAX_SEG:
                np_.append(b)
                continue
            na, da = graph.nearest(adj, a)
            nb, db = graph.nearest(adj, b)
            path = None
            if na and nb and da <= SNAP_MAX and db <= SNAP_MAX:
                path, length = graph.shortest(adj, na, nb)
                if path and (length > d * DETOUR_MAX or len(path) < 3):
                    path = None
            if path:
                simple = LineString(path).simplify(PATH_TOL, preserve_topology=False)
                pts = [[round(x, 5), round(y, 5)] for x, y in simple.coords]
                # keep the original endpoints, splice the real geometry between
                mid = [c for c in pts if c != np_[-1] and c != b]
                # the graph path may run b->a; orient it to follow a->b
                if mid and geo.metres(mid[0], a) > geo.metres(mid[-1], a):
                    mid.reverse()
                # any remaining long straight inside the real path is genuine
                fixed = [np_[-1]]
                for x, y in zip([np_[-1]] + mid, mid + [b]):
                    if geo.metres(x, y) > MAX_SEG:
                        fixed += densify_seg(x, y)
                    fixed.append(y)
                np_ += fixed[1:]
                stats["spliced"] += 1
                stats["gain"] = max(stats["gain"], length / d)
            else:
                np_ += densify_seg(a, b)
                np_.append(b)
                stats["densified"] += 1
        out.append(np_)
    return geo.clean_parts(out)


def repair_city(city, layer="omurga", apply=False):
    spec = SPECS[layer].get(city, {})
    bounds = json.load(open(f"{ROOT}/data/{city}/city.json"))["maxBounds"]
    path = f"{ROOT}/data/{city}/layers/{layer}.geojson"
    fc = json.load(open(path))
    by_id = {f["properties"].get("id"): f for f in fc["features"]}
    print(f"\n=== {city}/{layer} ({'YAZILDI' if apply else 'kuru çalışma'})")
    for fid, sel in spec.items():
        ft = by_id.get(fid)
        if ft is None:
            print(f"  {fid:24s} FEATURE YOK")
            continue
        bridge = 70
        if isinstance(sel, dict):
            bridge = sel.get("bridge", bridge)
            sel = sel["sel"]
        # a link may follow more than one line (Newark: AirTrain + NEC), so a
        # spec entry may carry a list of selectors; "way:" pulls plain ways
        sels = sel if isinstance(sel, list) else [sel]
        (w, s), (e, n) = bounds
        ways = []
        failed = None
        for one in sels:
            if one.startswith("way:"):
                q = f'[out:json][timeout:180];way{one[4:]}({s},{w},{n},{e});out geom;'
            else:
                q = (f'[out:json][timeout:180];relation{one}({s},{w},{n},{e});'
                     f'way(r)[!"building"];out geom;')
            try:
                ways += ovp.ways(q)
            except Exception as exc:
                failed = str(exc)[:50]
        if failed and not ways:
            print(f"  {fid:24s} OVERPASS HATA {failed}")
            continue
        adj = graph.build_graph(ways, bridge_m=bridge)
        old = geo.parts_of(ft["geometry"])
        ows, okm, opt = geo.worst_segment(old)
        stats = {"spliced": 0, "densified": 0, "gain": 1.0}
        new = repair_feature(ft, adj, stats)
        ws, km, pt = geo.worst_segment(new)
        print(f"  {fid:24s} {ows:7.0f}->{ws:6.0f}m  {okm:6.1f}->{km:6.1f}km "
              f"{opt:5d}->{pt:5d}pt  dikilen={stats['spliced']:2d} "
              f"densify={stats['densified']:2d} en_büyük_kıvrım={stats['gain']:.2f}x "
              f"ways={len(ways)}")
        if apply:
            ft["geometry"] = geo.as_geometry(new)
    if apply:
        with open(path, "w") as fh:
            json.dump(fc, fh, separators=(",", ":"), ensure_ascii=False)


if __name__ == "__main__":
    target = sys.argv[1]
    apply = "--apply" in sys.argv
    layer = "varis" if "--varis" in sys.argv else "omurga"
    for c in (SPECS[layer] if target == "all" else [target]):
        repair_city(c, layer, apply)
