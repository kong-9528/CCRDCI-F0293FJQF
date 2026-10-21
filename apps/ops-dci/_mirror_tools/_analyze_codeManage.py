# -*- coding: utf-8 -*-
from pathlib import Path
import re
import json

mirror = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\ops-dci\mirror\static\js")
out = Path(__file__).with_name("_codeManage_analysis.txt")
lines = []

cm = (mirror / "codeManage-CIC4UakA.js").read_text(encoding="utf-8")
lines.append("=== codeManage-CIC4UakA.js ===")
lines.append(cm[:2500])
# urls
urls = re.findall(r'["\'](/[^"\']+)["\']', cm)
lines.append("urls=" + repr(urls))
urls2 = re.findall(r'url:\s*["\`]([^"\`]+)["\`]', cm)
lines.append("url_props=" + repr(urls2))
# template literals
urls3 = re.findall(r"`([^`]{5,120})`", cm)
lines.append("backticks=" + repr(urls3))

opus = (mirror / "opus-DCRymxdq.js").read_text(encoding="utf-8")
lines.append("=== opus-DCRymxdq.js head ===")
lines.append(opus[:1500])
# routes / details
for key in ["codeManage-details", "opusR", "allocation", "详情", "detail"]:
    i = opus.find(key)
    lines.append(f"opus find {key}={i}")
    if i >= 0:
        lines.append(opus[max(0, i - 80) : i + 160])

# router in index-DsYmzmNg - too big, grep file for codeManage-details
main = (mirror / "index-DsYmzmNg.js").read_text(encoding="utf-8")
for key in ["codeManage-details", "opusRdetails", "allocation"]:
    idxs = [m.start() for m in re.finditer(re.escape(key), main)]
    lines.append(f"main {key} count={len(idxs)}")
    for i in idxs[:3]:
        lines.append(main[max(0, i - 100) : i + 200])

# mock store keys related
store = json.loads((mirror / "ops-mock-store.json").read_text(encoding="utf-8"))
keys = [k for k in store.keys() if "code" in k.lower() or "opus" in k.lower() or "alloc" in k.lower() or "detail" in k.lower()]
lines.append("mock_keys_sample=" + repr(keys[:80]))
lines.append(f"mock_keys_total_matching={len(keys)}")

# also check ops-mock-api for handlers
api = (mirror / "ops-mock-api.js").read_text(encoding="utf-8")
for key in ["codeManage", "opusR", "detail", "allocation", "xq"]:
    lines.append(f"mockapi {key} count={api.count(key)}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, "keys", len(keys))
