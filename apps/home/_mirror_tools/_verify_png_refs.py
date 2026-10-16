# -*- coding: utf-8 -*-
import re
from pathlib import Path
root = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror")
pat = re.compile(r"/static/(?:png|jpg)/(?:banner2_index|banner_system|banner_standard|dci_meaning|banner_register_center|banner_ecosystem|banner_lab|lab_result|banner_search|login_bg(?:@2x)?)[^\"')\s]*")
hits = []
for p in root.rglob("*"):
    if p.suffix.lower() not in {".js", ".css", ".html"}:
        continue
    s = p.read_text(encoding="utf-8", errors="ignore")
    for m in pat.findall(s):
        hits.append(f"{p.name} {m}")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_png_refs_after.txt").write_text(
    "\n".join(sorted(set(hits))), encoding="utf-8"
)
print("\n".join(sorted(set(hits))))
