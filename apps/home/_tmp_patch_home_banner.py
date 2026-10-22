# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")

# --- 1) Homepage links ---
home_path = root / "js" / "index-LZ7b_aDw.js"
home = home_path.read_text(encoding="utf-8")
print("H usages:", len(re.findall(r"\bH\(", home)))
for m in re.finditer(r"H\([^\)]*\)", home):
    print(" ", m.group(0))

# Replace H function to router push
old_h = 'function H(i){const e=document.getElementById(i);e&&e.scrollIntoView({behavior:"smooth"})}'
# incomplete in file maybe - check full
m = re.search(r"function H\(i\)\{[^}]+\}", home)
print("full H:", m.group(0) if m else None)

# --- tech / lab hero markup ---
for name in ["index-hnrUP1Bs.js", "index-T6YfGpUy.js", "index-DLjiOJYG.css", "index-DxJ3jNSK.css"]:
    p = root / ("js" if name.endswith(".js") else "css") / name
    if not p.exists():
        print("missing", name)
        continue
    t = p.read_text(encoding="utf-8")
    print(f"\n=== {name} ===")
    if name.endswith(".js"):
        for m in re.finditer(r".{0,30}hero[-_]?\w*.{0,120}", t):
            print(m.group(0)[:160])
    else:
        for m in re.finditer(r"[^{]*hero[-_]?\w*[^{]*\{[^}]*\}", t):
            print(m.group(0)[:220])
