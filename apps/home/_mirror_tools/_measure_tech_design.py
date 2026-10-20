# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image

dl = Path(r"C:\Users\leste\Downloads")
out_lines = []
for name in ["banner_技术服务中心.png", "DCI®技术服务中心 -1.png", "核验图1.png", "核验图2.png", "核验图3.png"]:
    p = dl / name
    im = Image.open(p)
    out_lines.append(f"{name}\t{im.size[0]}x{im.size[1]}\t{im.mode}\t{p.stat().st_size}")

# Measure design mockup proportions for banner and 3 cards
design = Image.open(dl / "DCI®技术服务中心 -1.png").convert("RGB")
w, h = design.size
out_lines.append(f"design_full\t{w}x{h}")

# Save strips for visual inspection
assets = Path(r"C:\Users\leste\.cursor\projects\c-WORKING-PLACE-CODE-R-sampleA\assets")
assets.mkdir(parents=True, exist_ok=True)
# banner region ~ top portion
design.crop((0, 0, w, int(h * 0.28))).save(assets / "tech_banner_crop.jpg", quality=90)
# cards region
design.crop((0, int(h * 0.28), w, int(h * 0.62))).save(assets / "tech_cards_crop.jpg", quality=90)

# Detect content margins and card boxes in cards crop via luminance variance
import statistics
px = design.load()

# Find content left/right from dark title text around y=0.32h
title_y = int(h * 0.32)
dark = [x for x in range(w) if sum(px[x, title_y]) < 180]
if dark:
    out_lines.append(f"title_x\t{dark[0]}-{dark[-1]}")

# Scan horizontal band through card media area
band_y = int(h * 0.42)
# Find white card runs at text bar (below media)
for probe in [int(h * 0.48), int(h * 0.50), int(h * 0.52), int(h * 0.54)]:
    mask = []
    for x in range(w):
        r, g, b = px[x, probe]
        mask.append(1 if r > 245 and g > 245 and b > 245 else 0)
    runs = []
    s = None
    for i, v in enumerate(mask):
        if v and s is None:
            s = i
        if not v and s is not None:
            if i - s > 40:
                runs.append((s, i))
            s = None
    if s is not None and w - s > 40:
        runs.append((s, w))
    if len(runs) >= 3:
        widths = [b - a for a, b in runs[:3]]
        gaps = [runs[i + 1][0] - runs[i][1] for i in range(min(2, len(runs) - 1))]
        out_lines.append(f"white_y{probe}\truns={runs[:3]}\tw={widths}\tgaps={gaps}")

# Vertical extent of first card
# Use first substantial white run from above
probe = int(h * 0.52)
mask = [1 if (px[x, probe][0] > 245 and px[x, probe][1] > 245 and px[x, probe][2] > 245) else 0 for x in range(w)]
runs = []
s = None
for i, v in enumerate(mask):
    if v and s is None:
        s = i
    if not v and s is not None:
        if i - s > 60:
            runs.append((s, i))
        s = None
if runs:
    x0, x1 = runs[0]
    cx = (x0 + x1) // 2
    top = bottom = None
    for y in range(int(h * 0.34), int(h * 0.62)):
        r, g, b = px[cx, y]
        on = (r > 240 and g > 240 and b > 240) or (b > r + 20 and b > 80)  # white card or blue media
        if on and top is None:
            top = y
        if on:
            bottom = y
    out_lines.append(f"card0\tx={x0}-{x1} w={x1-x0} y={top}-{bottom} h={(bottom-top+1) if top and bottom else None}")
    # media/text split
    split = None
    for y in range(top or 0, (bottom or 0) + 1):
        whites = 0
        n = 0
        for x in range(x0 + 4, x1 - 4):
            r, g, b = px[x, y]
            n += 1
            if r > 248 and g > 248 and b > 248:
                whites += 1
        if n and whites / n > 0.85:
            split = y
            break
    if top and split and bottom:
        out_lines.append(f"media_h={split-top} body_h={bottom-split+1}")
        # scale to 1200 content
        content_span = runs[-1][1] - runs[0][0] if len(runs) >= 3 else (x1 - x0)
        # estimate content width from 3 cards + 2 gaps
        if len(runs) >= 3:
            span = runs[2][1] - runs[0][0]
            out_lines.append(f"three_card_span={span}")
            scale = 1200 / span if span else 1
            out_lines.append(f"scale_to_1200={scale:.4f}")
            cw = (x1 - x0) * scale
            gap = (runs[1][0] - runs[0][1]) * scale
            ch = ((bottom - top + 1) * scale) if top and bottom else 0
            mh = (split - top) * scale
            out_lines.append(f"css_est card_w={cw:.1f} gap={gap:.1f} card_h={ch:.1f} media_h={mh:.1f}")

Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_tech_measure.txt").write_text(
    "\n".join(out_lines), encoding="utf-8"
)
print("wrote measure")
