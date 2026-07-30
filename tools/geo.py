"""Shared geometry helpers for the omurga refit: stitch, clip, simplify, audit."""
import math
from shapely.geometry import LineString, MultiLineString, box
from shapely.ops import linemerge, unary_union


def metres(a, b):
    dx = (b[0] - a[0]) * 111320 * math.cos(math.radians((a[1] + b[1]) / 2))
    dy = (b[1] - a[1]) * 110570
    return math.hypot(dx, dy)


def parts_of(geom):
    """GeoJSON geometry -> list of coordinate lists."""
    if geom["type"] == "LineString":
        return [geom["coordinates"]]
    if geom["type"] == "MultiLineString":
        return list(geom["coordinates"])
    return []


def worst_segment(parts):
    """(longest straight segment in metres, total km, point count)."""
    worst = 0.0
    total = 0.0
    n = 0
    for p in parts:
        n += len(p)
        for a, b in zip(p, p[1:]):
            d = metres(a, b)
            total += d
            worst = max(worst, d)
    return worst, total / 1000, n


def to_parts(shp):
    if shp.is_empty:
        return []
    if shp.geom_type == "LineString":
        return [list(shp.coords)]
    if shp.geom_type in ("MultiLineString", "GeometryCollection"):
        out = []
        for g in shp.geoms:
            if g.geom_type == "LineString" and not g.is_empty:
                out.append(list(g.coords))
        return out
    return []


def build(way_coords, bounds, tol=0.00008, min_len_m=120, round_to=5):
    """Stitch OSM ways into simplified, clipped MultiLineString parts.

    Gaps between ways are left as gaps (separate parts) — never bridged with a
    straight line, which is exactly what produced the stylized long segments.
    """
    lines = [LineString(c) for c in way_coords if len(c) > 1]
    if not lines:
        return []
    merged = linemerge(unary_union(lines))
    parts = to_parts(merged)
    (w, s), (e, n) = bounds
    clip = box(w, s, e, n)
    out = []
    for p in parts:
        ls = LineString(p).intersection(clip)
        for q in to_parts(ls):
            q = LineString(q).simplify(tol, preserve_topology=False)
            coords = [[round(x, round_to), round(y, round_to)] for x, y in q.coords]
            # drop consecutive duplicates created by rounding
            dedup = [coords[0]]
            for c in coords[1:]:
                if c != dedup[-1]:
                    dedup.append(c)
            if len(dedup) < 2:
                continue
            if worst_segment([dedup])[1] * 1000 < min_len_m:
                continue
            out.append(dedup)
    return out


def as_geometry(parts):
    if len(parts) == 1:
        return {"type": "LineString", "coordinates": parts[0]}
    return {"type": "MultiLineString", "coordinates": parts}
