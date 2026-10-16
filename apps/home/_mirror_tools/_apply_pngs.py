# -*- coding: utf-8 -*-
"""Copy original PNGs without recompression and point pages at them."""
import shutil
from pathlib import Path

src_dir = next(
    p for p in Path(r"C:\Users\leste\Downloads").iterdir()
    if p.is_dir() and (p / "banner2_index.png").exists()
)
dst = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\png")

def src(name: str) -> Path:
    p = src_dir / name
    if not p.exists():
        raise SystemExit(f"missing source {name}")
    return p

# dest filename -> source filename
copies = {
    "banner2_index.png": "banner2_index.png",
    "bg_ecosystem.png": "bg_ecosystem.png",
    "bg_lab.png": "bg_lab.png",
    "banner_standard.png": "banner_standard.png",
    "dci_meaning.png": "DCI含义图片.png",
    "country_standard.png": "country_standard.png",
    "industry_standard.png": "行业标准.png",
    "dci_app_scenes.png": "DCI贯标应用.png",
    "banner_register_center.png": "banner_register_center.png",
    "regorg_duty.png": "注册中心职责配图.png",
    "banner_ecosystem.png": "banner_ecosystem.png",
    "banner_lab.png": "banner_lab.png",
    "lab_result.png": "lab_result.png",
    "banner_search.png": "banner_search.png",
    "login_bg.png": "login_bg.png",
}

for dest_name, src_name in copies.items():
    target = dst / dest_name
    shutil.copy2(src(src_name), target)
    data = target.read_bytes()[:8]
    if data != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"not png: {dest_name} {data!r}")
    if target.stat().st_size != src(src_name).stat().st_size:
        raise SystemExit(f"size mismatch {dest_name}")
    print(f"copied {src_name} -> {dest_name} ({target.stat().st_size})")

# Text replacements in served bundles
repls = {
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-LZ7b_aDw.js"): [
        ('/static/png/banner2_index.jpg', '/static/png/banner2_index.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-BGhEYlK7.css"): [
        ('/static/png/banner_system.jpg', '/static/png/banner2_index.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-CSHWisZW.css"): [
        ('/static/png/banner_standard.jpg', '/static/png/banner_standard.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-DXJtz4g7.js"): [
        ('/static/png/dci_meaning.jpg', '/static/png/dci_meaning.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css"): [
        ('/static/png/banner_register_center.jpg', '/static/png/banner_register_center.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-D5Nixirv.css"): [
        ('/static/png/banner_ecosystem.jpg', '/static/png/banner_ecosystem.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DxJ3jNSK.css"): [
        ('/static/png/banner_lab.jpg', '/static/png/banner_lab.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-T6YfGpUy.js"): [
        ('/static/png/lab_result.jpg', '/static/png/lab_result.png'),
    ],
    Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DogJsFVJ.css"): [
        ('/static/png/banner_search.jpg', '/static/png/banner_search.png'),
    ],
}

for path, pairs in repls.items():
    text = path.read_text(encoding="utf-8")
    for old, new in pairs:
        n = text.count(old)
        if n != 1:
            raise SystemExit(f"{path.name}: expected 1 of {old}, found {n}")
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")
    print("updated", path.name)

print("done")
