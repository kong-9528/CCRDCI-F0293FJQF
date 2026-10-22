# -*- coding: utf-8 -*-
"""Create register-success page + wire route + redirect from register."""
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
js_dir = root / "js"
css_dir = root / "css"

SCOPE = "data-v-a1b2c3d4"
JS_NAME = "registerSuccess-D9kQm2Lp.js"
CSS_NAME = "registerSuccess-B7nWp4Hx.css"

# --- CSS ---
css = f"""\
.page-container[{SCOPE}]{{width:100%;min-height:100vh;display:flex;flex-direction:column;background:#f3f7fc;font-family:Microsoft YaHei,微软雅黑,sans-serif}}
.reg-success-main[{SCOPE}]{{flex:1 1 auto;display:flex;align-items:center;justify-content:center;padding:64px 24px;position:relative;background:
  radial-gradient(ellipse 80% 60% at 15% 20%,rgba(19,69,165,.06),transparent 55%),
  radial-gradient(ellipse 70% 50% at 85% 75%,rgba(91,156,246,.08),transparent 50%),
  linear-gradient(180deg,#eef4fb 0%,#f7fafd 45%,#f0f5fb 100%);
  overflow:hidden}}
.reg-success-main[{SCOPE}]:before{{content:"";position:absolute;inset:0;opacity:.35;pointer-events:none;background-image:
  linear-gradient(rgba(19,69,165,.04) 1px,transparent 1px),
  linear-gradient(90deg,rgba(19,69,165,.04) 1px,transparent 1px);
  background-size:48px 48px}}
.reg-success-card[{SCOPE}]{{position:relative;z-index:1;width:720px;height:465px;max-width:92vw;background:#fff;border-radius:4px;box-shadow:0 8px 28px rgba(18,27,44,.08);padding:93px 161px 99px;display:flex;flex-direction:column;align-items:center;text-align:center;box-sizing:border-box}}
.reg-success-icon[{SCOPE}]{{width:42px;height:42px;border-radius:50%;background:#31a513;display:flex;align-items:center;justify-content:center;margin:0 0 23px;flex-shrink:0}}
.reg-success-icon svg[{SCOPE}]{{width:22px;height:22px;display:block}}
.reg-success-title[{SCOPE}]{{margin:0 0 64px;width:168px;height:32px;font-size:24px;font-weight:600;font-family:Microsoft YaHei,微软雅黑,sans-serif;color:#303133;line-height:32px;letter-spacing:0}}
.reg-success-btn[{SCOPE}]{{width:398px;max-width:100%;height:48px;border:none;border-radius:4px;font-size:16px;font-weight:400;font-family:Microsoft YaHei,微软雅黑,sans-serif;cursor:pointer;transition:opacity .2s ease,transform .15s ease;line-height:48px;padding:0}}
.reg-success-btn[{SCOPE}]:hover{{opacity:.9}}
.reg-success-btn[{SCOPE}]:active{{transform:translateY(1px)}}
.reg-success-btn--primary[{SCOPE}]{{background:#1345a5;color:#fff;margin:0 0 16px}}
.reg-success-btn--secondary[{SCOPE}]{{background:#eef1f5;color:#606266}}
@media (max-width:760px){{
.reg-success-card[{SCOPE}]{{width:100%;height:auto;min-height:465px;padding:72px 24px 64px}}
.reg-success-btn[{SCOPE}]{{width:100%}}
.reg-success-title[{SCOPE}]{{width:auto}}
}}
"""
(css_dir / CSS_NAME).write_text(css, encoding="utf-8")
print("wrote css", CSS_NAME)

