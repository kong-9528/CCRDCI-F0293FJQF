# -*- coding: utf-8 -*-
from pathlib import Path
import re

js = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/portal-CGcjgAeB.js")
t = js.read_text(encoding="utf-8")
out = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_tmp_portal_flow.txt")

parts = []
for key in ["如何申请", "立即申请", "准入", "流程", "apply", "step", "flow", "process"]:
    parts.append(f"=== count {key}: {t.count(key)} ===")

# dump structure around 如何申请
idx = t.find("如何申请")
if idx < 0:
    # try unicode escapes
    idx = t.find("\\u5982\\u4f55\\u7533\\u8bf7")
parts.append(f"idx={idx}")
if idx >= 0:
    parts.append(t[max(0, idx - 300) : idx + 2000])

# also find step labels
for lab in ["准入咨询", "业务综合", "协议达成", "业务开通", "接入方", "持续服务"]:
    i = t.find(lab)
    parts.append(f"{lab} @ {i}")

# find class names related to flow
for m in re.finditer(r'class:"[^"]*(?:flow|step|apply|process|howto)[^"]*"', t, re.I):
    parts.append(m.group(0))

out.write_text("\n".join(parts), encoding="utf-8")
print("wrote", out, "len", len(t))
