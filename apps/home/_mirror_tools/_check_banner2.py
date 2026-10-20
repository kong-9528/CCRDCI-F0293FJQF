# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image

dl = Path(r"C:\Users\leste\Downloads")
banner = next(
    p
    for p in dl.iterdir()
    if p.is_file() and "banner" in p.name.lower() and "技术服务" in p.name
)
im = Image.open(banner).convert("RGBA")
w, h = im.size
out_dir = Path(
    r"C:\Users\leste\.cursor\projects\c-WORKING-PLACE-CODE-R-sampleA\assets"
)
# full banner scaled
full = im.resize((960, 175))
full.convert("RGB").save(out_dir / "tech_banner_full.jpg", quality=90)
# right half
right = im.crop((w // 2, 0, w, h)).resize((480, 175))
right.convert("RGB").save(out_dir / "tech_banner_right.jpg", quality=90)
# sample pixels
px = im.load()
for x, y in [(100, 100), (500, 200), (1920, 350), (3000, 350), (3500, 200)]:
    print(f"px({x},{y})={px[x,y]}")
# non-uniform check
colors = set()
for y in range(0, h, 20):
    for x in range(0, w, 40):
        colors.add(px[x, y][:3])
print("unique sampled colors", len(colors))
print("sample colors", list(colors)[:15])
