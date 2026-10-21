# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(r"C:\Users\leste\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb")
out = Path(__file__).with_name("_token_hits.txt")
hits = []
for p in root.glob("*"):
    if p.suffix not in {".ldb", ".log"}:
        continue
    try:
        data = p.read_bytes()
    except Exception:
        continue
    # search printable around Admin-Token / Authorization / token
    for key in [b"Admin-Token", b"Authorization", b"access_token", b"Bearer ", b"dci-manage"]:
        idx = 0
        while True:
            i = data.find(key, idx)
            if i < 0:
                break
            chunk = data[max(0, i - 40) : i + 200]
            # keep printable
            s = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
            hits.append(f"{p.name}@{i}: {s}")
            idx = i + len(key)
            if len(hits) > 80:
                break
        if len(hits) > 80:
            break

# also JWT-like
for p in root.glob("*.ldb"):
    try:
        data = p.read_bytes()
    except Exception:
        continue
    for m in re.finditer(rb"eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}", data):
        hits.append(f"JWT {p.name}: {m.group(0)[:120].decode('ascii','ignore')}")
        if len(hits) > 100:
            break

out.write_text("\n".join(hits[:100]), encoding="utf-8")
print("hits", len(hits), "wrote", out)
