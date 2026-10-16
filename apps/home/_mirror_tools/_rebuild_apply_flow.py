# -*- coding: utf-8 -*-
"""Clean rebuild of static apply-flow from bak_flow backup."""
from pathlib import Path
import re
import shutil

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
css_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css")
bak_js = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js.bak_flow")
bak_css = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css.bak_flow")

s = bak_js.read_text(encoding="utf-8")

# Record original balance for reference
print(
    "bak balance",
    s.count("(") - s.count(")"),
    s.count("{") - s.count("}"),
    s.count("[") - s.count("]"),
)

# 1) Imports — drop ee/se/ne/oe/ae
old_import = (
    'import{d as N,a as O,b as _,v as $,r as p,e as ee,Q as se,N as ne,o as l,c as r,'
    'i as G,h as e,J as R,K as C,j as E,k as m,M as te,L as oe,O as ae,A as f,_ as le}'
    'from"./index-DA8BAxJb.js"'
)
new_import = (
    'import{d as N,a as O,b as _,v as $,r as p,o as l,c as r,'
    'i as G,h as e,J as R,K as C,j as E,k as m,M as te,A as f,_ as le}'
    'from"./index-DA8BAxJb.js"'
)
assert old_import in s, "import missing"
s = s.replace(old_import, new_import, 1)

# 2) Hoisted consts
old_consts = (
    'we={class:"apply-flow__rail",viewBox:"0 0 1200 72",preserveAspectRatio:"none","aria-hidden":"true"},'
    'De=["d"],Qe={class:"apply-flow__list"},Ie={class:"apply-flow__no"},'
    'Ge={class:"apply-flow__halo",viewBox:"0 0 100 100"},'
    'Ee={class:"apply-flow__ring-pulse",cx:"50",cy:"50",r:"36",fill:"none"},'
    'Ve=["begin"],je=["begin"],ze={class:"apply-flow__node"},'
    'Pe={class:"apply-flow__icon",viewBox:"0 0 24 24",fill:"none"},Fe=["d"],'
    'Ye={class:"apply-flow__title"},'
)
new_consts = (
    'Qe={class:"apply-flow__list"},'
    'Ie={class:"apply-flow__no"},'
    'AfDot={class:"apply-flow__dot","aria-hidden":"true"},'
    'AfNode={class:"apply-flow__node","aria-hidden":"true"},'
    'AfIcon={class:"apply-flow__icon",viewBox:"0 0 24 24",fill:"none"},'
    'AfPath=["d"],'
    'AfTitle={class:"apply-flow__title"},'
    'AfArrow={class:"apply-flow__arrow","aria-hidden":"true"},'
)
assert old_consts in s, "consts missing"
s = s.replace(old_consts, new_consts, 1)

# 3) Replace animation setup + Q
start = s.find('B=1400,v=900,M=36,Oe=N({__name:"portal"')
assert start >= 0, "setup start missing"
keep_from = s.find(",W=[", start)
assert keep_from >= 0, "W missing"

new_setup = (
    'Oe=N({__name:"portal",setup(_e){const V=O(),j=_(),k=$(()=>!!j.token),d=p(!1),b=p("login");'
    "const Q=["
    '{id:"consult",label:"准入咨询与申请",path:"M4 3h9v18H4V3zm3 4h3M7 11h3M7 15h2M16.5 7a2.5 2.5 0 1 1 0 .01M13.5 17.5c0-1.9 1.3-3.2 3-3.2s3 1.3 3 3.2"},'
    '{id:"evaluate",label:"业务综合评估",path:"M9 2h6l1 2h4v17H4V4h4l1-2zm0 8h6M9 12h6M9 16h4M17 9.5a1.6 1.6 0 1 1 0 .01M14.8 15c.4-1.1 1.3-1.8 2.2-1.8"},'
    '{id:"agree",label:"协议达成",path:"M7 2h9l2 2v17H7V2zm3 6h5M10 11h5M13.5 15.5l4.5-4.5 1.2 1.2-4.5 4.5H13.5v-1.2z"},'
    '{id:"access",label:"业务开通接入",path:"M2 5h14v13H2V5zm3 4h6M5 12h4M18 12.5a3 3 0 1 1 0 .01M18 9.8v1.2M18 14v1.2M15.5 12.5H16.7M19.3 12.5h1.2M16.2 10.4l.9.9M18.9 13.7l.9.9M18.9 10.4l-.9.9M16.2 13.7l-.9.9"},'
    '{id:"debug",label:"接入方建设联调",path:"M2 3h20v13H2V3zm6 17h8M12 16v4M8.5 8.5L6 11l2.5 2.5M15.5 8.5L18 11l-2.5 2.5M13.2 7.5l-2.4 7"},'
    '{id:"operate",label:"持续服务与运营",path:"M3 2h18v14H3V2zm5 18h8M12 16v4M7 12l3-3.5 2.5 2L16 6"}'
    "]"
)
s = s[:start] + new_setup + s[keep_from:]

# 4) Replace apply-flow render — match original close pattern ],512)])]),e("div",Je,
flow_start = s.find('e("div",{ref_key:"flowRef",ref:h,class:"apply-flow"}')
assert flow_start >= 0, "flow start missing"
flow_close = s.find('],512)])]),e("div",Je,', flow_start)
assert flow_close >= 0, "flow close missing"

