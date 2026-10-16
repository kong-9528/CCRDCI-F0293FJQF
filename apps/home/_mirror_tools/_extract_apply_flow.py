# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
s = p.read_text(encoding="utf-8")

idx = s.find("const Q=[")
print("Q at", idx)
chunk = s[idx : idx + 8000]
out = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_apply_flow_chunk.txt")
out.write_text(chunk, encoding="utf-8")
print("wrote", out, "len", len(chunk))

# Also find template render for apply-flow
for kw in ["apply-flow", "is-on", "is-passed", "orb-dot", "requestAnimationFrame"]:
    positions = [m.start() for m in re.finditer(re.escape(kw), s)]
    print(kw, positions[:8], "count", len(positions))

# Find setup function surrounding Q
# Search for applyFlow or similar
for m in re.finditer(r"apply-flow[^\"]{0,40}", s):
    print("class hit", m.group(0), "at", m.start())
