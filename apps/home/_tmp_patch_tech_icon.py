# -*- coding: utf-8 -*-
"""Replace 技术支撑 curly-braces text icon with terminal SVG."""
from pathlib import Path

js = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-E5LiAQ_v.js")
css = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/index-Djdj4Ogy.css")
t = js.read_text(encoding="utf-8")

# 1) Change life-braces span attrs -> svg attrs (reuse key 0)
old_he = 'he={key:0,class:"life-braces"}'
new_he = (
    'he={key:0,class:"life-ico life-ico--sm",viewBox:"0 0 24 24","aria-hidden":"true"}'
)
if old_he not in t:
    if 'class:"life-braces"' in t:
        raise SystemExit("he pattern drifted")
    print("he already patched or braces gone")
else:
    t = t.replace(old_he, new_he, 1)
    print("patched he attrs")

# 2) Replace span("{ }") with svg terminal paths
# Current:
#   t.icon==="code"?(l(),i("span",he,"{ }")):(l(),i("svg",_e,[...
old_code = 't.icon==="code"?(l(),i("span",he,"{ }")):'
# Terminal: rounded square + chevron > + underscore _
# Match stroke style of sibling life-ico icons
new_code = (
    't.icon==="code"?(l(),i("svg",he,[...s[12]||(s[12]=['
    'e("rect",{x:"3.8",y:"3.8",width:"16.4",height:"16.4",rx:"3.2",ry:"3.2"},null,-1),'
    'e("path",{d:"M8.2 9.2L12 12l-3.8 2.8"},null,-1),'
    'e("path",{d:"M12.6 14.6H17"},null,-1)'
    '])])):'
)
if old_code not in t:
    if 'icon==="code"?(l(),i("svg",he' in t:
        print("code branch already svg")
    else:
        idx = t.find('icon==="code"')
        raise SystemExit("code branch not found: " + repr(t[idx : idx + 120]))
else:
    t = t.replace(old_code, new_code, 1)
    print("patched code branch")

js.write_text(t, encoding="utf-8")

# 3) CSS: life-braces unused; ensure sm icon still fine. Optional: remove life-braces rule.
c = css.read_text(encoding="utf-8")
old_css = (
    ".life-braces[data-v-e8a03aec]{margin-right:8px;font-size:15px;"
    "font-weight:600;letter-spacing:1px;line-height:1}"
)
if old_css in c:
    c = c.replace(old_css, "", 1)
    css.write_text(c, encoding="utf-8")
    print("removed life-braces css")
else:
    print("life-braces css already gone or different")

# verify
t2 = js.read_text(encoding="utf-8")
assert '"{ }"' not in t2 or 'icon==="code"' not in t2.split('"{ }"')[0][-80:]
assert 'icon==="code"?(l(),i("svg",he' in t2
assert "M8.2 9.2L12 12l-3.8 2.8" in t2
print("ok")
