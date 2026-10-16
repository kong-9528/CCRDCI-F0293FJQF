# -*- coding: utf-8 -*-
from pathlib import Path
s = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js").read_text(encoding="utf-8")
i = s.find('class:"apply-flow"')
j = s.find('Oe=N({__name:"portal"')
out = []
out.append(s[max(0, i - 100) : i + 1000])
out.append("\n---SETUP---\n")
out.append(s[j : j + 700])
out.append("\n---BALANCE---\n")
out.append(
    "parens %d braces %d brackets %d"
    % (s.count("(") - s.count(")"), s.count("{") - s.count("}"), s.count("[") - s.count("]"))
)
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_vf.txt").write_text(
    "".join(out), encoding="utf-8"
)
print("ok", i, j)
