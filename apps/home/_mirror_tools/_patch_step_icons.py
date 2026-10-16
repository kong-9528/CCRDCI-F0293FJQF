# -*- coding: utf-8 -*-
"""Swap apply-flow SVG icons for original center_step PNGs, keep 64px display size."""
import shutil
from pathlib import Path

src_dir = Path(
    r"C:\Users\leste\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\7a99a250099a926a43f880d212352a81\images"
)
dst = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\png")

for i in range(1, 7):
    matches = list(src_dir.glob(f"center_step{i}-*.png"))
    if len(matches) != 1:
        raise SystemExit(f"expected 1 source for step {i}, got {matches}")
    target = dst / f"center_step{i}.png"
    shutil.copy2(matches[0], target)
    head = target.read_bytes()[:8]
    if head != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"not png {target}")
    if target.stat().st_size != matches[0].stat().st_size:
        raise SystemExit(f"size mismatch step {i}")
    print(f"copied step{i} {target.stat().st_size}")

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js")
js = js_path.read_text(encoding="utf-8")

old_q_start = js.find("const Q=[")
old_q_end = js.find("],W=[", old_q_start)
if old_q_start < 0 or old_q_end < 0:
    raise SystemExit("Q array not found")
new_q = (
    "const Q=["
    '{id:"consult",label:"准入咨询与申请",src:"/static/png/center_step1.png"},'
    '{id:"evaluate",label:"业务综合评估",src:"/static/png/center_step2.png"},'
    '{id:"agree",label:"协议达成",src:"/static/png/center_step3.png"},'
    '{id:"access",label:"业务开通接入",src:"/static/png/center_step4.png"},'
    '{id:"debug",label:"接入方建设联调",src:"/static/png/center_step5.png"},'
    '{id:"operate",label:"持续服务与运营",src:"/static/png/center_step6.png"}'
    "]"
)
js = js[:old_q_start] + new_q + js[old_q_end + 1 :]

old_render = (
    'e("div",AfNode,[(l(),r("svg",AfIcon,[e("path",{d:n.path,stroke:"currentColor","stroke-width":"1.6","stroke-linecap":"round","stroke-linejoin":"round"},null,8,AfPath)]))])'
)
new_render = (
    'e("div",AfNode,[e("img",{class:"apply-flow__icon",src:n.src,alt:""},null,8,["src"])])'
)
if old_render not in js:
    raise SystemExit("render snippet not found")
js = js.replace(old_render, new_render, 1)
js_path.write_text(js, encoding="utf-8")
print("js updated")

css_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css")
css = css_path.read_text(encoding="utf-8")
old_node = ".apply-flow__node[data-v-58bb0b90]{width:64px;height:64px;border-radius:14px;background:#1345a5;color:#fff;display:flex;align-items:center;justify-content:center;box-sizing:border-box}"
new_node = ".apply-flow__node[data-v-58bb0b90]{width:64px;height:64px;border-radius:14px;background:transparent;display:flex;align-items:center;justify-content:center;box-sizing:border-box;overflow:hidden}"
old_icon = ".apply-flow__icon[data-v-58bb0b90]{width:28px;height:28px;display:block}"
new_icon = ".apply-flow__icon[data-v-58bb0b90]{width:64px;height:64px;display:block;object-fit:contain}"
if old_node not in css or old_icon not in css:
    raise SystemExit("css rules missing")
css = css.replace(old_node, new_node, 1).replace(old_icon, new_icon, 1)
css_path.write_text(css, encoding="utf-8")
print("css updated")
