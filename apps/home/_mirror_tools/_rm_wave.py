# -*- coding: utf-8 -*-
from pathlib import Path
import re

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js")
js = js_path.read_text(encoding="utf-8")
log = []

# Remove: ,c[10]||(c[10]=t("div",{class:"tc-hero-wave",...}))
# Pattern from earlier: c[10]||(c[10]=t("div",{class:"tc-hero-wave","aria-hidden":"true"},[t("svg",{viewBox:"0 0 1440 80",preserveAspectRatio:"none"},[t("path",{d:"M0 40 Q360 0 720 40 T1440 40 V80 H0 Z",fill:"#fff"}),t("path",{d:"M0 50 Q360 20 720 50 T1440 50",fill:"none",stroke:"rgba(11,98,184,0.08)","stroke-width":"1"})])]))
pat = re.compile(
    r',c\[10\]\|\|\(c\[10\]=t\("div",\{class:"tc-hero-wave","aria-hidden":"true"\},'
    r'\[t\("svg",\{viewBox:"0 0 1440 80",preserveAspectRatio:"none"\},'
    r'\[t\("path",\{d:"M0 40 Q360 0 720 40 T1440 40 V80 H0 Z",fill:"#fff"\}\),'
    r't\("path",\{d:"M0 50 Q360 20 720 50 T1440 50",fill:"none",'
    r'stroke:"rgba\(11,98,184,0\.08\)","stroke-width":"1"\}\)\]\)\]\)\)'
)
m = pat.search(js)
if not m:
    # looser
    m = re.search(
        r',c\[10\]\|\|\(c\[10\]=t\("div",\{class:"tc-hero-wave"[\s\S]*?\]\)\]\)\)',
        js,
    )
if not m:
    raise SystemExit("wave block not found")
js = js[: m.start()] + js[m.end() :]
log.append(f"removed wave at {m.start()} len={m.end()-m.start()}")
js_path.write_text(js, encoding="utf-8")
log.append(f"still has tc-hero-wave: {'tc-hero-wave' in js}")
Path(__file__).with_name("_rm_wave_log.txt").write_text("\n".join(log), encoding="utf-8")
print("\n".join(log))
