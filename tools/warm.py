"""Warm the Overpass cache for every spec query, a few in parallel.

Sequential fetching is painfully slow when a mirror is loaded, so this walks
the specs and pulls anything not cached yet with a small thread pool (one
request per mirror, roughly).

Usage: warm.py [city ...]     (no args = every city in the specs)
"""
import hashlib, json, os, sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ovp

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get("LOC_ROOT", os.path.join(HERE, ".."))


def queries(cities):
    out = []
    for fn in ("spec.json", "spec_varis.json"):
        spec = json.load(open(os.path.join(HERE, fn)))
        for city, entries in spec.items():
            if cities and city not in cities:
                continue
            (w, s), (e, n) = json.load(open(f"{ROOT}/data/{city}/city.json"))["maxBounds"]
            for fid, sel in entries.items():
                if isinstance(sel, dict):
                    sel = sel["sel"]
                q = (f'[out:json][timeout:180];relation{sel}({s},{w},{n},{e});'
                     f'way(r)[!"building"];out geom;')
                key = hashlib.md5(q.encode()).hexdigest()
                if not os.path.exists(os.path.join(ovp.CACHE, key + ".json")):
                    out.append((city, fid, q))
    return out


def run(job):
    city, fid, q = job
    try:
        body = ovp.fetch(q, timeout=90, tries=2)
        return f"OK   {city}/{fid}  {len(body.get('elements', []))} eleman"
    except Exception as exc:
        return f"HATA {city}/{fid}: {str(exc)[:70]}"


if __name__ == "__main__":
    jobs = queries(set(sys.argv[1:]))
    print(f"{len(jobs)} sorgu ısıtılacak", flush=True)
    with ThreadPoolExecutor(max_workers=3) as ex:
        for line in ex.map(run, jobs):
            print(line, flush=True)
