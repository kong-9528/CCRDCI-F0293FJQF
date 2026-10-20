# -*- coding: utf-8 -*-
"""Rebuild tech-center JS from bak_tech with all patches, without the wave SVG."""
from pathlib import Path
import re
import subprocess

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js")
bak = js_path.with_suffix(js_path.suffix + ".bak_tech")
log_path = Path(__file__).with_name("_rebuild_tech_js.txt")
log = []

js = bak.read_text(encoding="utf-8")
log.append(f"from bak len={len(js)}")

# 1) image consts
needle = 'const H="/static/png/review-duplicate.png",L="/static/png/review-infringement.png",S="/static/png/review-safety.png"'
if "verify_1.png" not in js:
    js = js.replace(
        needle,
        needle
        + ',TC_BANNER="/static/png/banner_tech_center.png"'
        + ',V1="/static/png/verify_1.png",V2="/static/png/verify_2.png",V3="/static/png/verify_3.png"',
    )
    log.append("added image consts")

# 2) card data visual -> image
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
    log.append("replaced I")
elif "image:V1" not in js:
    raise SystemExit("could not replace I")

# 3) card media render
old_render = 't("div",nt,[p(ct,{variant:s.visual},null,8,["variant"])])'
new_render = 't("div",nt,[t("img",{class:"tc-card__img",src:s.image,alt:s.title},null,8,["src","alt"])])'
if old_render in js:
    js = js.replace(old_render, new_render)
    log.append("replaced card media")
elif "tc-card__img" not in js:
    raise SystemExit("could not replace card media")

# 4) banner class
js2 = re.sub(
    r'rt=\{class:"tc-hero","aria-label":"[^"]*"\}',
    'rt={class:"tc-hero tc-hero--banner","aria-label":"DCI技术服务中心"}',
    js,
    count=1,
)
if js2 != js:
    js = js2
    log.append("added banner class")
elif "tc-hero--banner" not in js:
    raise SystemExit("could not add banner class")

# 5) merge hero lead to one paragraph
m = re.search(r'(<p class="tc-hero__lead"[^>]*>)(.*?)(</p>)', js, flags=re.S)
if not m:
    raise SystemExit("hero lead not found")
new_inner = (
    " 以DCI国家标准为引领，以DCI体系4.0（全球版权数据中心）版权数智基础设施为底层支撑，"
    "基于DCI可信版权数据构建的技术服务支撑能力"
)
js = js[: m.start(2)] + new_inner + js[m.end(2) :]
log.append("merged lead")

# 6) remove wave SVG block
wave = re.search(
    r',c\[10\]\|\|\(c\[10\]=t\("div",\{class:"tc-hero-wave","aria-hidden":"true"\},\[t\("svg",\{viewBox:"0 0 1440 80",preserveAspectRatio:"none"\},\[t\("path",\{d:"M0 40 Q360 0 720 40 T1440 40 V80 H0 Z",fill:"#fff"\}\),t\("path",\{d:"M0 50 Q360 20 720 50 T1440 50",fill:"none",stroke:"rgba\(11,98,184,0\.08\)","stroke-width":"1"\}\)\]\)\]\)\)',
    js,
)
if not wave:
    # looser fallback using bak snip indices style
    i = js.find('c[10]||(c[10]=t("div",{class:"tc-hero-wave"')
    if i < 0:
        raise SystemExit("wave not found")
    # include preceding comma
    start = i - 1 if i > 0 and js[i - 1] == "," else i
    # find matching close: count brackets/parens from t("div"
    # simpler: known ending pattern
    end = js.find('])]))', i)
    if end < 0:
        raise SystemExit("wave end not found")
    end = end + len("])]))")
    js = js[:start] + js[end:]
    log.append(f"removed wave loose {start}-{end}")
else:
    js = js[: wave.start()] + js[wave.end() :]
    log.append("removed wave regex")

# balance check
def bal(s, a, b):
    d = 0
    for ch in s:
        if ch == a:
            d += 1
        elif ch == b:
            d -= 1
    return d

log.append(f"paren={bal(js,'(',')')} bracket={bal(js,'[',']')} brace={bal(js,'{','}')}")
log.append(f"has_wave={'tc-hero-wave' in js}")
log.append(f"has_V1={'image:V1' in js}")
log.append(f"has_banner={'tc-hero--banner' in js}")
log.append(f"final_len={len(js)}")

js_path.write_text(js, encoding="utf-8")

# node --check with binary stderr
r = subprocess.run(
    ["node", "--check", str(js_path)],
    capture_output=True,
)
log.append(f"node_rc={r.returncode}")
if r.returncode != 0:
    err = r.stderr.decode("utf-8", "replace")[:800]
    log.append("node_err=" + err)

log_path.write_text("\n".join(log), encoding="utf-8")
print("\n".join(log))
