"""Overpass fetch helper: mirror rotation, md5 cache, never cache empty answers."""
import hashlib, json, os, time, urllib.parse, urllib.request

MIRRORS = [
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
CACHE = os.environ.get("LOC_OVPCACHE") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "ovpcache")
os.makedirs(CACHE, exist_ok=True)
UA = "layersofcity/1.0 (data build; contact layersofcity@gmail.com)"


def fetch(query, timeout=75, tries=3, allow_empty=False):
    """Run an Overpass query, returning the parsed JSON dict."""
    key = hashlib.md5(query.encode()).hexdigest()
    path = os.path.join(CACHE, key + ".json")
    if os.path.exists(path):
        with open(path) as fh:
            return json.load(fh)
    data = urllib.parse.urlencode({"data": query}).encode()
    last = None
    for attempt in range(tries):
        for url in MIRRORS:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
            try:
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    body = json.loads(resp.read().decode())
            except Exception as exc:  # 504/429/timeout -> next mirror
                last = f"{url.split('/')[2]}: {exc}"
                continue
            if body.get("elements") or allow_empty:
                with open(path, "w") as fh:
                    json.dump(body, fh)
                return body
            last = f"{url.split('/')[2]}: empty elements"
        time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"overpass failed: {last}")


def ways(query, **kw):
    """Return [[lon,lat], ...] coordinate lists for every way in the answer."""
    body = fetch(query, **kw)
    out = []
    for el in body.get("elements", []):
        if el.get("type") == "way" and el.get("geometry"):
            out.append([[p["lon"], p["lat"]] for p in el["geometry"]])
    return out
