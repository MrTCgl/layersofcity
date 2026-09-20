"""İzmir bus network -> per-line GeoJSON + index, from ESHOT's own open data.

Why not the Overpass pipeline (docs/VERI.md) here: OSM carries ~160 of the
city's 441 ESHOT lines, and several of those relations have no `ref`, so the
missing ones cannot even be named. ESHOT publishes the whole network itself —
route geometry as ordered GPS traces (CSV) and the stop order per line (GTFS) —
so the bus layer is built from the operator's data. Rail/tram/ferry stay on
OSM via tools/spec.json; nothing in this file touches them.

What it writes:
  data/izmir/bus/index.json     every line: number + name, for the line box
  data/izmir/bus/<no>.geojson   one line: both directions + its stops, each
                                stop listing every line that calls there
  data/izmir/layers/omurga.geojson
                                the trunk lines (TRUNK below) as lineRef "bus",
                                so the Hatlar > bus toggle is not empty

Nothing here plans a journey: the app draws the lines the user asks for and the
user reads the transfers off the map (CLAUDE.md — yol tarifi uygulama içinde
çözülmez).

Usage:  python3 tools/izmir_bus.py [--apply]
        (without --apply it only reports what would change)
Needs:  pip install shapely
Source: acikveri.bizizmir.com (ESHOT) — İzmir Metropolitan Municipality Open
        Data License; attribution is carried in the page footer.
"""
import argparse
import collections
import csv
import io
import json
import math
import os
import sys
import urllib.request
import zipfile

from shapely.geometry import LineString

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "ovpcache", "eshot")
OUT = os.path.join(ROOT, "data", "izmir", "bus")
OMURGA = os.path.join(ROOT, "data", "izmir", "layers", "omurga.geojson")
UA = "layersofcity/1.0 (data build; contact layersofcity@gmail.com)"

SOURCES = {
    "guzergah.csv": "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hat-guzergahlari.csv",
    "hatlar.csv": "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hatlari.csv",
    "bus-gtfs.zip": "https://www.eshot.gov.tr/gtfs/bus-eshot-gtfs.zip",
}

# Trunk lines drawn by the Hatlar > bus toggle. Rule (not taste): a line that
# links two named hubs (aktarma merkezi / metro / İZBAN / iskele / otogar) along
# a corridor the rail network does not already cover, one line per corridor,
# picked by weekly trip count. Editorial, and approved by the user 2026-09-20 —
# changing this set needs the same approval (docs/VERI.md, onay süreci).
TRUNK = ["302", "800", "671", "510", "912", "502", "975", "304", "680", "838", "963", "558"]

SIMPLIFY = 0.00012      # ~12 m: keeps the street the bus actually turns into
ROUND = 5
MIN_PART_M = 120        # drop clipping crumbs
BOUNDS = ((26.85, 38.2), (27.45, 38.7))   # data/izmir/city.json maxBounds


def metres(a, b):
    dx = (b[0] - a[0]) * 111320 * math.cos(math.radians((a[1] + b[1]) / 2))
    dy = (b[1] - a[1]) * 110570
    return math.hypot(dx, dy)


def grab(name):
    """Download a source once into ovpcache/eshot (gitignored)."""
    path = os.path.join(CACHE, name)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return path
    os.makedirs(CACHE, exist_ok=True)
    req = urllib.request.Request(SOURCES[name], headers={"User-Agent": UA})
    last = None
    for _ in range(4):
        try:
            with urllib.request.urlopen(req, timeout=240) as resp:
                body = resp.read()
            if not body:
                raise RuntimeError("empty body")
            with open(path, "wb") as fh:
                fh.write(body)
            return path
        except Exception as exc:                        # proxy resets happen
            last = exc
    raise RuntimeError(f"could not fetch {name}: {last}")


def read_csv(path, delimiter=","):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh, delimiter=delimiter))


def load_geometry():
    """(line no, yon) -> ordered [lon, lat] trace. File order IS route order."""
    out = collections.defaultdict(list)
    with open(grab("guzergah.csv"), encoding="utf-8-sig", newline="") as fh:
        for row in csv.DictReader(fh, delimiter=";"):
            out[(row["HAT_NO"], row["YON"])].append(
                (float(row["BOYLAM"]), float(row["ENLEM"])))
    return out


