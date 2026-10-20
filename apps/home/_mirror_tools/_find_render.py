# -*- coding: utf-8 -*-
from pathlib import Path

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_tc_render.txt")

i = js.find('w(I,s=>t("article"')
chunk = js[i : i + 3500]
out.write_text(chunk, encoding="utf-8")
print("len", len(chunk), "at", i)
# also search for 技术服务
for s in ["技术服务", "申请DCI", "tc-section__actions", "openAuth", "onOpenAuth"]:
    print(s, js.find(s))
