"""Rebuild one arrival link end to end along real OSM geometry.

`repair.py` only touches the offending segments of an existing link, which is
the right default. But when the link's own endpoint is wrong — the gate sits
off the track, so there is nothing to snap to — the whole link has to be drawn
again from the graph. That is this script (Newark: the gate sat 700 m from the
AirTrain, so the airport-to-rail leg was a straight cut).

Usage:
  relink.py <city> <link-id> <gate-id> <target-id> [--apply] \
      --sel '<overpass selector>' [--sel ...] [--bridge 150] [--gate lon,lat]

`--sel` accepts the same forms as spec_varis.json: a relation selector, or
"way:<selector>" for plain ways. `--gate` moves the gate node first (use when
the gate itself is off, per the "gate must sit on the real terminal" rule).
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geo, graph, ovp
from shapely.geometry import LineString

ROOT = os.environ.get("LOC_ROOT", "/home/user/layersofcity")
MAX_SEG = 1700.0
STEP = 1200.0
TOL = 0.00008


def densify(parts):
    out = []
    for p in parts:
        np_ = [p[0]]
        for a, b in zip(p, p[1:]):
            d = geo.metres(a, b)
            if d > MAX_SEG:
                k = int(d // STEP) + 1
                for i in range(1, k):
                    t = i / k
                    np_.append([round(a[0] + (b[0] - a[0]) * t, 5),
                                round(a[1] + (b[1] - a[1]) * t, 5)])
            np_.append(b)
        out.append(np_)
    return out


def main(argv):
    city, link_id, gate_id, target_id = argv[0], argv[1], argv[2], argv[3]
    apply = "--apply" in argv
    sels = [argv[i + 1] for i, a in enumerate(argv) if a == "--sel"]
    bridge = next((float(argv[i + 1]) for i, a in enumerate(argv) if a == "--bridge"), 100.0)
    new_gate = next((argv[i + 1] for i, a in enumerate(argv) if a == "--gate"), None)

    bounds = json.load(open(f"{ROOT}/data/{city}/city.json"))["maxBounds"]
    (w, s), (e, n) = bounds
    path_file = f"{ROOT}/data/{city}/layers/varis.geojson"
    fc = json.load(open(path_file))
    by_id = {f["properties"].get("id"): f for f in fc["features"]}
    gate, target, link = by_id[gate_id], by_id[target_id], by_id[link_id]

    if new_gate:
        lon, lat = (round(float(x), 5) for x in new_gate.split(","))
        moved = geo.metres(gate["geometry"]["coordinates"], [lon, lat])
        print(f"  kapı {gate_id} {moved:.0f} m taşındı -> [{lon},{lat}]")
        gate["geometry"]["coordinates"] = [lon, lat]

    ways = []
    for one in sels:
        if one.startswith("way:"):
            q = f'[out:json][timeout:180];way{one[4:]}({s},{w},{n},{e});out geom;'
        else:
            q = (f'[out:json][timeout:180];relation{one}({s},{w},{n},{e});'
                 f'way(r)[!"building"];out geom;')
        ways += ovp.ways(q)
    adj = graph.build_graph(ways, bridge_m=bridge)

    a = gate["geometry"]["coordinates"]
    b = target["geometry"]["coordinates"]
    na, da = graph.nearest(adj, a)
    nb, db = graph.nearest(adj, b)
    route, length = graph.shortest(adj, na, nb)
    if not route:
        print("  yol bulunamadı")
        return 1
    simple = LineString(route).simplify(TOL, preserve_topology=False)
    pts = [[round(x, 5), round(y, 5)] for x, y in simple.coords]
    pts = [a] + [p for p in pts if p != a and p != b] + [b]
    parts = densify([pts])
    worst, km, npt = geo.worst_segment(parts)
    print(f"  {link_id}: {km:.1f} km, {npt} nokta, en uzun düz segment {worst:.0f} m "
          f"(snap {da:.0f}/{db:.0f} m, graf yolu {length/1000:.1f} km, {len(ways)} way)")
    if apply:
        link["geometry"] = geo.as_geometry(parts)
        with open(path_file, "w") as fh:
            json.dump(fc, fh, separators=(",", ":"), ensure_ascii=False)
        print("  YAZILDI")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