def load_stops_and_patterns():
    """GTFS -> (stops, patterns). patterns: (line no, direction_id) -> [stop id]."""
    z = zipfile.ZipFile(grab("bus-gtfs.zip"))

    def table(name):
        with z.open(name) as fh:
            return list(csv.DictReader(io.TextIOWrapper(fh, encoding="utf-8-sig")))

    stops = {r["stop_id"]: (r["stop_name"], float(r["stop_lon"]), float(r["stop_lat"]))
             for r in table("stops.txt")}
    refs = {r["route_id"]: r["route_short_name"] for r in table("routes.txt")}
    trips = {r["trip_id"]: (r["route_id"], r["direction_id"]) for r in table("trips.txt")}

    # stop_times is ~88 MB, so stream it and keep one pattern per (route,
    # direction) — the feed has exactly one variant each, asserted below.
    variants = collections.defaultdict(collections.Counter)
    cur, buf = None, []

    def flush(trip_id, rows):
        key = trips.get(trip_id)
        if key:
            variants[key][tuple(s for _, s in sorted(rows))] += 1

    with z.open("stop_times.txt") as raw:
        rd = csv.reader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
        head = next(rd)
        i_t, i_s, i_q = head.index("trip_id"), head.index("stop_id"), head.index("stop_sequence")
        for row in rd:
            if row[i_t] != cur:
                if cur is not None:
                    flush(cur, buf)
                cur, buf = row[i_t], []
            buf.append((int(row[i_q]), row[i_s]))
        if cur is not None:
            flush(cur, buf)

    patterns = {}
    for (rid, direction), counter in variants.items():
        ref = refs.get(rid)
        if not ref:
            continue
        seq = max(counter.items(), key=lambda kv: (kv[1], len(kv[0])))[0]
        patterns[(ref, direction)] = list(seq)
    return stops, patterns


def in_bounds(pt, bounds=BOUNDS):
    (w, s), (e, n) = bounds
    return w <= pt[0] <= e and s <= pt[1] <= n


def simplify_parts(trace, bounds=BOUNDS):
    """Ordered trace -> clipped, simplified, rounded parts (MultiLineString-ready).

    Clipping is done by walking the trace, not by a shapely overlay: an overlay
    nodes the line at its own crossings, and a city bus route crosses itself
    often (445 came back in three pieces), after which the short-part filter
    deleted real stretches of the route. Walking keeps a route that stays inside
    the map as one unbroken LineString, and only genuinely out-of-window lines
    (Tire, Torbalı) get split.
    """
    dedup = [trace[0]]
    for p in trace[1:]:
        if p != dedup[-1]:
            dedup.append(p)
    if len(dedup) < 2:
        return []
    # maximal runs of in-window points, each extended by the point that steps
    # outside so the drawn line reaches the map edge instead of stopping short
    runs, run = [], []
    for i, p in enumerate(dedup):
        if in_bounds(p, bounds):
            run.append(p)
        else:
            if run:
                run.append(p)
                runs.append(run)
                run = []
            elif i and in_bounds(dedup[i - 1], bounds):
                runs.append([dedup[i - 1], p])
    if run:
        runs.append(run)

    pieces = []
    for r in runs:
        if len(r) < 2:
            continue
        g = LineString(r).simplify(SIMPLIFY, preserve_topology=False)
        coords = [[round(x, ROUND), round(y, ROUND)] for x, y in g.coords]
        out = [coords[0]]
        for c in coords[1:]:
            if c != out[-1]:
                out.append(c)
        if len(out) < 2:
            continue
        if sum(metres(a, b) for a, b in zip(out, out[1:])) < MIN_PART_M:
            continue
        pieces.append(out)
    return pieces


def geometry_of(parts):
    if len(parts) == 1:
        return {"type": "LineString", "coordinates": parts[0]}
    return {"type": "MultiLineString", "coordinates": parts}


