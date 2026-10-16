# -*- coding: utf-8 -*-
from pathlib import Path
root = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror")
needles = ["banner_search", "输入DCI", "快速查询", "regorg_duty", "duty-diagram", "query-hero", "hero-sub"]
out = []
for p in root.rglob("*"):
    if p.suffix.lower() not in {".js", ".css", ".html"}:
        continue
    try:
        s = p.read_text(encoding="utf-8")
    except Exception:
        continue
    for n in needles:
        i = s.find(n)
        if i >= 0:
            out.append(f"=== {p.name} :: {n} @ {i} ===")
            out.append(s[max(0, i-180): i+220])
            out.append("")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_query_duty.txt").write_text("\n".join(out), encoding="utf-8")
print("blocks", s.count("===") if False else len([x for x in out if x.startswith("===")]))
