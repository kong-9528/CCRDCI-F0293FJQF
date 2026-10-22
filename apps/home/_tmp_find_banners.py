# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js")
router = (root / "index-DA8BAxJb.js").read_text(encoding="utf-8")

for path in ["/dci/system", "/", "/index"]:
    m = re.search(rf'path:"{re.escape(path)}"[^}}]{{0,400}}', router)
    print("=== route", path)
    print(m.group(0) if m else "NOT FOUND")

# find lazy imports for system
for pat in [r"dci/system", r"views/index", r"portal"]:
    for m in re.finditer(pat, router):
        ctx = router[m.start() - 40 : m.start() + 160]
        if "import(" in ctx or ".vue" in ctx:
            print("---", pat, repr(ctx[:220]))

# search Chinese banner-like strings across js
keys = ["了解DCI", "DCI体系", "版权身份证", "权益凭证", "banner", "hero-title", "banner-title", "slide"]
for f in sorted(root.glob("*.js")):
    if f.name.startswith("index-DA8") or f.stat().st_size > 2_000_000:
        continue
    t = f.read_text(encoding="utf-8", errors="ignore")
    hits = [k for k in keys if k in t]
    if hits and ("banner" in t.lower() or "了解" in t or "版权身份证" in t or "DCI（" in t):
        print(f.name, hits, "size", f.stat().st_size)
