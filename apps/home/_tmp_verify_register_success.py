# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
js_dir = root / "js"

# files exist
for name in ["registerSuccess-D9kQm2Lp.js", "registerSuccess-B7nWp4Hx.css"]:
    p = (js_dir if name.endswith(".js") else root / "css") / name
    print("exists", name, p.exists(), "bytes", p.stat().st_size if p.exists() else 0)

reg = (js_dir / "register-CvP1VOMb.js").read_text(encoding="utf-8")
print("redirect ok", '/register/success' in reg and 'showLogin' not in reg[reg.find("注册成功") - 20 : reg.find("注册成功") + 80])
i = reg.find("注册成功")
print("redirect snippet", repr(reg[i : i + 60]))

router = (js_dir / "index-DA8BAxJb.js").read_text(encoding="utf-8")
print("route present", 'path:"/register/success"' in router)
print("lazy present", "register/success.vue" in router)
print("mapDeps js", "registerSuccess-D9kQm2Lp.js" in router)
print("mapDeps css", "registerSuccess-B7nWp4Hx.css" in router)

# show route snippet
m = re.search(r'path:"/register/success"[^}]+}', router)
print("route", m.group(0) if m else None)
m = re.search(r'register/success\.vue[^)]+\)\)', router)
print("lazy", m.group(0) if m else None)

# check _ export used - register uses _ as X for withScopeId
js = (js_dir / "registerSuccess-D9kQm2Lp.js").read_text(encoding="utf-8")
print("js head", js[:200])
print("js has Auth", "index-BiQimQRe" in js)
print("js has scope", "data-v-a1b2c3d4" in js)
