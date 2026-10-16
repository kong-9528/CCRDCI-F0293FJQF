# -*- coding: utf-8 -*-
from pathlib import Path
s = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js").read_text(encoding="utf-8")
i = s.find("Oe=N({__name:\"portal\"")
print(s[i:i+200])
print("---")
print("token?", "j.token" in s[i:i+250], "j.to" in s[i:i+250])
# show exact computed
import re
m = re.search(r"k=\$\(\(\)=>!!j\.\w+\)", s)
print("match", m.group(0) if m else None)
