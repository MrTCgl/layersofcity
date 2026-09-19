"""js/world-dots-fine.js uretici.

Acilis haritasinin ince nokta dokusunu, mevcut js/world-dots.js verisinden
turetir: her noktanin cevresinde 3.5 birimlik disk birlesimi bir kara maskesi
verir, maske yari araliklu izgarayla yeniden orneklenir. Cikti koordinat listesi
degil, hucre basina bir bit (base64) — ~240 KB yerine ~11 KB.

Kullanim: depo kokunde `python3 tools/gen_world_dots_fine.py`
"""

import re, io, math, base64
from collections import defaultdict

src = io.open("js/world-dots.js", encoding="utf-8").read()
nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', src.split('=',1)[1])]
pts = list(zip(nums[0::2], nums[1::2]))

R, CELL = 3.5, 8.0
buck = defaultdict(list)
for x, y in pts: buck[(int(x // CELL), int(y // CELL))].append((x, y))
def is_land(px, py):
    cx, cy, r2 = int(px // CELL), int(py // CELL), R * R
    for i in (cx-1, cx, cx+1):
        for j in (cy-1, cy, cy+1):
            for x, y in buck.get((i, j), ()):
                if (x-px)**2 + (y-py)**2 <= r2: return True
    return False

X0, Y0, SX, SY = 10.0, 24.0, 5.2/2, 4.625/2
COLS = int((998.0 - X0) / SX) + 1
ROWS = int((398.0 - Y0) / SY) + 1
bits = bytearray((COLS * ROWS + 7) // 8)
n = 0
for row in range(ROWS):
    y = Y0 + row * SY
    ox = SX / 2 if row % 2 else 0.0
    for col in range(COLS):
        x = X0 + ox + col * SX
        if x <= 998.0 and is_land(x, y):
            i = row * COLS + col
            bits[i >> 3] |= 1 << (i & 7)
            n += 1
b64 = base64.b64encode(bytes(bits)).decode()
out = f"""// Fine world dot fabric — used when the opening map is drawn large (big
// tablets, a zoomed-in view), so the halftone stays the same size on screen
// instead of growing into blobs. See renderWorldDots() in app.js.
//
// Stored as a LAND BITMASK on the fine lattice, not as coordinates: {n} dots
// would be ~240 KB as x,y pairs; one bit per cell is {len(b64)//1024} KB. Derived
// from js/world-dots.js (union of 3.5-unit disks around today's dots), so the
// silhouette is identical — only the halftone is finer.
const WORLD_DOTS_FINE = {{
  x0: {X0}, y0: {Y0}, sx: {SX}, sy: {SY}, cols: {COLS}, rows: {ROWS},
  bits: "{b64}"
}};
"""
io.open("js/world-dots-fine.js", "w", encoding="utf-8").write(out)
print(f"{n} nokta, izgara {COLS}x{ROWS}, base64 {len(b64)/1024:.1f} KB")
