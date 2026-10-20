# -*- coding: utf-8 -*-
"""Rebuild from bak; remove wave by exact snip from bak."""
from pathlib import Path
import re
import subprocess

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js")
bak = js_path.with_suffix(js_path.suffix + ".bak_tech")
log_path = Path(__file__).with_name("_rebuild_tech_js2.txt")
log = []

js = bak.read_text(encoding="utf-8")


def bal(s, a, b):
    d = 0
    for ch in s:
        if ch == a:
            d += 1
        elif ch == b:
            d -= 1
    return d


log.append(f"bak paren={bal(js,'(',')')} bracket={bal(js,'[',']')}")

# Find wave: starts with ,c[10]||(c[10]=t("div",{class:"tc-hero-wave"
marker = ',c[10]||(c[10]=t("div",{class:"tc-hero-wave"'
start = js.find(marker)
if start < 0:
    raise SystemExit("marker not found")

# Walk from start, track paren depth of the outer ,( ... )
# The structure is: , EXPR where EXPR = c[10]||(c[10]=t(...))
# We need to remove from comma through the balanced close of the ||( ... )
i = start + 1  # skip comma, start at c[10]
# Find the '(' after '||'
lp = js.find("||(", i)
if lp < 0:
    raise SystemExit("||( not found")
depth = 0
end = None
for j in range(lp, len(js)):
    ch = js[j]
    if ch == "(":
        depth += 1
    elif ch == ")":
        depth -= 1
        if depth == 0:
            end = j + 1
            break
if end is None:
    raise SystemExit("could not balance")

snip = js[start:end]
log.append(f"remove {start}-{end} len={len(snip)}")
log.append(f"snip_head={snip[:80]!r}")
log.append(f"snip_tail={snip[-80:]!r}")
Path(__file__).with_name("_wave_snip2.txt").write_text(snip, encoding="utf-8")

js = js[:start] + js[end:]
log.append(f"after_wave paren={bal(js,'(',')')} bracket={bal(js,'[',']')}")

# Apply other patches
needle = 'const H="/static/png/review-duplicate.png",L="/static/png/review-infringement.png",S="/static/png/review-safety.png"'
js = js.replace(
    needle,
    needle
    + ',TC_BANNER="/static/png/banner_tech_center.png"'
    + ',V1="/static/png/verify_1.png",V2="/static/png/verify_2.png",V3="/static/png/verify_3.png"',
)

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
if old_I not in js:
    raise SystemExit("I not found")
js = js.replace(old_I, new_I)

old_render = 't("div",nt,[p(ct,{variant:s.visual},null,8,["variant"])])'
new_render = 't("div",nt,[t("img",{class:"tc-card__img",src:s.image,alt:s.title},null,8,["src","alt"])])'
if old_render not in js:
    raise SystemExit("render not found")
js = js.replace(old_render, new_render)

js2, n = re.subn(
    r'rt=\{class:"tc-hero","aria-label":"[^"]*"\}',
    'rt={class:"tc-hero tc-hero--banner","aria-label":"DCI技术服务中心"}',
    js,
    count=1,
)
if n != 1:
    raise SystemExit("banner class fail")
js = js2

m = re.search(r'(<p class="tc-hero__lead"[^>]*>)(.*?)(</p>)', js, flags=re.S)
if not m:
    raise SystemExit("lead not found")
new_inner = (
    " 以DCI国家标准为引领，以DCI体系4.0（全球版权数据中心）版权数智基础设施为底层支撑，"
    "基于DCI可信版权数据构建的技术服务支撑能力"
)
js = js[: m.start(2)] + new_inner + js[m.end(2) :]

log.append(f"final paren={bal(js,'(',')')} bracket={bal(js,'[',']')} brace={bal(js,'{','}')}")
log.append(f"wave={'tc-hero-wave' in js} V1={'image:V1' in js} banner={'tc-hero--banner' in js}")
log.append(f"len={len(js)}")

js_path.write_text(js, encoding="utf-8")
r = subprocess.run(["node", "--check", str(js_path)], capture_output=True)
log.append(f"node_rc={r.returncode}")
if r.returncode:
    log.append(r.stderr.decode("utf-8", "replace")[:500])

log_path.write_text("\n".join(log), encoding="utf-8")
print("\n".join(log))
