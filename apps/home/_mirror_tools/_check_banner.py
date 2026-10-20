# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image

dl = Path(r"C:\Users\leste\Downloads")
banner = None
for p in dl.iterdir():
    if p.is_file() and "banner" in p.name.lower() and "技术服务" in p.name:
        banner = p
        break
print("banner", banner)
im = Image.open(banner)
print(im.size, im.mode)
left = im.crop((80, 80, 1600, 620)).resize((760, 270))
out = Path(
    r"C:\Users\leste\.cursor\projects\c-WORKING-PLACE-CODE-R-sampleA\assets\tech_banner_src_preview.jpg"
)
left.convert("RGB").save(out, quality=85)
print("saved", out)

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js"
).read_text(encoding="utf-8")
checks = [
    "DCI核验",
    'visual:"dci"',
    "p(ct,{variant:s.visual}",
    'class:"tc-hero"',
    "可信 · 可溯 · 可计量",
]
for c in checks:
    print(c, c in js)
idx = js.find("const I=[")
print(repr(js[idx : idx + 160]))
