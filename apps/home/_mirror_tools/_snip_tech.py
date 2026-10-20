# -*- coding: utf-8 -*-
from pathlib import Path
import re

js = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js").read_text(encoding="utf-8")
css = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DLjiOJYG.css").read_text(encoding="utf-8")

# find image paths and section titles
hits = []
for m in re.finditer(r"/static/(?:png|jpg)/[A-Za-z0-9_@.-]+", js):
    hits.append(m.group(0))
for m in re.finditer(r"/static/(?:png|jpg)/[A-Za-z0-9_@.-]+", css):
    hits.append("CSS:"+m.group(0))

out = ["=== IMG PATHS ===", *sorted(set(hits))]
# titles around 版权
i = js.find("版权核验")
out.append("\n=== JS around 版权核验 ===")
out.append(js[max(0,i-200):i+1200] if i>=0 else "NOT FOUND")
i2 = js.find("tech-hero")
if i2 < 0: i2 = js.find("tc-hero")
if i2 < 0: i2 = css.find("tech-hero")
out.append("\n=== hero refs ===")
out.append(f"js tech-hero {js.find('tech-hero')} tc-hero {js.find('tc-hero')} banner {js.find('banner')}")

# extract CSS rules for cards and hero
rules = re.findall(r"\.[^{]*?(?:tech-hero|tc-hero|tc-card|tc-verify|verify|banner)[^{]*\{[^}]+\}", css)
out.append("\n=== CSS RULES ===")
out.extend(rules[:40])

Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_tech_snip.txt").write_text("\n".join(out), encoding="utf-8")
print("ok", len(css), len(js))
