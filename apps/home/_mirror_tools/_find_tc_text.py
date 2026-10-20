# -*- coding: utf-8 -*-
from pathlib import Path
import re

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js"
).read_text(encoding="utf-8")
css = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DLjiOJYG.css"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_tc_text_classes.txt")
lines = []

# all class:"tc-..."
classes = sorted(set(re.findall(r'class:"(tc-[^"]+)"', js)))
lines.append("JS classes:")
lines.extend(classes)

# static HTML classes in o('...')
for m in re.finditer(r'class="(tc-[^"]+)"', js):
    pass
classes2 = sorted(set(re.findall(r'class="(tc-[^"]+)"', js)))
lines.append("HTML classes:")
lines.extend(classes2)

# font-size rules
lines.append("CSS font rules:")
for m in re.finditer(r"([^{]+)\{([^}]*font-size:[^}]*)\}", css):
    sel, body = m.group(1), m.group(2)
    if "873a6031" in sel or sel.strip().startswith(".tc-"):
        fs = re.search(r"font-size:([^;]+)", body)
        lines.append(f"  {sel.strip()[:80]} -> {fs.group(1) if fs else '?'}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
