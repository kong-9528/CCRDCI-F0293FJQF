# -*- coding: utf-8 -*-
from pathlib import Path
js = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js").read_text(encoding="utf-8")
# find card data array I=
for key in ['const I=', 'I=[{', 'title:"DCI核验"', 'title:"版权登记信息核验"', 'tc-hero', 'class:"tc-hero"']:
    print(key, js.find(key))

i = js.find('title:"DCI核验"')
if i < 0:
    i = js.find("DCI核验")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_tech_cards.txt").write_text(js[max(0,i-400):i+1800], encoding="utf-8")

# hero template
j = js.find('class:"tc-hero"')
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_tech_hero.txt").write_text(js[j:j+1500] if j>=0 else "no hero", encoding="utf-8")
print("wrote")
