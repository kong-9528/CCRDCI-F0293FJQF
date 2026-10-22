# -*- coding: utf-8 -*-
"""Audit banner image fit CSS across home portal pages (exclude workbench)."""
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
js_dir = root / "js"
css_dir = root / "css"
router = (js_dir / "index-DA8BAxJb.js").read_text(encoding="utf-8")

# Portal public pages (not workbench / user dashboard)
portal_routes = [
    "/",
    "/index",
    "/dci/system",
    "/dci/standard",
    "/dci/regorg/portal",
    "/dci/eco",
    "/dci/lab",
    "/dci/query",
    "/dci/faq",
    "/dci/contact",
    "/dci/tech-center",
    "/register",
    "/register/success",
    "/login",
]

files = re.findall(r'"([^"]+)"', re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S).group(1))

def route_chunk(path):
    m = re.search(rf'path:"{re.escape(path)}",component:\(\)=>Ot\(\(\)=>import\("\.\/([^"]+)"\),__vite__mapDeps\(\[([^\]]+)\]\)', router)
    if not m:
        return None, []
    js = m.group(1)
    idxs = [int(x) for x in m.group(2).split(",")]
    deps = [files[i] for i in idxs]
    return js, deps

banner_keywords = [
    "banner", "hero", "backgroundImage", "background-size", "background-position",
    "object-fit", "object-position", "cover", "contain", "banner-slide",
    "system-hero", "portal-hero", "home-banner",
]

print("=" * 70)
for path in portal_routes:
    js, deps = route_chunk(path)
    if not js:
        # try index for /
        if path == "/":
            js, deps = route_chunk("/index")
        if not js:
            print(f"\n[{path}] NO CHUNK")
            continue
    css_deps = [d for d in deps if d.endswith(".css")]
    print(f"\n[{path}] js={js}")
    print(f"  css={css_deps}")
    jp = js_dir / js
    jt = jp.read_text(encoding="utf-8") if jp.exists() else ""
    # find banner-related snippets in JS
    for pat in [
        r"backgroundImage[^,]{0,80}",
        r"background-size[^;\"']{0,40}",
        r"object-fit[^;\"']{0,40}",
        r"class:\"[^\"]*(?:banner|hero)[^\"]*\"",
        r"banner-slide|system-hero|home-banner|portal-hero|hero-bg|banner-bg",
        r'src:[A-Za-z0-9_]+|/static/(?:png|jpg|jpeg|webp)/[^"\']+',
    ]:
        for m in re.finditer(pat, jt):
            ctx = jt[max(0, m.start()-30): m.end()+50].replace("\n", " ")
            if any(k in ctx.lower() for k in ["banner", "hero", "bg", "slide", "cover", "contain", "static/png", "static/jpg"]):
                print(f"  JS: ...{ctx[:160]}...")
                break

    for cd in css_deps:
        cp = root / cd.replace("static/", "", 1) if cd.startswith("static/") else css_dir / Path(cd).name
        # deps are like static/css/xxx.css
        cp = root.parent / cd if False else (root / cd[len("static/"):] if cd.startswith("static/") else css_dir / Path(cd).name)
        # mirror/static is root; path is static/css/foo.css -> root/css/foo.css
        cp = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror") / cd
        if not cp.exists():
            print(f"  MISSING CSS {cd}")
            continue
        ct = cp.read_text(encoding="utf-8")
        # extract rules mentioning banner/hero/slide/background-size/object-fit
        rules = re.findall(r"[^{}]+\{[^{}]+\}", ct)
        interesting = []
        for r in rules:
            rl = r.lower()
            if any(k in rl for k in ["banner", "hero", "slide", "background-size", "object-fit", "background-image", "background-position"]):
                if any(k in rl for k in ["background-size", "object-fit", "banner", "hero", "slide", "cover", "contain"]):
                    interesting.append(r.strip()[:260])
        if interesting:
            print(f"  CSS {cp.name}:")
            for r in interesting[:12]:
                print(f"    {r}")
        else:
            # still check if page has hero with bg image inlined
            if re.search(r"hero|banner", ct, re.I):
                print(f"  CSS {cp.name}: has hero/banner but no size/fit rules matched")
