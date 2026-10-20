# -*- coding: utf-8 -*-
"""Apply tech-center banner + verify card images; patch JS/CSS."""
import re
import shutil
from pathlib import Path

DL = Path(r"C:\Users\leste\Downloads")
DST = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\png")
JS = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js")
CSS = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\index-DLjiOJYG.css")
OV = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\overrides.css")
LOG = Path(__file__).with_name("_tech_apply_log.txt")

lines = []


def find_dl(substr: str) -> Path:
    for p in DL.iterdir():
        if p.is_file() and substr in p.name:
            return p
    raise SystemExit(f"missing download matching {substr!r}")


def copy_png(src: Path, dest_name: str) -> Path:
    target = DST / dest_name
    shutil.copy2(src, target)
    data = target.read_bytes()[:8]
    if data != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"not png: {dest_name}")
    if target.stat().st_size != src.stat().st_size:
        raise SystemExit(f"size mismatch {dest_name}")
    lines.append(f"copied {src.name} -> {dest_name} ({target.stat().st_size})")
    return target


# --- copy assets (no recompression) ---
banner_src = find_dl("banner_技术服务中心")
v1 = find_dl("核验图1")
v2 = find_dl("核验图2")
v3 = find_dl("核验图3")
copy_png(banner_src, "banner_tech_center.png")
copy_png(v1, "verify_1.png")
copy_png(v2, "verify_2.png")
copy_png(v3, "verify_3.png")

# --- patch JS ---
js = JS.read_text(encoding="utf-8")
bak = JS.with_suffix(JS.suffix + ".bak_tech")
if not bak.exists():
    bak.write_text(js, encoding="utf-8")
    lines.append(f"backed up {bak.name}")

# 1) Add image constants after review pngs
needle = 'const H="/static/png/review-duplicate.png",L="/static/png/review-infringement.png",S="/static/png/review-safety.png"'
if 'verify_1.png' not in js:
    js = js.replace(
        needle,
        needle
        + ',TC_BANNER="/static/png/banner_tech_center.png"'
        + ',V1="/static/png/verify_1.png",V2="/static/png/verify_2.png",V3="/static/png/verify_3.png"',
    )
    lines.append("added image consts")
else:
    lines.append("image consts already present")

# 2) Change card data: visual -> image
old_I = (
    'const I=[{title:"DCI核验",visual:"dci",desc:"对提供的DCI码或作品样本进行核验，确认DCI码的真实性和有效性。"},'
    '{title:"版权登记信息核验",visual:"info",desc:"对登记号、著作权人、作品名称/软件名称等版权登记要素组合信息进行核验，确认版权登记数据的真实性和有效性。"},'
    '{title:"版权登记证书核验",visual:"certificate",desc:"对核验人提供的由中国版权保护中心等国家级版权登记机构颁发的登记证书进行核验，确认登记证书信息与登记数据的真实性和有效性。"}]'
)
new_I = (
    'const I=[{title:"DCI核验",image:V1,desc:"对提供的DCI码或作品样本进行核验，确认DCI码的真实性和有效性。"},'
    '{title:"版权登记信息核验",image:V2,desc:"对登记号、著作权人、作品名称/软件名称等版权登记要素组合信息进行核验，确认版权登记数据的真实性和有效性。"},'
    '{title:"版权登记证书核验",image:V3,desc:"对核验人提供的由中国版权保护中心等国家级版权登记机构颁发的登记证书进行核验，确认登记证书信息与登记数据的真实性和有效性。"}]'
)
if old_I in js:
    js = js.replace(old_I, new_I)
    lines.append("replaced I card data")
elif "image:V1" in js:
    lines.append("I card data already patched")
else:
    # try regex in case of whitespace
    m = re.search(r'const I=\[\{title:"DCI核验".*?\}\]', js)
    if not m:
        raise SystemExit("could not find const I=[...]")
    js = js[: m.start()] + new_I + js[m.end() :]
    lines.append("replaced I via regex")

# 3) Replace SVG product visual in cards with <img>
old_render = 't("div",nt,[p(ct,{variant:s.visual},null,8,["variant"])])'
new_render = 't("div",nt,[t("img",{class:"tc-card__img",src:s.image,alt:s.title},null,8,["src","alt"])])'
if old_render in js:
    js = js.replace(old_render, new_render)
    lines.append("replaced card media render")
elif "tc-card__img" in js:
    lines.append("card media already patched")
else:
    raise SystemExit("could not find card media render")

# 4) Simplify hero: background image section, keep title/lead, hide right visual
# Replace hero bg decorative block + visual with empty/minimal
# Strategy: CSS will paint banner on .tc-hero; hide .tc-hero__bg orbs, hide .tc-hero__visual, hide wave
# Also remove the right-column visual from render so layout is single column text like design overlay
# Design banner likely includes art; keep HTML text for sharpness OR hide if banner has text.
# We'll keep copy, hide visual via CSS; set hero to use banner bg.

