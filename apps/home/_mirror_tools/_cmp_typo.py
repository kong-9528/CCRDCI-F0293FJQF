# -*- coding: utf-8 -*-
from pathlib import Path
import re

out = Path(__file__).with_name("_typo_cmp.txt")
lines = []
css_dir = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\css")

for f in [
    "index-BGhEYlK7.css",
    "index-DxJ3jNSK.css",
    "index-CSHWisZW.css",
    "index-D5Nixirv.css",
    "portal-BQh_66u9.css",
    "index-DLjiOJYG.css",
]:
    css = css_dir / f
    if not css.exists():
        continue
    text = css.read_text(encoding="utf-8")
    lines.append(f"==== {f}")
    for m in re.finditer(
        r"(\.[a-zA-Z0-9_-]+)(?:\[[^\]]+\])?\{([^}]*)\}", text
    ):
        name, body = m.group(1), m.group(2)
        if "font-size" not in body and "font-weight" not in body:
            continue
        if not any(
            k in name
            for k in [
                "title",
                "desc",
                "hero",
                "section",
                "card",
                "lead",
                "intro",
                "text_",
                "label",
                "btn",
                "cta",
                "review",
            ]
        ):
            continue
        fs = re.search(r"font-size:([^;]+)", body)
        fw = re.search(r"font-weight:([^;]+)", body)
        lh = re.search(r"line-height:([^;]+)", body)
        c = re.search(r"color:([^;]+)", body)
        lines.append(
            f"  {name}: size={fs.group(1) if fs else '-'} "
            f"weight={fw.group(1) if fw else '-'} "
            f"lh={lh.group(1) if lh else '-'} "
            f"color={c.group(1) if c else '-'}"
        )

# also nested h3 rules in tech
text = (css_dir / "index-DLjiOJYG.css").read_text(encoding="utf-8")
lines.append("==== tech nested")
for m in re.finditer(
    r"(\.tc-[a-zA-Z0-9_-]+(?:\s+[a-z0-9._-]+)*)(?:\[[^\]]+\])?\{([^}]*)\}", text
):
    name, body = m.group(1), m.group(2)
    if "font-size" in body:
        lines.append(f"  {name}: {body[:200]}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, "lines", len(lines))
