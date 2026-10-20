# -*- coding: utf-8 -*-
"""Align tech-center typography with /dci/system; merge banner lead into one paragraph."""
import re
from pathlib import Path

JS = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js")
OV = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\overrides.css")
LOG = Path(__file__).with_name("_tech_typo_log.txt")
lines = []

js = JS.read_text(encoding="utf-8")

# Merge banner lead: remove <br> and highlight span → one plain paragraph
# Current static HTML block inside o('...')
patterns = [
    # with highlight span and brs
    (
        r'<p class="tc-hero__lead"[^>]*>\s*'
        r"以DCI国家标准为引领，"
        r'<br[^/]*/?>\s*'
        r"以DCI体系4\.0（全球版权数据中心）版权数智基础设施为底层支撑，"
        r'<br[^/]*/?>\s*'
        r'基于DCI可信版权数据构建的<span class="tc-hero__highlight"[^>]*>技术服务支撑能力</span>'
        r"</p>",
        '<p class="tc-hero__lead" data-v-873a6031> '
        "以DCI国家标准为引领，以DCI体系4.0（全球版权数据中心）版权数智基础设施为底层支撑，"
        "基于DCI可信版权数据构建的技术服务支撑能力"
        "</p>",
    ),
]

replaced = False
for old, new in patterns:
    m = re.search(old, js, flags=re.S)
    if m:
        js = js[: m.start()] + new + js[m.end() :]
        replaced = True
        lines.append("merged hero lead via regex pattern")
        break

if not replaced:
    # looser: find tc-hero__lead paragraph and replace inner content
    m = re.search(
        r'(<p class="tc-hero__lead"[^>]*>)(.*?)(</p>)',
        js,
        flags=re.S,
    )
    if not m:
        raise SystemExit("hero lead p not found")
    new_inner = (
        " 以DCI国家标准为引领，以DCI体系4.0（全球版权数据中心）版权数智基础设施为底层支撑，"
        "基于DCI可信版权数据构建的技术服务支撑能力"
    )
    js = js[: m.start(2)] + new_inner + js[m.end(2) :]
    lines.append("merged hero lead via loose replace")
    lines.append(f"old_inner_preview={m.group(2)[:120]!r}")

JS.write_text(js, encoding="utf-8")
lines.append("wrote JS")

# Typography overrides — match /dci/system (index-BGhEYlK7.css)
marker = "/* tech-center-typography-system-2026 */"
block = f"""
{marker}
/* Align /dci/tech-center text with /dci/system */
.page-container[data-v-873a6031],
.page-container:has(.tc-hero) {{
  font-family: PingFangSC-Regular, Microsoft YaHei, sans-serif !important;
  color: #121b2c !important;
}}

.tc-hero__title[data-v-873a6031],
.tc-hero__title {{
  font-size: 42px !important;
  font-weight: 700 !important;
  line-height: 56px !important;
  letter-spacing: 0 !important;
  text-shadow: none !important;
  color: #fff !important;
}}
.tc-hero__reg[data-v-873a6031],
.tc-hero__reg {{
  font-size: 18px !important;
  vertical-align: super !important;
}}
.tc-hero__lead[data-v-873a6031],
.tc-hero__lead {{
  margin: 16px 0 0 !important;
  max-width: 640px !important;
  font-size: 20px !important;
  font-weight: 400 !important;
  line-height: 32px !important;
  color: rgba(255, 255, 255, 0.85) !important;
}}
.tc-hero__lead br,
.tc-hero__highlight {{
  /* keep highlight as plain if residual */
}}
.tc-hero__highlight[data-v-873a6031],
.tc-hero__highlight {{
  background: none !important;
  -webkit-background-clip: unset !important;
  background-clip: unset !important;
  color: inherit !important;
}}

.tc-section__title[data-v-873a6031],
.tc-section__title {{
  font-size: 30px !important;
  font-weight: 700 !important;
  line-height: 40px !important;
  color: #121b2c !important;
}}
.tc-section__lead[data-v-873a6031],
.tc-section__lead {{
  margin: 16px 0 0 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 24px !important;
  color: #4d576a !important;
}}

.tc-card__body h3[data-v-873a6031],
.tc-card__body h3 {{
  margin: 0 0 8px !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  line-height: 27px !important;
  color: #303133 !important;
}}
.tc-card__body p[data-v-873a6031],
.tc-card__body p {{
  margin: 0 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 24px !important;
  color: #4d576a !important;
}}

.tc-review-card h3[data-v-873a6031],
.tc-review-card h3 {{
  font-size: 20px !important;
  font-weight: 700 !important;
  line-height: 27px !important;
  letter-spacing: 0 !important;
  color: #303133 !important;
}}
.tc-review-card p[data-v-873a6031],
.tc-review-card p {{
  margin: 8px 0 0 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 24px !important;
  color: #4d576a !important;
}}

.tc-apply-btn[data-v-873a6031],
.tc-apply-btn,
.tc-cta[data-v-873a6031],
.tc-cta,
a.tc-apply-btn,
button.tc-apply-btn {{
  font-size: 16px !important;
  font-weight: 600 !important;
  line-height: 24px !important;
}}
"""

ov = OV.read_text(encoding="utf-8")
if marker in ov:
    start = ov.index(marker)
    rest = ov[start + len(marker) :]
    end_m = re.search(r"\n/\* (?!tech-center-typography)", rest)
    if end_m:
        ov = ov[:start] + block + rest[end_m.start() + 1 :]
    else:
        ov = ov[:start] + block
    lines.append("replaced typography overrides")
else:
    ov = ov.rstrip() + "\n" + block
    lines.append("appended typography overrides")

OV.write_text(ov, encoding="utf-8")
lines.append("wrote overrides")

# verify lead has no br
js2 = JS.read_text(encoding="utf-8")
m = re.search(r'<p class="tc-hero__lead"[^>]*>.*?</p>', js2, flags=re.S)
if m:
    lead = m.group(0)
    lines.append(f"lead_has_br={'<br' in lead}")
    lines.append(f"lead_has_highlight={'tc-hero__highlight' in lead}")
    lines.append(f"lead_len={len(lead)}")
    # write lead snippet to log file only
    Path(__file__).with_name("_tech_lead_snip.txt").write_text(lead, encoding="utf-8")

LOG.write_text("\n".join(lines), encoding="utf-8")
print("\n".join(lines))
