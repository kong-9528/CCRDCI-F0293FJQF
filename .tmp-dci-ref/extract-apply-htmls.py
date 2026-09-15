import glob
import pathlib
import re

htmls = sorted(glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*.html"))
out = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref")
out.mkdir(exist_ok=True)

for i, f in enumerate(htmls):
    p = pathlib.Path(f)
    text = p.read_text(encoding="utf-8", errors="replace")
    # saved from url
    m = re.search(r"saved from url=\([^)]*\)(https?://[^\s-]+)", text)
    print(i, p.name, "url", m.group(1) if m else "?", "len", len(text))
    # find keywords
    for k in ["申请成为", "技术服务", "注册中心", "邀请码", "合同", "机构名称", "提交申请", "撤回"]:
        print(" ", k, text.find(k))
    start = text.find('<div id="root">')
    end = text.find("<footer")
    if start < 0:
        start = 0
    if end < 0:
        end = min(len(text), start + 50000)
    chunk = text[start:end]
    pretty = re.sub(r"><", ">\n<", chunk)
    (out / f"apply-html-{i}.txt").write_text(pretty, encoding="utf-8")
    print(" wrote", len(pretty))
