# -*- coding: utf-8 -*-
"""
1) Homepage: 了解DCI体系 -> /dci/system, 了解更多标准 -> /dci/standard (in-app router push)
2) Align banner subtitle styles with DCI体系 (.hero-sub: color #ffffffd9, font-size 20px, margin-top 16px)
"""
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")

# Reference from system page index-BGhEYlK7.css:
# .hero-sub { color:#ffffffd9; font-size:20px; margin-top:16px; white-space:nowrap }
REF_HERO_SUB = "color:#ffffffd9;font-size:20px;line-height:27px;margin-top:16px"

# --- 1) Homepage navigation ---
home_path = root / "js" / "index-LZ7b_aDw.js"
home = home_path.read_text(encoding="utf-8")

# Full H function (may span braces carefully)
m = re.search(r"function H\(i\)\{.*?behavior:\"smooth\".*?\}", home)
if not m:
    # try broader
    m = re.search(r"function H\(i\)\{[^;]+;[^}]*\}", home)
print("H match:", m.group(0) if m else None)

if m:
    new_h = 'function H(i){u.push(i)}'
    home = home[: m.start()] + new_h + home[m.end() :]
    print("replaced H fn")

# Update click targets
replacements = [
    ('H("dci-standard")', 'H("/dci/system")'),
    ('H("dci-regorg")', 'H("/dci/standard")'),
]
for a, b in replacements:
    if a not in home:
        print("MISSING", a)
    else:
        home = home.replace(a, b, 1)
        print("replaced", a, "->", b)

home_path.write_text(home, encoding="utf-8")
print("wrote home js")

# --- 2) CSS subtitle alignment ---
# Map: file -> (old pattern or key substring to replace)
css_updates = [
    # DCI标准
    (
        "css/index-CSHWisZW.css",
        r"\.hero-sub\[data-v-ac23daef\]\{[^}]*\}",
        f".hero-sub[data-v-ac23daef]{{{REF_HERO_SUB}}}",
    ),
    # DCI生态
    (
        "css/index-D5Nixirv.css",
        r"\.hero-sub\[data-v-39109360\]\{[^}]*\}",
        f".hero-sub[data-v-39109360]{{{REF_HERO_SUB}}}",
    ),
    # DCI注册中心
    (
        "css/portal-BQh_66u9.css",
        r"\.hero-sub\[data-v-58bb0b90\]\{[^}]*\}",
        f".hero-sub[data-v-58bb0b90]{{{REF_HERO_SUB}}}",
    ),
]

for rel, pat, repl in css_updates:
    p = root / rel
    t = p.read_text(encoding="utf-8")
    t2, n = re.subn(pat, repl, t, count=1)
    print(f"{rel}: replaced {n}")
    if n:
        p.write_text(t2, encoding="utf-8")

# Lab: add hero-sub style if we add subtitle later; currently no subtitle markup.
# Check if lab has any subtitle-like element under hero
lab_js = (root / "js" / "index-T6YfGpUy.js").read_text(encoding="utf-8")
lab_css = (root / "css" / "index-DxJ3jNSK.css").read_text(encoding="utf-8")
if "hero-sub" not in lab_js:
    print("lab: no hero-sub markup (skip content); ensure .hero-sub rule ready if needed")
    # Still add CSS rule so if subtitle exists/is added it matches; no markup change unless we find intended text
    if ".hero-sub[data-v-342d3a0c]" not in lab_css:
        # insert after hero-title rule
        lab_css2, n = re.subn(
            r"(\.hero-title\[data-v-342d3a0c\]\{[^}]*\})",
            r"\1.hero-sub[data-v-342d3a0c]{" + REF_HERO_SUB + "}",
            lab_css,
            count=1,
        )
        if n:
            (root / "css" / "index-DxJ3jNSK.css").write_text(lab_css2, encoding="utf-8")
            print("lab: added .hero-sub CSS rule for consistency")

# Tech center: .tc-hero__lead is the subtitle
tech_css_path = root / "css" / "index-DLjiOJYG.css"
tech = tech_css_path.read_text(encoding="utf-8")
# Match system subtitle: size 20, color #ffffffd9; keep layout margins reasonable
old_lead = re.search(r"\.tc-hero__lead\[data-v-873a6031\]\{[^}]*\}", tech)
print("tech lead before:", old_lead.group(0) if old_lead else None)
tech2, n = re.subn(
    r"\.tc-hero__lead\[data-v-873a6031\]\{[^}]*\}",
    ".tc-hero__lead[data-v-873a6031]{margin:16px 0 0;font-size:20px;font-weight:400;line-height:27px;color:#ffffffd9}",
    tech,
    count=1,
)
print("tech lead replaced", n)
if n:
    tech_css_path.write_text(tech2, encoding="utf-8")

print("done")
