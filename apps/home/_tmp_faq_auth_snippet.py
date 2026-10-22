# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
t = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-7DLgF_Kn.js").read_text(
    encoding="utf-8"
)
# imports line
print(t[:350])
print("---")
m = re.search(r"r\(h,\{modelValue:.{0,200}", t)
print(m.group(0) if m else "no auth")
# find isRef alias - look for ?x.value=
for m in re.finditer(r"onUpdate:modelValue:.{0,80}", t):
    print(m.group(0))
