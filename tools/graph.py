"""Route graph over OSM ways: bridge small gaps, shortest path between points.

Used both to diagnose long straight segments (is the real track really straight
between these two points?) and to rebuild arrival links along real geometry.
"""
import heapq
from geo import metres


def _key(c, prec=6):
    return (round(c[0], prec), round(c[1], prec))


def build_graph(way_coords, bridge_m=70):
    """Nodes = rounded coordinates, edges = consecutive way vertices.

    Endpoints of distinct ways closer than `bridge_m` are joined so that
    fragmented OSM geometry still forms one traversable network.
    """
    adj = {}

    def add(a, b):
        d = metres(a, b)
        adj.setdefault(_key(a), []).append((_key(b), d))
        adj.setdefault(_key(b), []).append((_key(a), d))

    ends = []
    for coords in way_coords:
        if len(coords) < 2:
            continue
        for a, b in zip(coords, coords[1:]):
            add(a, b)
        ends.append(coords[0])
        ends.append(coords[-1])

    # bridge nearby way endpoints, bucketed on a ~1 km grid so dense networks
    # (NJ Transit, NYC subway) stay fast
    cell = 0.01
    grid = {}
    for p in ends:
        grid.setdefault((int(p[0] / cell), int(p[1] / cell)), []).append(p)
    for (cx, cy), pts in grid.items():
        near = []
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                near += grid.get((cx + dx, cy + dy), ())
        for a in pts:
            for b in near:
                if _key(a) == _key(b):
                    continue
                d = metres(a, b)
                if d <= bridge_m:
                    adj.setdefault(_key(a), []).append((_key(b), d))
                    adj.setdefault(_key(b), []).append((_key(a), d))
    return adj


def nearest(adj, pt):
    best, bd = None, 1e18
    for k in adj:
        d = metres(pt, k)
        if d < bd:
            best, bd = k, d
    return best, bd


def shortest(adj, src, dst):
    """Dijkstra between two graph nodes -> ([coords], length_m) or (None, None)."""
    dist = {src: 0.0}
    prev = {}
    pq = [(0.0, src)]
    seen = set()
    while pq:
        d, u = heapq.heappop(pq)
        if u in seen:
            continue
        seen.add(u)
        if u == dst:
            break
        for v, w in adj.get(u, ()):
            nd = d + w
            if nd < dist.get(v, 1e18):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(pq, (nd, v))
    if dst not in dist:
        return None, None
    path = [dst]
    while path[-1] != src:
        path.append(prev[path[-1]])
    path.reverse()
    return [list(p) for p in path], dist[dst]
