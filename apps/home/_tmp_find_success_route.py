# -*- coding: utf-8 -*-
from pathlib import Path
import sys
sys.stdout.reconfigure(encoding="utf-8")
t = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js").read_text(encoding="utf-8")
idx = t.find("/register/success")
print("count", t.count("/register/success"))
while idx >= 0:
    print("--- at", idx)
    print(t[idx-80:idx+220])
    idx = t.find("/register/success", idx + 1)
