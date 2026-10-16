# -*- coding: utf-8 -*-
from pathlib import Path

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
s = js_path.read_text(encoding="utf-8")

i = s.find('e("span",AfArrow)')
snippet = s[i : i + 80]
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_vf2.txt").write_text(
    "snippet:\n" + snippet + "\n\nrepr:\n" + repr(snippet) + "\n\nbalance: parens=%d braces=%d brackets=%d"
    % (s.count("(") - s.count(")"), s.count("{") - s.count("}"), s.count("[") - s.count("]")),
    encoding="utf-8",
)

# Also compare against backup original balance
bak = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js.bak_flow")
b = bak.read_text(encoding="utf-8")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_vf2.txt").write_text(
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_vf2.txt").read_text(encoding="utf-8")
    + "\n\nbak balance: parens=%d braces=%d brackets=%d"
    % (b.count("(") - b.count(")"), b.count("{") - b.count("}"), b.count("[") - b.count("]")),
    encoding="utf-8",
)
print("wrote _vf2.txt")
