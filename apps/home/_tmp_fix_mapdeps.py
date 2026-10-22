# -*- coding: utf-8 -*-
"""Fix mapDeps: move success assets to end so earlier indices stay valid."""
from pathlib import Path
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
router_path = Path(r"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js")
JS_NAME = "registerSuccess-D9kQm2Lp.js"
CSS_NAME = "registerSuccess-B7nWp4Hx.css"
js_entry = f'"static/js/{JS_NAME}"'
css_entry = f'"static/css/{CSS_NAME}"'

router = router_path.read_text(encoding="utf-8")
m = re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router, re.S)
if not m:
    raise SystemExit("mapDeps not found")
arr_body = m.group(1)
files = re.findall(r'"([^"]+)"', arr_body)
print("len before", len(files))
print("js at", files.index(f"static/js/{JS_NAME}") if f"static/js/{JS_NAME}" in files else None)
print("css at", files.index(f"static/css/{CSS_NAME}") if f"static/css/{CSS_NAME}" in files else None)

# Show what was at 58,59 originally-ish and neighbors
for i in range(max(0, 54), min(len(files), 65)):
    print(i, files[i])

# Remove mid-array success entries and append at end
# Rebuild array string carefully
entries = [f'"{f}"' for f in files]
# remove success entries wherever they are
cleaned = [e for e in entries if e not in (js_entry, css_entry)]
cleaned.append(js_entry)
cleaned.append(css_entry)
new_body = ",".join(cleaned)
router2 = router[: m.start(1)] + new_body + router[m.end(1) :]

files2 = re.findall(r'"([^"]+)"', re.search(r"m\.f\|\|\(m\.f=\[(.*?)\]\)", router2, re.S).group(1))
js_idx = files2.index(f"static/js/{JS_NAME}")
css_idx = files2.index(f"static/css/{CSS_NAME}")
print("new len", len(files2), "js", js_idx, "css", css_idx)

def find_idx(substr):
    for i, f in enumerate(files2):
        if substr in f:
            return i
    raise KeyError(substr)

auth_js = find_idx("index-BiQimQRe.js")
pwd = find_idx("passwordRule-CK9dJiC2.js")
auth_css = find_idx("index-CLvhJbpp.css")
hdr_js = find_idx("index-_fJendd7.js")
hdr_css = find_idx("index--ISO3lnV.css")
deps = f"{js_idx},{auth_js},{pwd},{auth_css},{hdr_js},{hdr_css},{css_idx}"
print("new deps", deps)

# Replace all success mapDeps arrays (lazy + route) that currently use [58,11,12,13,14,15,59]
old_deps_pat = re.compile(
    rf'import\("\./{re.escape(JS_NAME)}"\),__vite__mapDeps\(\[[^\]]+\]\)'
)
repl = f'import("./{JS_NAME}"),__vite__mapDeps([{deps}])'
count = 0

def _sub(mm):
    global count
    count += 1
    return repl

router2, n = old_deps_pat.subn(repl, router2)
print("replaced success mapDeps", n)

router_path.write_text(router2, encoding="utf-8")
print("ok")
