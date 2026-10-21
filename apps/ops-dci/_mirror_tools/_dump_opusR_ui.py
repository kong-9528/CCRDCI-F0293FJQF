# -*- coding: utf-8 -*-
"""Pretty-print opusRdetails structure for implementation reference."""
from pathlib import Path
import re

js = Path(
    r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js\opusRdetails-BcBlhLGL.js"
).read_text(encoding="utf-8")
out = Path(__file__).with_name("_opusR_ui.txt")

# Extract Chinese label sequences near fields
labels = re.findall(
    r'(?:label|null,)["\']?([^"\']*[\u4e00-\u9fff][^"\']{0,40})',
    js,
)
# Better: find "xxx：" patterns
fields = re.findall(r'"([^"]*[\u4e00-\u9fff]+[：:]?)"', js)
# also unquoted in o()
fields2 = re.findall(r">([\u4e00-\u9fff][^<]{0,30})<", js)
fields3 = re.findall(r'null,"([^"]+)"', js)

lines = ["=== field-like strings ==="]
for s in fields:
    if re.search(r"[\u4e00-\u9fff]", s):
        lines.append(s)

lines.append("\n=== setup / data access ===")
# find detail.value / .xxx patterns
access = sorted(set(re.findall(r"(?:detail|info|data)\.value\??\.(?:[a-zA-Z]+)", js)))
lines.extend(access[:80])
access2 = sorted(set(re.findall(r"\?\.(?:[a-zA-Z]{3,30})", js)))
lines.append("optional_chains sample:")
lines.extend(access2[:100])

# Os( usage
i = js.find("Os(")
lines.append("\n=== Os call context ===")
lines.append(js[i : i + 400] if i >= 0 else "none")

# section titles
lines.append("\n=== sections ===")
for s in ["DCI码基本信息", "作品基本信息", "作品样本", "著作权人信息", "权利信息", "关联登记信息", "数字版权链"]:
    lines.append(f"{s}: {s in js}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
