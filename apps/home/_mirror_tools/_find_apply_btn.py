# -*- coding: utf-8 -*-
from pathlib import Path
import re

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js"
).read_text(encoding="utf-8")
css = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DLjiOJYG.css"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_tc_btn.txt")
lines = []

for key in ["申请", "apply", "btn", "cta", "primary"]:
    for m in re.finditer(key, js):
        lines.append(f"JS {key}@{m.start()}: {js[max(0,m.start()-60):m.start()+100]}")

lines.append("---CSS---")
for m in re.finditer(r"\.tc-[a-zA-Z0-9_-]*btn[^{]*\{[^}]+\}", css):
    lines.append(m.group(0)[:300])
for m in re.finditer(r"\.tc-[a-zA-Z0-9_-]*(?:cta|apply|action)[^{]*\{[^}]+\}", css):
    lines.append(m.group(0)[:300])

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, "n", len(lines))
