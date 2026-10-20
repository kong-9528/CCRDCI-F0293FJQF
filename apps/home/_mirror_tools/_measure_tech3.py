# -*- coding: utf-8 -*-
from PIL import Image
from pathlib import Path

out = Path(__file__).with_name("_tech_geom.txt")
dl = Path(r"C:\Users\leste\Downloads")
design = None
for c in dl.iterdir():
    if c.suffix.lower() == ".png" and "技术服务中心" in c.name and "banner" not in c.name.lower():
        design = c
        break

lines = []
if not design:
    lines.append("NO_DESIGN")
else:
    im = Image.open(design).convert("RGB")
    w, h = im.size
    px = im.load()
    lines.append(f"design {design.name} {w}x{h}")

    def is_white(x, y, thr=245):
        r, g, b = px[x, y]
        return r > thr and g > thr and b > thr

    def is_blueish(x, y):
        r, g, b = px[x, y]
        return b > r + 20 and b > g + 10 and b > 80

    # banner bottom: first mostly-white row after blue
    for y in range(200, 900):
        whites = sum(1 for x in range(0, w, 4) if is_white(x, y))
        if whites > (w // 4) * 0.85:
            lines.append(f"banner_bottom_approx y={y}")
            break

    # scan rows for 3 similar non-white media blocks
    for y in range(480, 900, 5):
        runs = []
        start = None
        for x in range(w):
            nw = not is_white(x, y, 242)
            if nw and start is None:
                start = x
            if (not nw) and start is not None:
                runs.append((start, x - 1))
                start = None
        if start is not None:
            runs.append((start, w - 1))
        big = [(a, b, b - a + 1) for a, b in runs if b - a + 1 > 120]
        if len(big) >= 3:
            gaps = [big[i + 1][0] - big[i][1] - 1 for i in range(len(big) - 1)]
            lines.append(f"y={y} cards={big[:3]} gaps={gaps[:2]}")

    # vertical extent of first card media: find x mid of first big run at y=560
    y0 = 560
    runs = []
    start = None
    for x in range(w):
        nw = not is_white(x, y0, 242)
        if nw and start is None:
            start = x
        if (not nw) and start is not None:
            runs.append((start, x - 1))
            start = None
    if start is not None:
        runs.append((start, w - 1))
    big = [(a, b) for a, b in runs if b - a + 1 > 120]
    if big:
        x1, x2 = big[0]
        xm = (x1 + x2) // 2
        top = y0
        while top > 400 and not is_white(xm, top - 1, 242):
            top -= 1
        bot = y0
        while bot < 1200 and not is_white(xm, bot + 1, 242):
            bot += 1
        lines.append(f"card0_media x={x1}-{x2} w={x2-x1+1} y={top}-{bot} h={bot-top+1}")
        if len(big) >= 3:
            gaps = [big[i + 1][0] - big[i][1] - 1 for i in range(2)]
            widths = [b - a + 1 for a, b in big[:3]]
            lines.append(f"card_widths={widths} gaps={gaps}")
            # full card height: continue past white body text until next section blue/gray
            # find body bottom: after media, white with text then gap before button
            yb = bot + 1
            while yb < 1400 and is_white(xm, yb, 250):
                yb += 1
            # skip text (dark pixels) - find consecutive white band then button
            # simpler: measure until large white gap under card
            # sample left edge of card for border
            xl = x1 + 2
            y_end = bot
            for y in range(bot, min(bot + 400, h)):
                # row in card x range has dark text or border?
                dark = 0
                for x in range(x1, x2, 3):
                    r, g, b = px[x, y]
                    if r < 200 or g < 200 or b < 200:
                        dark += 1
                if dark < 3 and y > bot + 80:
                    # maybe past card
                    pass
                y_end = y
            # better: find bottom border of card - darkish horizontal line then white
            card_bot = bot
            for y in range(bot, min(bot + 350, h)):
                r, g, b = px[xm, y]
                # text area has dark pixels sometimes; card bg is white
                edge_dark = sum(
                    1
                    for x in range(x1, min(x1 + 8, x2))
                    if px[x, y][0] < 230
                )
                if edge_dark >= 3:
                    card_bot = y
            lines.append(f"card0_guess_bot={card_bot} full_h~={card_bot-top+1}")

    # content inner width: left margin of first card
    if big:
        lines.append(f"left_margin={big[0][0]} right_edge={big[-1][1] if len(big)>=3 else big[0][1]}")
        if len(big) >= 3:
            content_w = big[2][1] - big[0][0] + 1
            lines.append(f"three_cards_span={content_w}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
