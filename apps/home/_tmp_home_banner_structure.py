# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
p = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js")
t = p.read_text(encoding="utf-8")

# Find hero / banner overlay section
idx = t.find("hero-content")
print("hero-content at", idx)
print(t[idx - 200 : idx + 800])
print("\n====\n")

# Find carousel and banner slides
idx = t.find("home-banner-carousel")
print("carousel at", idx)
print(t[idx - 100 : idx + 900])
print("\n====\n")

# Find text about 版权身份证 and surrounding
idx = t.find("版权身份证")
print("身份证 context:")
print(repr(t[idx - 300 : idx + 200]))

# active index / change handlers?
for pat in ["onChange", "activeIndex", "current", "banner1", "banner2", "text_group"]:
    print(pat, t.count(pat))
