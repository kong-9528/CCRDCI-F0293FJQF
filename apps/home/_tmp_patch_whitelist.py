# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
p = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js")
t = p.read_text(encoding="utf-8")

# Find j1e
for pat in [r"function j1e\([^)]*\)\{[^}]+\}", r"j1e=\([^)]*\)=>[^,;]+", r"j1e=function[^}]+\}", r"const j1e=[^,;]+"]:
    mm = re.search(pat, t)
    if mm:
        print("j1e:", mm.group(0)[:300])

# path-to-regexp style - search nearby
idx = t.find("j1e=")
if idx < 0:
    idx = t.find("function j1e")
print("near j1e assign:", t[max(0,idx-100):idx+200] if idx>=0 else None)

# Just add /register/success to whitelist after /register
old = 'const whe=["/","/index","/login","/loginOrg","/register","/dci/system"'
new = 'const whe=["/","/index","/login","/loginOrg","/register","/register/success","/dci/system"'
if "/register/success" in t[t.find("const whe=") : t.find("const whe=") + 300]:
    print("already in whitelist")
elif old not in t:
    raise SystemExit("whitelist pattern not found")
else:
    t = t.replace(old, new, 1)
    p.write_text(t, encoding="utf-8")
    print("patched whitelist")
    m = re.search(r"const whe=\[[^\]]+\]", t)
    print(m.group(0))
