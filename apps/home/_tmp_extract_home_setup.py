# -*- coding: utf-8 -*-
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding="utf-8")
t = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js").read_text(encoding="utf-8")
# print setup portion
start = t.find("setup(")
print(t[start : start + 1200])
print("---IMPORTS---")
print(t[:400])