# --- JS (Vue 3 compiled style matching sibling pages) ---
# Import pattern from FAQ: d,a,b,v,r,o,c,i,h,k,M,A,_ from bundle; A from BiQim; P,a from header/footer
js = r'''import{d as D,a as m,b as v,v as w,r as l,o as d,c as g,i as r,h as A,k as s,M as R,A as u,_}from"./index-DA8BAxJb.js";import{A as h}from"./index-BiQimQRe.js";import{P as x,a as B}from"./index-_fJendd7.js";import"./passwordRule-CK9dJiC2.js";
const U={class:"page-container flex-col"},
F={class:"reg-success-main"},
j={class:"reg-success-card"},
G={class:"reg-success-icon","aria-hidden":"true"},
K={class:"reg-success-title"},
H=D({__name:"registerSuccess",setup(W){
const n=m();
const a=v();
const t=l(!1);
const i=l("login");
function c(o="login"){i.value=o;t.value=!0}
function p(){c("login")}
function y(){n.push("/")}
return(o,e)=>{
const f=s("el-button");
return d(),g("div",U,[
  r(x,{onOpenAuth:c}),
  A("main",F,[
    A("div",j,[
      A("div",G,[
        e[0]||(e[0]=A("svg",{viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[
          A("path",{d:"M5 12.5l4.5 4.5L19 7.5",stroke:"#fff","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"})
        ],-1))
      ]),
      e[1]||(e[1]=A("h1",K,"恭喜，注册成功",-1)),
      A("button",{type:"button",class:"reg-success-btn reg-success-btn--primary",onClick:p},"立即登录"),
      A("button",{type:"button",class:"reg-success-btn reg-success-btn--secondary",onClick:y},"回到首页")
    ])
  ]),
  r(B),
  r(h,{modelValue:u(t),"onUpdate:modelValue":e[2]||(e[2]=q=>R(t)?t.value=q:null),"initial-mode":u(i)},null,8,["modelValue","initial-mode"])
])
}
}});
const E=_(H,[["__scopeId","data-v-a1b2c3d4"]]);
export{E as default};
'''
# Fix: unused imports f, v as w, a store - simplify
# `s` is used as unref alias wrong - in FAQ `k as s` is unref, `M as R` is classNames? Looking at FAQ:
# import{d as D,a as m,b as v,v as w,r as l,o as d,c as g,i as r,h as A,J as I,K as E,k as s,M as R,O as M,A as u,_}
# k=unref, M=normalizeClass?, A=toDisplayString, _=withScopeId helper
# In my code I wrongly used s("el-button") - should be unref for values. Remove unused el-button.
# Also `v` is useStore unused, `w` unused. Keep store unused is ok, or remove.

js = r'''import{d as D,a as m,r as l,o as d,c as g,i as r,h as A,k as s,M as R,_}from"./index-DA8BAxJb.js";import{A as h}from"./index-BiQimQRe.js";import{P as x,a as B}from"./index-_fJendd7.js";import"./passwordRule-CK9dJiC2.js";
const U={class:"page-container flex-col"},F={class:"reg-success-main"},j={class:"reg-success-card"},G={class:"reg-success-icon","aria-hidden":"true"},K={class:"reg-success-title"},H=D({__name:"registerSuccess",setup(W){const n=m(),t=l(!1),c=l("login");function o(e="login"){c.value=e,t.value=!0}function p(){o("login")}function y(){n.push("/")}return(e,a)=>(d(),g("div",U,[r(x,{onOpenAuth:o}),A("main",F,[A("div",j,[A("div",G,[a[0]||(a[0]=A("svg",{viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[A("path",{d:"M5 12.5l4.5 4.5L19 7.5",stroke:"#fff","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"})],-1))]),a[1]||(a[1]=A("h1",K,"恭喜，注册成功",-1)),A("button",{type:"button",class:"reg-success-btn reg-success-btn--primary",onClick:p},"立即登录"),A("button",{type:"button",class:"reg-success-btn reg-success-btn--secondary",onClick:y},"回到首页")])]),r(B),r(h,{modelValue:s(t),"onUpdate:modelValue":a[2]||(a[2]=q=>R(t)?t.value=q:null),"initial-mode":s(c)},null,8,["modelValue","initial-mode"])]))}}),E=_(H,[["__scopeId","data-v-a1b2c3d4"]]);export{E as default};
'''

(js_dir / JS_NAME).write_text(js, encoding="utf-8")
print("wrote js", JS_NAME)

# --- Patch register redirect ---
reg_path = js_dir / "register-CvP1VOMb.js"
reg = reg_path.read_text(encoding="utf-8")
old = 'm.success("注册成功"),b.push({path:"/",query:{showLogin:"true"}})'
new = 'm.success("注册成功"),b.push("/register/success")'
if old not in reg:
    # try variants
    for cand in [
        'b.push({path:"/",query:{showLogin:"true"}})',
        "b.push({path:'/',query:{showLogin:'true'}})",
    ]:
        if cand in reg:
            print("found alt", cand)
    raise SystemExit("register redirect pattern not found: " + repr(reg[reg.find("注册成功") - 40 : reg.find("注册成功") + 120]))
