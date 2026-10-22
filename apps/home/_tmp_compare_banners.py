# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js")

def dump(name):
    t = (root / name).read_text(encoding="utf-8")
    print("=" * 60, name)
    # Chinese string literals
    strs = re.findall(r'"([^"\\]{4,80})"', t)
    cn = [s for s in strs if re.search(r"[\u4e00-\u9fff]", s)]
    for s in cn:
        print(" STR:", s)
    # also look for template / children text near banner
    for m in re.finditer(r".{0,40}banner.{0,80}", t, re.I):
        print(" CTX:", m.group(0).replace("\n", " ")[:140])
    for m in re.finditer(r".{0,30}(slide|carousel|hero).{0,80}", t, re.I):
        print(" SL:", m.group(0).replace("\n", " ")[:140])

dump("index-LZ7b_aDw.js")
dump("index-rPx1fAAg.js")
