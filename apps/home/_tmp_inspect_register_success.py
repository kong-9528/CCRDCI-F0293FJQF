# -*- coding: utf-8 -*-
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
router = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js").read_text(encoding="utf-8")

# Find register-related routes
for m in re.finditer(r'\{path:"/register[^"]*"[^}]*\}', router):
    print("ROUTE:", m.group(0)[:300])
    print("---")

# Find whiteList / no-auth patterns near beforeEach
for key in ["whiteList", "whitelist", "/register", "showLogin", "getToken", "to.path"]:
    print(key, "count", router.count(key))

# Extract navigation guard snippet
for pat in [
    r"whiteList\s*=\s*\[[^\]]+\]",
    r"const\s+\w+\s*=\s*\[[^\]]*(?:/login|/register)[^\]]*\]",
]:
    m = re.search(pat, router)
    if m:
        print("FOUND", pat, "=>", m.group(0)[:500])

# Search around "/register" string literals used as whitelist
idx = 0
n = 0
while n < 30:
    i = router.find('"/register"', idx)
    if i < 0:
        break
    ctx = router[max(0, i - 60) : i + 80]
    if "path:" not in ctx[:60] or "white" in ctx.lower() or "[" in ctx[:30]:
        print(f"lit@{i}:", repr(ctx))
    idx = i + 1
    n += 1

# Also look for beforeEach
m = re.search(r"beforeEach\((.*?)\)\s*\{", router)
if m:
    start = m.start()
    print("beforeEach at", start)
    print(router[start : start + 800])