reg = reg.replace(old, new, 1)
reg_path.write_text(reg, encoding="utf-8")
print("patched register redirect")

# --- Patch router index-DA8BAxJb.js ---
router_path = js_dir / "index-DA8BAxJb.js"
router = router_path.read_text(encoding="utf-8")

# 1) Append success assets at END of mapDeps (never mid-array — shifts later indices)
m = re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S)
if not m:
    raise SystemExit("mapDeps not found")
arr_body = m.group(1)
files = re.findall(r'"([^"]+)"', arr_body)
js_path = f"static/js/{JS_NAME}"
css_path = f"static/css/{CSS_NAME}"
if js_path in files and css_path in files:
    print("mapDeps already has success entries")
else:
    entries = [f'"{f}"' for f in files if f not in (js_path, css_path)]
    entries.append(f'"{js_path}"')
    entries.append(f'"{css_path}"')
    router = router[: m.start(1)] + ",".join(entries) + router[m.end(1) :]
    print("appended mapDeps entries at end")

files = re.findall(r'"([^"]+)"', re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S).group(1))
js_idx = files.index(js_path)
css_idx = files.index(css_path)

def find_idx(substr):
    for i, f in enumerate(files):
        if substr in f:
            return i
    raise KeyError(substr)

auth_js = find_idx("index-BiQimQRe.js")
pwd = find_idx("passwordRule-CK9dJiC2.js")
auth_css = find_idx("index-CLvhJbpp.css")
hdr_js = find_idx("index-_fJendd7.js")
hdr_css = find_idx("index--ISO3lnV.css")
deps = f"{js_idx},{auth_js},{pwd},{auth_css},{hdr_js},{hdr_css},{css_idx}"
print("deps", deps, "files", [files[int(x)] for x in deps.split(",")])

# 2) Add lazy import mapping like register.vue
lazy_needle = '"../../views/register.vue":()=>Ot(()=>import("./register-CvP1VOMb.js"),__vite__mapDeps(['
# find full register lazy and add success after it
m = re.search(
    r'"\.\./\.\./views/register\.vue":\(\)=>Ot\(\(\)=>import\("\./register-CvP1VOMb\.js"\),__vite__mapDeps\(\[[^\]]+\]\)\)',
    router,
)
if not m:
    raise SystemExit("register lazy import not found")
lazy_success = (
    f',"../../views/register/success.vue":()=>Ot(()=>import("./{JS_NAME}"),__vite__mapDeps([{deps}]))'
)
if "register/success.vue" in router:
    print("lazy already present")
else:
    router = router[: m.end()] + lazy_success + router[m.end() :]
    print("added lazy import")

# 3) Add route after /register route
route_pat = re.compile(
    r'\{path:"/register",component:\(\)=>Ot\(\(\)=>import\("\./register-CvP1VOMb\.js"\),__vite__mapDeps\(\[[^\]]+\]\)\),hidden:!0\}'
)
m = route_pat.search(router)
if not m:
    raise SystemExit("register route not found")
route_success = (
    f',{{path:"/register/success",component:()=>Ot(()=>import("./{JS_NAME}"),__vite__mapDeps([{deps}])),'
    f'hidden:!0,meta:{{title:"注册成功 - DCI 技术服务中心"}}}}'
)
# Check if already added after register route
after = router[m.end() : m.end() + 80]
if "/register/success" in router[m.start() : m.end() + 200]:
    print("route already present")
else:
    router = router[: m.end()] + route_success + router[m.end() :]
    print("added route")

# 4) Whitelist so auth guard allows unauthenticated access
old_whe = 'const whe=["/","/index","/login","/loginOrg","/register","/dci/system"'
new_whe = 'const whe=["/","/index","/login","/loginOrg","/register","/register/success","/dci/system"'
if "/register/success" in router[router.find("const whe=") : router.find("const whe=") + 350]:
    print("whitelist already has success")
elif old_whe not in router:
    raise SystemExit("whitelist pattern not found")
else:
    router = router.replace(old_whe, new_whe, 1)
    print("patched whitelist")

router_path.write_text(router, encoding="utf-8")
print("wrote router")
print("ok")