# Optionally strip visual from hero render to avoid empty column
old_visual_block = 't("div",st,[t("div",ot,[p(O,{variant:"platform"}),c[1]||(c[1]=t("span",{class:"tc-hero__visual-badge"},"可信 · 可溯 · 可计量",-1))])])'
# The badge text may have special chars - find by structure
if "tc-hero__visual-badge" in js and "tc-hero--banner" not in js:
    # mark section with banner class
    js = js.replace(
        'rt={class:"tc-hero","aria-label":"DCI技术服务中心"}',
        'rt={class:"tc-hero tc-hero--banner","aria-label":"DCI技术服务中心"}',
    )
    lines.append("added tc-hero--banner class")
elif "tc-hero--banner" in js:
    lines.append("banner class already present")
else:
    # aria-label may differ encoding - try looser
    m = re.search(r'rt=\{class:"tc-hero","aria-label":"[^"]*"\}', js)
    if m:
        js = js[: m.start()] + 'rt={class:"tc-hero tc-hero--banner","aria-label":"DCI技术服务中心"}' + js[m.end() :]
        lines.append("added tc-hero--banner via regex")
    else:
        lines.append("WARN: could not add banner class")

JS.write_text(js, encoding="utf-8")
lines.append("wrote JS")

# --- patch CSS ---
css = CSS.read_text(encoding="utf-8")
bakc = CSS.with_suffix(CSS.suffix + ".bak_tech")
if not bakc.exists():
    bakc.write_text(css, encoding="utf-8")
    lines.append(f"backed up {bakc.name}")

# Replace first .tc-hero height/bg rule - inject banner style via overrides is safer
# Design: 1920x350 effective (banner 3840x700), cards 384x216 media, gap 24

# Patch gap 28 -> 24 in bundled css
if ".tc-card-grid[data-v-873a6031]{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}" in css:
    css = css.replace(
        ".tc-card-grid[data-v-873a6031]{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}",
        ".tc-card-grid[data-v-873a6031]{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}",
    )
    lines.append("card-grid gap 28->24")

# Fix hero height in both occurrences
css2 = re.sub(
    r"\.tc-hero\[data-v-873a6031\]\{position:relative;height:600px;",
    ".tc-hero[data-v-873a6031]{position:relative;height:350px;",
    css,
    count=1,
)
if css2 != css:
    css = css2
    lines.append("hero height 600->350")
css2 = re.sub(
    r"\.tc-hero\[data-v-873a6031\]\{height:auto;min-height:600px;padding:48px 0\}",
    ".tc-hero[data-v-873a6031]{height:350px;min-height:350px;padding:0}",
    css,
)
if css2 != css:
    css = css2
    lines.append("hero responsive min-height fixed")

CSS.write_text(css, encoding="utf-8")
lines.append("wrote CSS")

# --- overrides for banner bg + card images ---
ov = OV.read_text(encoding="utf-8")
marker = "/* tech-center-banner-verify-2026 */"
block = f"""
{marker}
.tc-hero.tc-hero--banner[data-v-873a6031],
.tc-hero.tc-hero--banner,
.tc-hero[data-v-873a6031] {{
  height: 350px !important;
  min-height: 350px !important;
  padding: 0 !important;
  background-image: url("./static/png/banner_tech_center.png") !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  background-color: #0b3d8c !important;
}}
.tc-hero--banner .tc-hero__bg,
.tc-hero--banner .tc-hero__mesh,
.tc-hero--banner .tc-hero__orb,
.tc-hero--banner .tc-hero__line,
.tc-hero--banner .tc-hero__visual,
.tc-hero--banner .tc-hero-wave {{
  display: none !important;
}}
.tc-hero--banner .tc-hero__inner[data-v-873a6031],
.tc-hero--banner .tc-hero__inner {{
  grid-template-columns: 1fr !important;
  height: 100%;
  align-items: center !important;
}}
.tc-card-grid[data-v-873a6031],
.tc-card-grid {{
  gap: 24px !important;
}}
.tc-card__media[data-v-873a6031],
.tc-card__media {{
  width: 100%;
  aspect-ratio: 768 / 432;
  line-height: 0 !important;
  overflow: hidden !important;
}}
.tc-card__img {{
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border: 0;
}}
"""

if marker in ov:
    # replace existing block
    start = ov.index(marker)
    # find next marker or end - replace until end of file section; use next /* at line start after
    rest = ov[start + len(marker) :]
    # keep until a blank line followed by unrelated? simpler: replace from marker to EOF if last, else to next tech-
    end_m = re.search(r"\n/\* (?!tech-center-banner)", rest)
    if end_m:
        ov = ov[:start] + block + rest[end_m.start() + 1 :]
    else:
        ov = ov[:start] + block
    lines.append("replaced overrides block")
else:
    ov = ov.rstrip() + "\n" + block
    lines.append("appended overrides block")

OV.write_text(ov, encoding="utf-8")
lines.append("wrote overrides")

LOG.write_text("\n".join(lines), encoding="utf-8")
print("\n".join(lines))
