# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static")
out = []

# 1) homepage links
home = (root / "js" / "index-LZ7b_aDw.js").read_text(encoding="utf-8")
for key in ["了解DCI体系", "了解更多标准", "/dci/system", "/dci/standard", "push(", "href"]:
    out.append(f"home count {key}: {home.count(key)}")

for m in re.finditer(r".{0,80}(了解DCI体系|了解更多标准).{0,120}", home):
    out.append("--- home link ---")
    out.append(m.group(0))

# 2) map routes to components
router = (root / "js" / "index-DA8BAxJb.js").read_text(encoding="utf-8")
for path in ["/dci/system", "/dci/standard", "/dci/regorg/portal", "/dci/lab", "/dci/ecology", "/dci/tech", "tech-center", "ecology"]:
    idxs = [m.start() for m in re.finditer(re.escape(path), router)]
    out.append(f"route {path}: {len(idxs)}")
    for i in idxs[:2]:
        out.append("  " + router[max(0, i - 40) : i + 160].replace("\n", " "))

# 3) extract hero-sub css from each css file
css_dir = root / "css"
for f in sorted(css_dir.glob("*.css")):
    t = f.read_text(encoding="utf-8")
    if "hero-sub" not in t:
        continue
    out.append(f"\n=== CSS {f.name} ===")
    for m in re.finditer(r"[^{]*hero-sub[^{]*\{[^}]*\}", t):
        out.append(m.group(0))
    for m in re.finditer(r"[^{]*hero-title[^{]*\{[^}]*\}", t):
        out.append(m.group(0)[:200])

# 4) which js files have hero-sub markup
js_dir = root / "js"
for f in sorted(js_dir.glob("*.js")):
    t = f.read_text(encoding="utf-8")
    if "hero-sub" not in t and "hero-title" not in t:
        continue
    out.append(f"\n=== JS {f.name} ===")
    for m in re.finditer(r".{0,40}hero-(?:sub|title).{0,80}", t):
        out.append(m.group(0)[:160])

Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_tmp_banner_audit.txt").write_text(
    "\n".join(out), encoding="utf-8"
)
print("done", len(out))
