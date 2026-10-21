# -*- coding: utf-8 -*-
from pathlib import Path
import re

js_path = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js\opusRdetails-BcBlhLGL.js"
)
js = js_path.read_text(encoding="utf-8")
out = Path(__file__).with_name("_opusR_analysis2.txt")
lines = []
lines.append("imports_head=" + js[:500])
# find fetch/get/post patterns
for pat in [
    r"get[A-Za-z]+\(",
    r"fetch[A-Za-z]*\(",
    r"request\(",
    r"\.get\(",
    r"\.post\(",
    r"codeManage",
    r"dciManage",
    r"opus",
]:
    ms = list(re.finditer(pat, js))
    lines.append(f"{pat} count={len(ms)}")
    for m in ms[:5]:
        lines.append("  ctx=" + js[max(0, m.start() - 30) : m.start() + 80])

# full dump of string literals containing /
strs = re.findall(r'"(/[^"]+)"', js)
lines.append("slash_strings=" + repr(strs))
strs2 = re.findall(r"'(/[^']+)'", js)
lines.append("slash_strings2=" + repr(strs2))

# look at companion API modules
for name in [
    "opusDwcr",
    "opus",
    "allocation",
    "index-allocation",
]:
    pass

# find files referencing opusRdetails
mirror = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js")
refs = []
for p in mirror.glob("*.js"):
    try:
        t = p.read_text(encoding="utf-8")
    except Exception:
        continue
    if "opusRdetails" in t or "opusRdetails-BcBlhLGL" in t:
        refs.append(p.name)
lines.append("refs=" + repr(refs))

# also search routes in all js for codeManage-details
route_hits = []
for p in mirror.glob("*.js"):
    try:
        t = p.read_text(encoding="utf-8")
    except Exception:
        continue
    if "codeManage-details" in t or "opusR/" in t:
        route_hits.append(p.name)
lines.append("route_files=" + repr(route_hits[:30]))

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
