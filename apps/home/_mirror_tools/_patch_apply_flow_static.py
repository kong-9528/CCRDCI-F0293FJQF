# -*- coding: utf-8 -*-
"""Replace animated apply-flow with static design matching screenshot."""
from pathlib import Path
import re
import shutil

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
css_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css")

# Backup once
bak = js_path.with_suffix(".js.bak_flow")
if not bak.exists():
    shutil.copy2(js_path, bak)
    print("backed up JS to", bak)
bak_css = css_path.with_suffix(".css.bak_flow")
if not bak_css.exists():
    shutil.copy2(css_path, bak_css)
    print("backed up CSS to", bak_css)

s = js_path.read_text(encoding="utf-8")

# Restore from bak if re-running
s = bak.read_text(encoding="utf-8")

# --- 1) Imports ---
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
if old_import not in s:
    raise SystemExit("import line not found")
s = s.replace(old_import, new_import, 1)

# --- 2) Hoisted consts ---
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
if old_consts not in s:
    raise SystemExit("old consts not found")
s = s.replace(old_consts, new_consts, 1)

# --- 3) Replace animation setup through Q array ---
start = s.find('B=1400,v=900,M=36,Oe=N({__name:"portal"')
if start < 0:
    raise SystemExit("setup start not found")
keep_from = s.find(",W=[", start)
if keep_from < 0:
    raise SystemExit("W array not found")

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

# --- 4) Replace apply-flow render ---
old_flow_start = s.find('e("div",{ref_key:"flowRef",ref:h,class:"apply-flow"}')
if old_flow_start < 0:
    raise SystemExit("flow start not found (maybe already patched?)")

# Original closes apply-flow with ],512) then ])]),e("div",Je,
flow_close = s.find("],512)])]),e(\"div\",Je,", old_flow_start)
if flow_close < 0:
    raise SystemExit("flow close not found: " + s[old_flow_start : old_flow_start + 80])

new_flow = (
    'e("div",{class:"apply-flow"},[e("ol",Qe,[(l(),r(R,null,C(Q,(n,o)=>e("li",{key:n.id,class:"apply-flow__item"},['
    'e("span",Ie,f(String(o+1).padStart(2,"0")),1),'
    'e("span",AfDot),'
    'e("div",AfNode,[(l(),r("svg",AfIcon,[e("path",{d:n.path,stroke:"currentColor","stroke-width":"1.6","stroke-linecap":"round","stroke-linejoin":"round"},null,8,AfPath)]))]),'
    'e("strong",AfTitle,f(n.label),1),'
    'e("span",AfArrow)'
    "])),64))])"
)
# After new_flow we need ])]),e("div",Je,  (close be, close Me array item)
# Original: ],512)  +  ])]),e("div",Je,
# So skip ],512) and keep ])]),e("div",Je,
s = s[:old_flow_start] + new_flow + s[flow_close + len("],512)") :]

js_path.write_text(s, encoding="utf-8")
print("JS written", len(s))

# sanity checks
for bad in [
    "flowRef",
    "orbRef",
    "requestAnimationFrame",
    "apply-flow__halo",
    "is-on",
    "ee(",
    "se(",
    "ne(",
    " as oe",
    " as ae",
    "ref:h",
    "ref:z",
    "y.value",
]:
    c = s.count(bad)
    if c:
        print("WARN leftover", bad, c)

# Check balanced-ish: AfTitle used
for good in ["AfDot", "AfNode", "AfIcon", "AfPath", "AfTitle", "AfArrow", "apply-flow__item"]:
    print(good, s.count(good))

# --- 5) CSS ---
css = bak_css.read_text(encoding="utf-8")
css2 = re.sub(r"@keyframes apply-spin-58bb0b90\{[^}]+\}", "", css)
css2 = re.sub(r"@keyframes apply-sheen-58bb0b90\{[^}]+\}", "", css2)

idx_af = css2.find(".apply-flow[data-v-58bb0b90]")
idx_duty = css2.find(".regorg-duty[data-v-58bb0b90]")
if idx_af < 0 or idx_duty < 0:
    raise SystemExit(f"css markers af={idx_af} duty={idx_duty}")

# Also strip orphaned animation disable rules that sit just before duty if they only reference apply-flow
# They're between apply-flow block and duty - included in the slice we replace.

new_css_block = (
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

# Preserve any non-apply-flow rules that might sit between - check
between = css2[idx_af:idx_duty]
print("replacing css chars", len(between))
# Keep duty-card animation kill if it was combined - check
if "duty-card__halo" in between and "apply-flow" in between:
    # There was a combined rule killing animations - add static kill for duty only after if needed
    pass

css2 = css2[:idx_af] + new_css_block + css2[idx_duty:]

# Ensure duty spin keyframes still exist or animations disabled
if "duty-spin-58bb0b90" in css2 and "@keyframes duty-spin" not in css2:
    # keyframe may have been elsewhere; leave as is
    pass

# Disable remaining duty animations to keep page calm? User only asked about first section.
# Leave duty as-is.

css_path.write_text(css2, encoding="utf-8")
print("CSS written", len(css2))
print("done")
