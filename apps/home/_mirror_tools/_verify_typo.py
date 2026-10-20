# -*- coding: utf-8 -*-
import re
import urllib.request
from pathlib import Path

out = Path(__file__).with_name("_typo_verify.txt")
lines = []

js = urllib.request.urlopen("http://localhost:3020/static/js/index-hnrUP1Bs.js").read().decode(
    "utf-8"
)
m = re.search(r'<p class="tc-hero__lead"[^>]*>.*?</p>', js, re.S)
lead = m.group(0) if m else ""
lines.append(f"lead={lead}")
lines.append(f"br={('<br' in lead)}")
lines.append(f"highlight={('tc-hero__highlight' in lead)}")
expected = (
    "以DCI国家标准为引领，以DCI体系4.0（全球版权数据中心）版权数智基础设施为底层支撑，"
    "基于DCI可信版权数据构建的技术服务支撑能力"
)
lines.append(f"has_expected={expected in lead}")

ov = urllib.request.urlopen("http://localhost:3020/overrides.css").read().decode(
    "utf-8", "replace"
)
for key in [
    "tech-center-typography-system-2026",
    "font-size: 42px",
    "font-size: 30px",
    "font-size: 20px",
    "font-size: 14px",
    "#4d576a",
    "#121b2c",
]:
    lines.append(f"ov {key}: {key in ov}")

out.write_text("\n".join(lines), encoding="utf-8")
print("\n".join(lines))