# Build apply-flow vnode that ends the same way original ],512) did —
# i.e. the replacement includes everything up to and including the apply-flow
# element's closing, then we keep ])]),e("div",Je,
#
# Original after apply-flow element: ])]),e("div",Je,
# where ],512) closed the apply-flow div.
#
# Correct Vue structure for:
#   e("div",{class:"apply-flow"},[
#     e("ol",Qe,[
#       (l(), r(R, null, C(Q, (n,o)=> e("li",{...},[ ... ])), 64))
#     ])
#   ])
#
# Ending of li children through apply-flow:
#   ]     close li children
#   )     close e(li
#   )     close C(
#   ,64)  close r(
#   )     close (l(), ...)
#   ]     close ol children
#   )     close e(ol
#   ]     close apply-flow children
#   )     close e(apply-flow
# = ]),64))])
#
# Then keep: ])]),e("div",Je,   (close be, close Me, next Je)

new_flow = (
    'e("div",{class:"apply-flow"},['
    'e("ol",Qe,['
    '(l(),r(R,null,C(Q,(n,o)=>e("li",{key:n.id,class:"apply-flow__item"},['
    'e("span",Ie,f(String(o+1).padStart(2,"0")),1),'
    'e("span",AfDot),'
    'e("div",AfNode,[(l(),r("svg",AfIcon,[e("path",{d:n.path,stroke:"currentColor","stroke-width":"1.6","stroke-linecap":"round","stroke-linejoin":"round"},null,8,AfPath)]))]),'
    'e("strong",AfTitle,f(n.label),1),'
    'e("span",AfArrow)'
    '])),64))'
    '])'
    '])'
)

# Verify new_flow ending
assert new_flow.endswith("])"), new_flow[-20:]

# Replace from flow_start through ],512)  (exclusive of ])]),e... which we keep)
s = s[:flow_start] + new_flow + s[flow_close + len("],512)") :]

print(
    "new balance",
    s.count("(") - s.count(")"),
    s.count("{") - s.count("}"),
    s.count("[") - s.count("]"),
)

# Show ending snippet
i = s.find('e("span",AfArrow)')
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_vf3.txt").write_text(
    s[i : i + 100] + "\n---\n" + s[s.find("Oe=N") : s.find("Oe=N") + 200],
    encoding="utf-8",
)

# Must match bak balance (bak may have been ~0)
# If still off, print more context
js_path.write_text(s, encoding="utf-8")

# 5) CSS from bak
css = bak_css.read_text(encoding="utf-8")
css2 = re.sub(r"@keyframes apply-spin-58bb0b90\{[^}]+\}", "", css)
css2 = re.sub(r"@keyframes apply-sheen-58bb0b90\{[^}]+\}", "", css2)
idx_af = css2.find(".apply-flow[data-v-58bb0b90]")
idx_duty = css2.find(".regorg-duty[data-v-58bb0b90]")
assert idx_af >= 0 and idx_duty >= 0

new_css = (
    ".apply-flow[data-v-58bb0b90]{position:relative;width:100%;margin-top:56px;padding:4px 0 0}"
    ".apply-flow__list[data-v-58bb0b90]{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));width:100%;margin:0;padding:0;list-style:none;position:relative}"
    ".apply-flow__list[data-v-58bb0b90]:before{content:\"\";position:absolute;left:calc(8.333% + 4px);right:calc(8.333% + 4px);top:38px;height:1px;background:#d7e3f4;z-index:0}"
    ".apply-flow__item[data-v-58bb0b90]{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center}"
    ".apply-flow__no[data-v-58bb0b90]{color:#8fb6e8;font-size:14px;font-weight:600;letter-spacing:.06em;height:20px;line-height:20px;margin-bottom:10px}"
    ".apply-flow__dot[data-v-58bb0b90]{width:8px;height:8px;border-radius:50%;background:#8fb6e8;margin-bottom:28px;position:relative;z-index:1;box-shadow:0 0 0 3px #fff}"
    ".apply-flow__node[data-v-58bb0b90]{width:64px;height:64px;border-radius:14px;background:#1345a5;color:#fff;display:flex;align-items:center;justify-content:center;box-sizing:border-box}"
    ".apply-flow__icon[data-v-58bb0b90]{width:28px;height:28px;display:block}"
    ".apply-flow__title[data-v-58bb0b90]{margin-top:16px;color:#121b2c;font-size:14px;font-weight:600;line-height:22px;white-space:nowrap}"
    ".apply-flow__arrow[data-v-58bb0b90]{position:absolute;left:100%;top:106px;width:10px;height:10px;margin-left:-5px;border-top:1.5px solid #c5d3e8;border-right:1.5px solid #c5d3e8;transform:rotate(45deg);box-sizing:border-box}"
    ".apply-flow__item:last-child .apply-flow__arrow[data-v-58bb0b90]{display:none}"
    "@media (max-width:900px){"
    ".apply-flow__list[data-v-58bb0b90]{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:36px}"
    ".apply-flow__list[data-v-58bb0b90]:before{display:none}"
    ".apply-flow__arrow[data-v-58bb0b90]{display:none}"
    ".apply-flow__title[data-v-58bb0b90]{white-space:normal;padding:0 4px}"
    "}"
)
css2 = css2[:idx_af] + new_css + css2[idx_duty:]
css_path.write_text(css2, encoding="utf-8")
print("done")
