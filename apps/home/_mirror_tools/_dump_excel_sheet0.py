# -*- coding: utf-8 -*-
import openpyxl
from pathlib import Path

p = Path("docsss/documents") / "业务梳理-版权各业务线字段.xlsx"
wb = openpyxl.load_workbook(p, data_only=True)
print("sheets:", wb.sheetnames)
ws = wb[wb.sheetnames[0]]
print("sheet0:", ws.title)
out = Path("apps/home/_mirror_tools/_excel_sheet0_dump.txt")
lines = []
for i, row in enumerate(ws.iter_rows(values_only=True), 1):
    lines.append(f"{i}\t{row}")
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, "rows", len(lines))
