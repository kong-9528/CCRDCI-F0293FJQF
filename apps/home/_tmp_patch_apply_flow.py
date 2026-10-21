# -*- coding: utf-8 -*-
"""Restyle portal apply-flow to design mockup: icon tiles + arrows, no timeline."""
from pathlib import Path
import re

js_path = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/portal-CGcjgAeB.js")
css_path = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/portal-BQh_66u9.css")
t = js_path.read_text(encoding="utf-8")

# --- JS: simplify static nodes & render ---
# Replace class constants for unused no/dot; keep icon as img inside node
old_consts = (
    'Qe={class:"apply-flow__list"},'
    'Ie={class:"apply-flow__no"},'
    'AfDot={class:"apply-flow__dot","aria-hidden":"true"},'
    'AfNode={class:"apply-flow__node","aria-hidden":"true"},'
    'AfIcon={class:"apply-flow__icon",viewBox:"0 0 24 24",fill:"none"},'
    'AfPath=["d"],'
    'AfTitle={class:"apply-flow__title"},'
    'AfArrow={class:"apply-flow__arrow","aria-hidden":"true"},'
)
new_consts = (
    'Qe={class:"apply-flow__list"},'
    'AfNode={class:"apply-flow__node"},'
    'AfImg=["src","alt"],'
    'AfTitle={class:"apply-flow__title"},'
    'AfArrow={class:"apply-flow__arrow","aria-hidden":"true"},'
)
if old_consts not in t:
    # try more flexible
    if 'AfDot={class:"apply-flow__dot"' not in t and 'apply-flow__no' not in t:
        print("JS consts already simplified?")
    else:
        # partial replace
        t2 = t
        for a, b in [
            ('Ie={class:"apply-flow__no"},', ""),
            ('AfDot={class:"apply-flow__dot","aria-hidden":"true"},', ""),
            (
                'AfIcon={class:"apply-flow__icon",viewBox:"0 0 24 24",fill:"none"},AfPath=["d"],',
                'AfImg=["src","alt"],',
            ),
            (
                'AfNode={class:"apply-flow__node","aria-hidden":"true"},',
                'AfNode={class:"apply-flow__node"},',
            ),
        ]:
            if a in t2:
                t2 = t2.replace(a, b, 1)
                print("replaced", a[:40])
            else:
                print("missing", a[:40])
        t = t2
else:
    t = t.replace(old_consts, new_consts, 1)
    print("replaced consts block")

# Replace list item render
# Current pattern around C(Q,(n,o)=>e("li"...
old_item = None
m = re.search(
    r'C\(Q,\(n,o\)=>e\("li",\{key:n\.id,class:"apply-flow__item"\},\[.*?\]\)\)',
    t,
)
if not m:
    raise SystemExit("item render not found")

old_item = m.group(0)
new_item = (
    'C(Q,(n,o)=>e("li",{key:n.id,class:"apply-flow__item"},['
    'e("div",AfNode,[e("img",{class:"apply-flow__icon",src:n.src,alt:n.label},null,8,AfImg)]),'
    "e(\"strong\",AfTitle,f(n.label),1),"
    'o<Q.length-1?(l(),r("span",AfArrow,"→")):f("",!0)'
    "]))"
)
# Wait - Vue uses k("",!0) for empty comment, and f is toDisplayString. Looking at imports:
# `A as f` is toDisplayString, empty is usually `k("",!0)` where k is createCommentVNode.
# Check imports in file: `n as k` might not exist. Looking at portal file imports:
# import{d as N,a as O,b as _,v as $,r as p,o as l,c as r,i as G,h as e,J as R,K as C,j as E,k as m,M as te,A as f,_ as le}
# So: o=l (openBlock), c=r (createElementBlock), h=e (createElementVNode), J=R (Fragment), K=C (renderList),
# j=E (createTextVNode), k=m (unref), A=f (toDisplayString)
# For empty/comment they used: looking at original - no createCommentVNode imported!
# Original: always renders AfArrow span, CSS hides on last child.
# Keep that pattern - always render arrow, CSS hides last.

new_item = (
    'C(Q,(n,o)=>e("li",{key:n.id,class:"apply-flow__item"},['
    'e("div",AfNode,[e("img",{class:"apply-flow__icon",src:n.src,alt:n.label},null,8,AfImg)]),'
    "e(\"strong\",AfTitle,f(n.label),1),"
    'e("span",AfArrow,"→")'
    "]))"
)

t = t[: m.start()] + new_item + t[m.end() :]
print("replaced item render")

# Fix AfArrow to be a text arrow span - class stays
# Ensure AfImg exists
if "AfImg=" not in t:
    raise SystemExit("AfImg missing after patch")

js_path.write_text(t, encoding="utf-8")
print("wrote js")

# --- CSS: match design ---
css = css_path.read_text(encoding="utf-8")

# Replace apply-flow related rules block from .apply-flow through media query for apply-flow
# Find start of .apply-flow[ and end before .regorg-duty
start = css.find(".apply-flow[data-v-58bb0b90]")
end = css.find(".regorg-duty[data-v-58bb0b90]")
if start < 0 or end < 0:
    raise SystemExit(f"css markers not found start={start} end={end}")

new_css_flow = """\
.apply-flow[data-v-58bb0b90]{position:relative;width:100%;margin-top:56px}
.apply-flow__list[data-v-58bb0b90]{display:flex;align-items:flex-start;justify-content:space-between;width:100%;margin:0;padding:0;list-style:none}
.apply-flow__item[data-v-58bb0b90]{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;flex:1 1 0;min-width:0;padding:0 8px}
.apply-flow__node[data-v-58bb0b90]{width:64px;height:64px;border-radius:14px;overflow:hidden;flex-shrink:0;box-shadow:0 6px 16px #1345a51f}
.apply-flow__icon[data-v-58bb0b90]{width:64px;height:64px;display:block;object-fit:contain}
.apply-flow__title[data-v-58bb0b90]{margin-top:16px;color:#121b2c;font-size:14px;font-weight:600;line-height:22px;white-space:nowrap}
.apply-flow__arrow[data-v-58bb0b90]{position:absolute;left:calc(50% + 40px);right:auto;top:22px;width:auto;height:auto;margin:0;border:none;transform:none;color:#8eb4e8;font-size:18px;line-height:1;font-weight:400;pointer-events:none;letter-spacing:0}
.apply-flow__item:last-child .apply-flow__arrow[data-v-58bb0b90]{display:none}
@media (max-width:900px){
.apply-flow__list[data-v-58bb0b90]{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));row-gap:36px;column-gap:8px}
.apply-flow__arrow[data-v-58bb0b90]{display:none}
.apply-flow__title[data-v-58bb0b90]{white-space:normal;padding:0 4px;font-size:13px}
}
"""

css = css[:start] + new_css_flow + css[end:]
css_path.write_text(css, encoding="utf-8")
print("wrote css")

# verify js
t2 = js_path.read_text(encoding="utf-8")
assert "apply-flow__no" not in t2
assert "apply-flow__dot" not in t2
assert 'e("span",AfArrow,"→")' in t2
assert "AfImg" in t2
print("ok")
