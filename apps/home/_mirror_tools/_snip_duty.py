# -*- coding: utf-8 -*-
from pathlib import Path
js = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js").read_text(encoding="utf-8")
i = js.find('class:"section-title"},"DCI注册中心职责"')
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_duty_snip.txt").write_text(js[i-200:i+1200], encoding="utf-8")
css = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css").read_text(encoding="utf-8")
j = css.find(".regorg-duty")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_duty_css.txt").write_text(css[j:j+1800], encoding="utf-8")
print("ok", i, j)
