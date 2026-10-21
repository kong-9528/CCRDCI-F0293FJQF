# -*- coding: utf-8 -*-
from pathlib import Path
import re

p = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/portal-CGcjgAeB.js")
t = p.read_text(encoding="utf-8")
arrow = "\u2192"
m = re.search(r'e\("span",AfArrow,"(.*?)"\)', t)
if not m:
    raise SystemExit("AfArrow span not found")
print("before codes:", [hex(ord(c)) for c in m.group(1)])
t2 = t[: m.start(1)] + arrow + t[m.end(1) :]
p.write_text(t2, encoding="utf-8")
m2 = re.search(r'e\("span",AfArrow,"(.*?)"\)', t2)
print("after:", m2.group(0), [hex(ord(c)) for c in m2.group(1)])

# Also improve arrow CSS positioning to sit between tiles
css_path = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/portal-BQh_66u9.css")
css = css_path.read_text(encoding="utf-8")
old = (
    ".apply-flow__arrow[data-v-58bb0b90]{position:absolute;left:calc(50% + 40px);"
    "right:auto;top:22px;width:auto;height:auto;margin:0;border:none;transform:none;"
    "color:#8eb4e8;font-size:18px;line-height:1;font-weight:400;pointer-events:none;letter-spacing:0}"
)
new = (
    ".apply-flow__arrow[data-v-58bb0b90]{position:absolute;left:100%;top:22px;"
    "transform:translate(-50%,0);margin:0;border:none;color:#8eb4e8;font-size:20px;"
    "line-height:1;font-weight:400;pointer-events:none;letter-spacing:0;width:auto;height:auto}"
)
if old in css:
    css = css.replace(old, new, 1)
    css_path.write_text(css, encoding="utf-8")
    print("css arrow pos updated")
else:
    # try find current
    i = css.find(".apply-flow__arrow[data-v-58bb0b90]")
    print("arrow css snippet:", css[i : i + 280] if i >= 0 else "missing")
print("ok")
