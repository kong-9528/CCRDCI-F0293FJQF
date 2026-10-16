# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
s = p.read_text(encoding="utf-8")

# Template area around first apply-flow class (~8839)
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_apply_flow_tpl.txt").write_text(
    s[8600:9800], encoding="utf-8"
)

# Animation / setup area before Q
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_apply_flow_setup.txt").write_text(
    s[9800:13200], encoding="utf-8"
)

# Render of items around 12754
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_apply_flow_render.txt").write_text(
    s[12600:14500], encoding="utf-8"
)

print("ok", len(s))
