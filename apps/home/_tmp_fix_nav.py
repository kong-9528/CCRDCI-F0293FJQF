# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
out = []

home = (root / "js" / "index-LZ7b_aDw.js").read_text(encoding="utf-8")
for m in re.finditer(r"function H\([^)]*\)\{[^}]{0,400}\}", home):
    out.append("H fn: " + m.group(0))

# setup / router usage
m = re.search(r"setup\(([^)]*)\)\{(.{0,800})", home, re.S)
out.append("setup start: " + (m.group(0)[:800] if m else "none"))

# ids on page
for mid in ["dci-standard", "dci-regorg", "dci-system", "id:"]:
    out.append(f"count {mid}: {home.count(mid)}")

# mapDeps
router = (root / "js" / "index-DA8BAxJb.js").read_text(encoding="utf-8")
m = re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S)
files = re.findall(r'"([^"]+)"', m.group(1))
wanted = [
    "rPx1fAAg",
    "DXJtz4g7",
    "D8JrnKcV",
    "T6YfGpUy",
    "hnrUP1Bs",
    "portal-CGcjgAeB",
    "BGhEYlK7",
    "CSHWisZW",
    "D5Nixirv",
    "DxJ3jNSK",
    "DogJsFVJ",
    "BQh_66u9",
]
for i, f in enumerate(files):
    if any(w in f for w in wanted):
        out.append(f"{i} {f}")

# system page css - find __scopeId and import css from chunk map
# Directly read system js for scope and hero-sub style reference by browsing CSS linked in mapDeps of system import
# From earlier: system import __vite__mapDeps([40,11,12,13,41,42,14,15,43])
deps = [40, 11, 12, 13, 41, 42, 14, 15, 43]
out.append("system deps:")
for d in deps:
    out.append(f"  {d} {files[d]}")

# standard
# path standard mapDeps([36,11,12,13,37,38,14,15,39])
out.append("standard deps:")
for d in [36, 11, 12, 13, 37, 38, 14, 15, 39]:
    out.append(f"  {d} {files[d]}")

# ecology D8JrnKcV
idx = next(i for i, f in enumerate(files) if "D8JrnKcV" in f)
# find mapDeps call that imports it
for m in re.finditer(r"D8JrnKcV\.js\"\),__vite__mapDeps\(\[([^\]]+)\]\)", router):
    out.append("ecology mapDeps " + m.group(1))
    nums = [int(x.strip()) for x in m.group(1).split(",")]
    for n in nums:
        out.append(f"  {n} {files[n]}")

# lab
for m in re.finditer(r"T6YfGpUy\.js\"\),__vite__mapDeps\(\[([^\]]+)\]\)", router):
    out.append("lab mapDeps " + m.group(1))
    nums = [int(x.strip()) for x in m.group(1).split(",")]
    for n in nums:
        out.append(f"  {n} {files[n]}")

# tech
for m in re.finditer(r"hnrUP1Bs\.js\"\),__vite__mapDeps\(\[([^\]]+)\]\)", router):
    out.append("tech mapDeps " + m.group(1))
    nums = [int(x.strip()) for x in m.group(1).split(",")]
    for n in nums:
        out.append(f"  {n} {files[n]}")

# portal
for m in re.finditer(r"portal-CGcjgAeB\.js\"\),__vite__mapDeps\(\[([^\]]+)\]\)", router):
    out.append("portal mapDeps " + m.group(1))
    nums = [int(x.strip()) for x in m.group(1).split(",")]
    for n in nums:
        out.append(f"  {n} {files[n]}")

# extract all hero-sub rules with file
css_dir = root / "css"
for f in sorted(css_dir.glob("*.css")):
    t = f.read_text(encoding="utf-8")
    if "hero-sub" in t or "hero-subtitle" in t:
        out.append(f"\nCSS {f.name}")
        for m in re.finditer(r"[^{.\n]*\.(?:hero-sub|hero-subtitle)[^{]*\{[^}]*\}", t):
            out.append("  " + m.group(0))

Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_tmp_fix_nav_out.txt").write_text(
    "\n".join(out), encoding="utf-8"
)
print("wrote", len(out))
