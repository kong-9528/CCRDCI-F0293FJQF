# -*- coding: utf-8 -*-
from pathlib import Path
out = []
for root in [Path(r"C:\Users\leste\Downloads"), Path(r"C:\Users\leste\Desktop"), Path(r"C:\Users\leste\AppData\Roaming\Cursor\User\workspaceStorage\7a99a250099a926a43f880d212352a81\images")]:
    if not root.exists():
        continue
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        n = p.name
        if any(k in n for k in ["技术服务", "核验图", "banner_技", "tech-center", "tech_center", "核验"]):
            out.append(f"{p.stat().st_size}\t{p}")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_tech_imgs.txt").write_text("\n".join(out), encoding="utf-8")
print("count", len(out))
