# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
home = (root / "js" / "index-LZ7b_aDw.js").read_text(encoding="utf-8")
i = home.find("function H(")
print("H:", repr(home[i : i + 60]))
print("system", 'H("/dci/system")' in home)
print("standard", 'H("/dci/standard")' in home)
for rel, sel in [
    ("css/index-BGhEYlK7.css", "hero-sub"),
    ("css/index-CSHWisZW.css", "hero-sub"),
    ("css/index-D5Nixirv.css", "hero-sub"),
    ("css/portal-BQh_66u9.css", "hero-sub"),
    ("css/index-DxJ3jNSK.css", "hero-sub"),
    ("css/index-DLjiOJYG.css", "tc-hero__lead"),
]:
    t = (root / rel).read_text(encoding="utf-8")
    m = re.search(rf"\.{re.escape(sel)}\[[^\]]+\]\{{[^}}]*\}}", t)
    print(rel, "->", m.group(0) if m else "MISSING")
