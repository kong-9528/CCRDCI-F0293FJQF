# -*- coding: utf-8 -*-
from pathlib import Path
import re

p = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-E5LiAQ_v.js")
t = p.read_text(encoding="utf-8")

# Find life-braces template block
idx = t.find("life-braces")
print("=== around life-braces ===")
print(t[idx - 200 : idx + 600])
print()

# Find icon:"code" and template condition
idx2 = t.find('icon:"code"')
print("=== data ===")
print(t[idx2 - 150 : idx2 + 200])
print()

# Find render for pill icons
for m in re.finditer(r"life-braces|t\.icon|icon===|===\"code\"|===\"db\"|===\"lock\"", t):
    i = m.start()
    print("---", m.group(), "---")
    print(t[max(0, i - 80) : i + 200])
    print()

# CSS
css_dir = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css")
for f in css_dir.glob("*.css"):
    c = f.read_text(encoding="utf-8")
    if "life-braces" in c or "life-pill" in c:
        print("CSS FILE", f.name)
        for m in re.finditer(r"[^{]*life-braces[^{]*\{[^}]*\}", c):
            print(m.group(0))
        # also print nearby life-ico--sm
        for m in re.finditer(r"[^{]*life-ico[^{]*\{[^}]*\}", c):
            print(m.group(0)[:200])
