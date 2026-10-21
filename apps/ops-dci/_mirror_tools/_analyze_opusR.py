# -*- coding: utf-8 -*-
from pathlib import Path
import re
from collections import Counter

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js\opusRdetails-BcBlhLGL.js"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_opusR_analysis.txt")
lines = [f"len={len(js)}"]
labels = re.findall(r"[\u4e00-\u9fff]{2,24}", js)
lines.append("top_labels=" + repr(Counter(labels).most_common(50)))
classes = sorted(set(re.findall(r'class:"([^"]+)"', js)))
lines.append("classes=" + repr(classes))
# API-like strings
apis = sorted(set(re.findall(r"/api/[^\"'`\s]+", js)))
lines.append("apis=" + repr(apis))
# template snippets with Chinese
for m in re.finditer(r'o\("([^"]{0,80})"\)', js):
    s = m.group(1)
    if re.search(r"[\u4e00-\u9fff]", s):
        lines.append("tpl=" + s[:120])
# also look in CSS
css = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\css\opusRdetails-Dd5tLsqF.css"
).read_text(encoding="utf-8")
lines.append(f"css_len={len(css)}")
lines.append("css_head=" + css[:800])
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
