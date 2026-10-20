# -*- coding: utf-8 -*-
from PIL import Image
from pathlib import Path

out = Path(__file__).with_name("_tech_geom2.txt")
dl = Path(r"C:\Users\leste\Downloads")
design = None
banner = None
for c in dl.iterdir():
    n = c.name
    if c.suffix.lower() != ".png":
        continue
    if "banner" in n.lower() and "技术服务" in n:
        banner = c
    if "技术服务中心" in n and "banner" not in n.lower() and design is None:
        design = c

lines = []
if banner:
    im = Image.open(banner)
    lines.append(f"banner_file {banner.name} {im.size} {im.mode}")

im = Image.open(design).convert("RGB")
w, h = im.size
px = im.load()

def is_white(x, y, thr=242):
    r, g, b = px[x, y]
    return r > thr and g > thr and b > thr

# nav height: first blue-ish row of hero after white/nav
# card media top/bottom at x=500
xm = 550
# find media top: first non-white in card x at y>450
top = None
for y in range(450, 700):
    if not is_white(xm, y, 242):
        top = y
        break
bot = None
if top:
    for y in range(top, 900):
        if is_white(xm, y, 242):
            # confirm stretch of white
            if all(is_white(xm, y + k, 242) for k in range(8)):
                bot = y - 1
                break
lines.append(f"media y={top}-{bot} h={(bot-top+1) if top and bot else None}")

# card body height: from media bot to card bottom border
# find bottom of card: look for horizontal shadow/border then white gap before button
if bot:
    card_bot = None
    for y in range(bot + 20, bot + 280):
        # left border of card at x=360
        r, g, b = px[360, y]
        # after card ends, x=360 becomes page white
        if r > 250 and g > 250 and b > 250:
            # check if whole card width is white (gap between cards area still white in gaps)
            # check mid of body text - when we leave text block
            pass
    # detect dark text presence
    last_text = bot
    for y in range(bot + 5, bot + 250):
        dark = 0
        for x in range(380, 720, 2):
            r, g, b = px[x, y]
            if r < 180 and g < 180 and b < 180:
                dark += 1
        if dark > 5:
            last_text = y
    lines.append(f"last_text_y={last_text} body_approx_h={last_text-bot}")

# nav: sample y=0..100
for y in [0, 20, 40, 60, 72, 80, 90, 100, 110]:
    r, g, b = px[960, y]
    lines.append(f"y{y} center_rgb={r},{g},{b}")

# banner region height excluding nav: find where deep blue starts
for y in range(0, 200):
    r, g, b = px[1600, y]
    if b > 100 and b > r + 30:
        lines.append(f"hero_blue_start y={y} rgb={r},{g},{b}")
        break

# content width 1200 centered: 360 left = (1920-1200)/2 = 360. Yes!
# cards 384 wide, gap 24: 384*3+24*2=1200. Perfect for 1200 container.

# media aspect: 384 x h_media vs source 768x432 (2x)
if top and bot:
    mh = bot - top + 1
    lines.append(f"media_size design={384}x{mh} source_half={384}x{216}")
    lines.append(f"gap=24 card_w=384 content=1200")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
