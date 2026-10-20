# -*- coding: utf-8 -*-
from pathlib import Path
import subprocess
import tempfile

js_path = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\index-hnrUP1Bs.js")
bak = js_path.with_suffix(js_path.suffix + ".bak_tech")
js = js_path.read_text(encoding="utf-8")
out = Path(__file__).with_name("_fix_js.txt")
lines = []

# paren balance after stripping strings roughly
depth = 0
min_d = 0
for i, ch in enumerate(js):
    if ch == "(":
        depth += 1
    elif ch == ")":
        depth -= 1
        if depth < min_d:
            min_d = depth
lines.append(f"paren_end={depth} min={min_d} len={len(js)}")

# bracket
depth = 0
for ch in js:
    if ch == "[":
        depth += 1
    elif ch == "]":
        depth -= 1
lines.append(f"bracket_end={depth}")

depth = 0
for ch in js:
    if ch == "{":
        depth += 1
    elif ch == "}":
        depth -= 1
lines.append(f"brace_end={depth}")

# compare bak length and whether current is truncated mid-expression
if bak.exists():
    b = bak.read_text(encoding="utf-8")
    lines.append(f"bak_len={len(b)} cur_len={len(js)}")
    # find wave in bak and show surrounding for clean removal
    i = b.find("tc-hero-wave")
    lines.append(f"bak_wave_at={i}")
    if i >= 0:
        # find start of ,c[10] before wave
        start = b.rfind(",c[10]", 0, i)
        # find end: after wave svg closing
        end = b.find("])]))", i)
        if end >= 0:
            end = end + len("])]))")
        lines.append(f"bak_remove={start}-{end}")
        if start >= 0 and end and end > start:
            snippet = b[start:end]
            lines.append(f"snippet_len={len(snippet)}")
            Path(__file__).with_name("_wave_snip.txt").write_text(snippet, encoding="utf-8")

# try node --check
r = subprocess.run(
    ["node", "--check", str(js_path)],
    capture_output=True,
    text=True,
)
lines.append(f"node_check_rc={r.returncode}")
if r.stderr:
    lines.append("stderr=" + r.stderr[:500])

out.write_text("\n".join(lines), encoding="utf-8")
print("\n".join(lines))