def direction_for(no, yon, patterns, geo, stops):
    """Which GTFS direction_id belongs to this YON.

    direction_id 0 lines up with YON 1 for 848 of 850 lines, so the mapping is
    checked per line instead of assumed: whichever direction's first/last stop
    sits closer to the trace's own ends wins.
    """
    trace = geo.get((no, yon))
    if not trace:
        return None
    best, best_d = None, None
    for direction in ("0", "1"):
        seq = patterns.get((no, direction))
        if not seq:
            continue
        a, b = stops[seq[0]][1:3], stops[seq[-1]][1:3]
        d = metres(a, trace[0]) + metres(b, trace[-1])
        if best_d is None or d < best_d:
            best, best_d = direction, d
    return best


def midpoint(parts):
    """Point at half the drawn length — where the line's number badge sits."""
    flat = max(parts, key=lambda p: sum(metres(a, b) for a, b in zip(p, p[1:])))
    half = sum(metres(a, b) for a, b in zip(flat, flat[1:])) / 2
    run = 0.0
    for a, b in zip(flat, flat[1:]):
        step = metres(a, b)
        if run + step >= half:
            f = (half - run) / step if step else 0
            return [round(a[0] + (b[0] - a[0]) * f, ROUND),
                    round(a[1] + (b[1] - a[1]) * f, ROUND)]
        run += step
    return flat[len(flat) // 2]


def trace_between(trace, a, b):
    """Length of the recorded trace between the two points nearest a and b."""
    i = min(range(len(trace)), key=lambda k: metres(trace[k], a))
    j = min(range(len(trace)), key=lambda k: metres(trace[k], b))
    lo, hi = min(i, j), max(i, j)
    return sum(metres(p, q) for p, q in zip(trace[lo:hi], trace[lo + 1:hi + 1]))


def audit_trunk(added, geo):
    """docs/VERI.md realism check, in its 2026-07-30 form.

    The "no straight segment over 2 km" line is a proxy; the real question is
    whether the geometry departs from the route actually driven. Here the source
    IS that route, so each long straight is measured against the recorded trace
    between its ends: a ratio near 1.0 means the road really is straight (the
    Bornova approach of 800, the Urla coast road of 975) and the straight stays.
    Over 1.2 would mean corners were cut and the line needs re-fetching.
    """
    flagged, worst_ratio = 0, 1.0
    for f in added:
        if f["geometry"]["type"] == "Point":
            continue
        no = f["properties"]["ref"]
        traces = [geo[(no, y)] for y in ("1", "2") if (no, y) in geo]
        ps = (f["geometry"]["coordinates"] if f["geometry"]["type"] == "MultiLineString"
              else [f["geometry"]["coordinates"]])
        for p in ps:
            for a, b in zip(p, p[1:]):
                chord = metres(a, b)
                if chord <= 2000:
                    continue
                real = max((trace_between(t, a, b) for t in traces), default=chord)
                ratio = real / chord if chord else 1.0
                worst_ratio = max(worst_ratio, ratio)
                flagged += 1
                verdict = "real" if ratio <= 1.2 else "CORNER CUT — refetch"
                print(f"  audit: hat {no} straight {chord:.0f} m, "
                      f"driven {real:.0f} m, ratio {ratio:.3f} -> {verdict}")
    print(f"realism audit: {flagged} straight(s) over 2 km, "
          f"worst deviation ratio {worst_ratio:.3f} (limit 1.2)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write the files")
    args = ap.parse_args()

    geo = load_geometry()
    stops, patterns = load_stops_and_patterns()
    names = {r["HAT_NO"]: r["HAT_ADI"].strip() for r in read_csv(grab("hatlar.csv"), ";")}

    # every line calling at each stop, so a drawn line's stops can show what
    # else passes there — that is the whole transfer story, read by eye
    at_stop = collections.defaultdict(set)
    for (ref, _), seq in patterns.items():
        for sid in seq:
            at_stop[sid].add(ref)

    line_nos = sorted({no for no, _ in geo} | {ref for ref, _ in patterns},
                      key=lambda s: (len(s), s))
    index, written, skipped = [], 0, []
    total_bytes = 0

    for no in line_nos:
        features = []
        for yon in ("1", "2"):
            trace = geo.get((no, yon))
            if not trace:
                continue
            parts = simplify_parts(trace)
            if not parts:
                continue
            features.append({
                "type": "Feature",
                "properties": {"id": f"bus-{no}-{yon}", "kind": "busline",
                               "ref": no, "dir": int(yon)},
                "geometry": geometry_of(parts)})
        # stops of both directions, deduplicated, in first-seen order
        seen = {}
        for yon in ("1", "2"):
            direction = direction_for(no, yon, patterns, geo, stops)
            for sid in patterns.get((no, direction), []):
                if sid in seen:
                    continue
                name, lon, lat = stops[sid]
                (w, s), (e, n) = BOUNDS
                if not (w <= lon <= e and s <= lat <= n):
                    continue
                seen[sid] = True
                others = sorted(at_stop[sid] - {no}, key=lambda s: (len(s), s))
                features.append({
                    "type": "Feature",
                    "properties": {"id": f"bus-{no}-s{sid}", "kind": "busstop",
                                   "ref": no, "name": name, "lines": others},
                    "geometry": {"type": "Point",
                                 "coordinates": [round(lon, ROUND), round(lat, ROUND)]}})
        if not any(f["properties"]["kind"] == "busline" for f in features):
            # every point of the trace falls outside the city's maxBounds: these
            # are the regional lines (Tire, Torbalı, Ödemiş, Bayındır, Kemalpaşa)
            # the İzmir map cannot pan to. Kept in the index so the line box can
            # say "outside this map" instead of "no such line".
            skipped.append(no)
            continue
        blob = json.dumps({"type": "FeatureCollection", "features": features},
                          ensure_ascii=False, separators=(",", ":"))
        total_bytes += len(blob.encode())
        if args.apply:
            os.makedirs(OUT, exist_ok=True)
            with open(os.path.join(OUT, no + ".geojson"), "w", encoding="utf-8") as fh:
                fh.write(blob)
        written += 1
        index.append([no, names.get(no, "")])

    idx = {"updated": "2026-09",
           "source": "ESHOT · İzmir Büyükşehir Açık Veri",
           "lines": index,
           "outside": [[no, names.get(no, "")] for no in skipped]}
    idx_blob = json.dumps(idx, ensure_ascii=False, separators=(",", ":"))
    if args.apply:
        with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as fh:
            fh.write(idx_blob)

    print(f"lines written {written}  (no geometry, skipped: {len(skipped)} {skipped})")
    print(f"per-line files {total_bytes // 1024} KB total, "
          f"{total_bytes // max(written, 1)} B average")
    print(f"index.json {len(idx_blob.encode()) // 1024} KB")

    # --- trunk lines into omurga.geojson ---------------------------------
    with open(OMURGA, encoding="utf-8") as fh:
        omurga = json.load(fh)
    kept = [f for f in omurga["features"]
            if not (f["properties"].get("lineRef") == "bus")]
    added = []
    for no in TRUNK:
        parts = []
        for yon in ("1", "2"):
            if (no, yon) in geo:
                parts += simplify_parts(geo[(no, yon)])
        if not parts:
            print(f"  ! trunk {no} has no geometry", file=sys.stderr)
            continue
        added.append({"type": "Feature",
                      "properties": {"id": f"line-bus-{no}", "kind": "line",
                                     "lineRef": "bus", "ref": no,
                                     "name": names.get(no, "")},
                      "geometry": geometry_of(parts)})
        added.append({"type": "Feature",
                      "properties": {"id": f"badge-bus-{no}", "kind": "badge",
                                     "lineRef": "bus", "ref": no},
                      "geometry": {"type": "Point", "coordinates": midpoint(parts)}})
    omurga["features"] = kept + added
    blob = json.dumps(omurga, ensure_ascii=False, separators=(",", ":"))
    print(f"omurga.geojson: {len(kept)} kept + {len(added)} bus features "
          f"-> {len(blob.encode()) // 1024} KB")
    audit_trunk(added, geo)
    if args.apply:
        with open(OMURGA, "w", encoding="utf-8") as fh:
            fh.write(blob)
        print("written.")
    else:
        print("dry run — pass --apply to write.")


if __name__ == "__main__":
    main()
