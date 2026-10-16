# -*- coding: utf-8 -*-
from pathlib import Path
js = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-BZ7-YeMc.js").read_text(encoding="utf-8")
i = js.find("DCI查询")
print("subtitle left", "快速查询DCI申领状态" in js)
print(js[i-80:i+120])
css = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css\portal-BQh_66u9.css").read_text(encoding="utf-8")
j = css.find(".duty-row[data-v-58bb0b90]")
print(css[j:j+280])
