# -*- coding: utf-8 -*-
import re
from pathlib import Path
root = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror")
keys = [
    "banner2", "banner1", "bg_ecosystem", "bg_lab", "banner_system", "banner_standard",
    "country_standard", "industry_standard", "dci_app", "dci_meaning", "banner_regorg",
    "banner_register", "regorg_duty", "banner_ecosystem", "banner_lab", "lab_result",
    "banner_query", "banner_search", "login_bg", "national_standard",
]
pat = re.compile(r"/static/(?:png|jpg)/[A-Za-z0-9_@.-]+")
hits = []
for p in root.rglob("*"):
    if p.suffix.lower() not in {".js", ".css", ".html"}:
        continue
    try:
        s = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    for m in pat.findall(s):
        low = m.lower()
        if any(k in low for k in keys):
            hits.append(f"{p.relative_to(root)} :: {m}")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_img_refs.txt").write_text(
    "\n".join(sorted(set(hits))), encoding="utf-8"
)
print("hits", len(set(hits)))
