# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
router = (root / "js" / "index-DA8BAxJb.js").read_text(encoding="utf-8")
files = re.findall(r'"([^"]+)"', re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S).group(1))

for path in ["/dci/faq", "/dci/contact", "/register"]:
    m = re.search(rf'path:"{re.escape(path)}",component:\(\)=>Ot\(\(\)=>import\("\./([^"]+)"\),__vite__mapDeps\(\[([^\]]+)\]\)\)', router)
    if not m:
        print(path, "NOT FOUND")
        continue
    print(path, "file", m.group(1), "deps", m.group(2))
    for n in m.group(2).split(","):
        print(" ", int(n), files[int(n)])

# homepage showLogin
home = (root / "js" / "index-LZ7b_aDw.js").read_text(encoding="utf-8")
for m in re.finditer(r".{0,40}showLogin.{0,100}", home):
    print("home showLogin", m.group(0)[:160])
