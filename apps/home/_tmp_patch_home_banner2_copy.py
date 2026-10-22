# -*- coding: utf-8 -*-
"""Make home 2nd banner copy match /dci/system banner."""
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding="utf-8")
p = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js")
t = p.read_text(encoding="utf-8")

# 1) Add bannerIdx + bannerCopy next to k slides array
old_k = 'k=[{id:"banner1_index",src:Ae},{id:"banner2_index",src:ue}];function H(i){u.push(i)}'
new_k = (
    'k=[{id:"banner1_index",src:Ae},{id:"banner2_index",src:ue}],'
    "be=A(0),"
    'ke=[{title:"DCI（数字版权唯一标识符）",sub:"——数字空间唯一“版权身份证”和“权益凭证”"},'
    '{title:"DCI体系4.0（全球版权数据中心）",sub:"——AI时代的版权可信数智基础设施"}];'
    "function H(i){u.push(i)}"
    "function He(i){be.value=i}"
)
if "ke=[{title:" in t and "DCI体系4.0" in t:
    print("already patched copy data")
elif old_k not in t:
    raise SystemExit("k slides pattern not found")
else:
    t = t.replace(old_k, new_k, 1)
    print("added banner copy state")

# 2) Bind carousel onChange
old_car = 's(P,{class:"home-banner-carousel",height:"500px",interval:5e3,autoplay:!0,"pause-on-hover":!1,arrow:"hover","indicator-position":"inside"}'
new_car = 's(P,{class:"home-banner-carousel",height:"500px",interval:5e3,autoplay:!0,"pause-on-hover":!1,arrow:"hover","indicator-position":"inside",onChange:He}'
if "onChange:He" in t:
    print("carousel onChange already bound")
elif old_car not in t:
    raise SystemExit("carousel props not found")
else:
    t = t.replace(old_car, new_car, 1)
    print("bound carousel onChange")

# 3) Replace static hero overlay with reactive copy
old_hero = (
    'e[12]||(e[12]=t("div",{class:"hero-content flex-col"},[t("div",{class:"text-group_1 flex-col justify-between"},'
    '[t("span",{class:"paragraph_1"},"DCI（数字版权唯一标识符）"),'
    't("span",{class:"text_15"},"——数字空间唯一“版权身份证”和“权益凭证”")])],-1))'
)
new_hero = (
    't("div",{class:"hero-content flex-col"},[t("div",{class:"text-group_1 flex-col justify-between"},'
    '[t("span",{class:"paragraph_1"},C(ke[be.value].title),1),'
    't("span",{class:"text_15"},C(ke[be.value].sub),1)])])'
)
if "ke[be.value].title" in t:
    print("hero already reactive")
elif old_hero not in t:
    # show nearby for debug
    i = t.find("hero-content")
    raise SystemExit("hero pattern not found near: " + repr(t[i - 40 : i + 280]))
else:
    t = t.replace(old_hero, new_hero, 1)
    print("replaced hero with reactive copy")

p.write_text(t, encoding="utf-8")
print("ok")
# sanity
assert "DCI体系4.0（全球版权数据中心）" in t
assert "——AI时代的版权可信数智基础设施" in t
assert "onChange:He" in t
assert "ke[be.value].title" in t
print("sanity ok")
