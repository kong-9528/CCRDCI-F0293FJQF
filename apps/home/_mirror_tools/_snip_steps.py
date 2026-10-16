# -*- coding: utf-8 -*-
from pathlib import Path
js = Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\mirror\static\js\portal-CGcjgAeB.js").read_text(encoding="utf-8")
i = js.find("const Q=[")
j = js.find("e(\"div\",AfNode")
Path(r"c:\WORKING_PLACE\CODE_R\sampleA\apps\home\_mirror_tools\_steps.txt").write_text(
    "Q:\n" + js[i:i+900] + "\n\nRENDER:\n" + js[j-80:j+500],
    encoding="utf-8",
)
print(i, j)
