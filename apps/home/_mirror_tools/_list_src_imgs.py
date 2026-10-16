# -*- coding: utf-8 -*-
from pathlib import Path
src = Path(r"C:\Users\leste\Downloads")
out = []
for p in src.iterdir():
    if p.is_dir() and (p / "banner2_index.png").exists():
        out.append(str(p))
        for f in sorted(p.iterdir()):
            if f.is_file() and f.suffix.lower() in {".png", ".jpg"}:
                out.append(f"{f.name}\t{f.stat().st_size}")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_src_imgs.txt").write_text(
    "\n".join(out), encoding="utf-8"
)
print("ok")
