# -*- coding: utf-8 -*-
from pathlib import Path

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
s = js_path.read_text(encoding="utf-8")

i = s.find('e("span",AfArrow)')
snippet = s[i : i + 60]
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_vf2.txt").write_text(
    snippet + "\n\nrepr=" + repr(snippet), encoding="utf-8"
)

# Current (broken): ])),64))])])]),
# Target:           ]),64))])])]),
old = 'e("span",AfArrow)])),64))])])]),e("div",Je,'
new = 'e("span",AfArrow)]),64))])])]),e("div",Je,'

print("old==new", old == new)
print("old in s", old in s)
print("old repr", repr(old[18:45]))
print("new repr", repr(new[18:45]))

if old not in s:
    raise SystemExit("pattern missing")

s = s.replace(old, new, 1)
print(
    "balance",
    s.count("(") - s.count(")"),
    s.count("{") - s.count("}"),
    s.count("[") - s.count("]"),
)
js_path.write_text(s, encoding="utf-8")
print("fixed")
