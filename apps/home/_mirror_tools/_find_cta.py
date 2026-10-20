# -*- coding: utf-8 -*-
from pathlib import Path
import re

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js"
).read_text(encoding="utf-8")
css = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DLjiOJYG.css"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_tc_cta.txt")
lines = []

# after card grid
i = js.find("tc-card-grid")
chunk = js[i : i + 2500]
lines.append("AFTER GRID:")
lines.append(chunk)

# look for button-ish in css
for m in re.finditer(
    r"\.[^{]*873a6031[^{]*\{[^}]*(?:padding|background|border-radius|font-size)[^}]*\}",
    css,
):
    s = m.group(0)
    if any(k in s for k in ["btn", "cta", "apply", "action", "link", "primary"]):
        lines.append("CSS " + s[:250])

# search unicode for 申请 via codepoints
target = "申请"
if target in js:
    lines.append("found apply text")
else:
    lines.append("apply text missing")
# search for arrow button patterns
for pat in ["→", "&#", "button", "onClick", "tc-"]:
    lines.append(f"count {pat}={js.count(pat)}")

# extract all static o('...') snippets containing 核验 section end
m = re.search(r"tc-section--verify[\s\S]{0,3000}tc-section--audit", js)
if m:
    lines.append("VERIFY_TO_AUDIT:")
    lines.append(m.group(0)[:2000])

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
