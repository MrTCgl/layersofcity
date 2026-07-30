"""Realism audit: no rail line or arrival link may hold a >2 km straight segment.

Ferry lines are exempt: a boat crossing open water really is a straight line,
so the metre count says nothing about stylization there.

Usage: audit_omurga.py [city ...]     (no args = every city)
"""
import glob, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geo

ROOT = os.environ.get("LOC_ROOT", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
LIMIT = 2000.0
EXEMPT_LINEREF = {"ferry", "ship"}


def audit(city):
    rows, exempt = [], []
    for layer in ("omurga", "varis"):
        fn = f"{ROOT}/data/{city}/layers/{layer}.geojson"
        if not os.path.exists(fn):
            continue
        for ft in json.load(open(fn))["features"]:
            parts = geo.parts_of(ft["geometry"])
            if not parts:
                continue
            worst, km, n = geo.worst_segment(parts)
            if worst <= LIMIT:
                continue
            pr = ft["properties"]
            row = (worst, pr.get("id"), pr.get("ref"), km, n, layer)
            if pr.get("lineRef") in EXEMPT_LINEREF:
                exempt.append(row)
            else:
                rows.append(row)
    return rows, exempt


if __name__ == "__main__":
    cities = sys.argv[1:] or sorted(
        p.split(os.sep)[-3] for p in glob.glob(f"{ROOT}/data/*/layers/omurga.geojson"))
    bad = 0
    for city in cities:
        rows, exempt = audit(city)
        bad += len(rows)
        if rows:
            print(f"\n### {city} — {len(rows)} İHLAL")
            for w, i, r, km, n, layer in sorted(rows, reverse=True):
                print(f"  {w:8.0f}m  {str(i):24s} ref={str(r):12s} {km:7.1f}km {n:5d}pt  {layer}")
        if exempt:
            for w, i, r, km, n, layer in sorted(exempt, reverse=True):
                print(f"  (muaf: su üstü) {city}/{i} {w:.0f}m")
    print(f"\n{'TEMİZ' if not bad else str(bad) + ' İHLAL'} — {len(cities)} şehir tarandı")
    sys.exit(1 if bad else 0)
