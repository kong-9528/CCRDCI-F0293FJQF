# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
# mapDeps for home index-LZ7b_aDw - css index from router
router = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js").read_text(encoding="utf-8")
m = re.search(r'import\("\./index-LZ7b_aDw\.js"\),__vite__mapDeps\(\[([^\]]+)\]\)', router)
print("deps", m.group(1) if m else None)
files = re.findall(r'"([^"]+)"', re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S).group(1))
if m:
    idxs = [int(x) for x in m.group(1).split(",")]
    for i in idxs:
        print(i, files[i])

css_root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css")
# find css with hero-content / paragraph_1
for f in css_root.glob("*.css"):
    t = f.read_text(encoding="utf-8", errors="ignore")
    if "paragraph_1" in t or "home-banner-carousel" in t:
        print("CSS FILE", f.name)
        for pat in ["paragraph_1", "text_15", "hero-content", "text-group_1", "home-banner", "banner-slide"]:
            for mm in re.finditer(rf"[^{{]*{pat}[^{{]*\{{[^}}]*\}}", t):
                print(" ", mm.group(0)[:220])
