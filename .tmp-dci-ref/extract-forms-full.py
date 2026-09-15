import glob
import pathlib
import re

htmls = sorted(glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*.html"))
out = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref")

for i, f in enumerate(htmls):
    text = pathlib.Path(f).read_text(encoding="utf-8", errors="replace")
    pretty = re.sub(r"><", ">\n<", text)
    # Find form and take large chunk until footer or end of form buttons
    keys = ["申请成为DCI注册中心", "申请接入技术服务中心", "提交申请", "确认提交"]
    start = -1
    for k in keys[:2]:
        start = pretty.find(k)
        if start >= 0:
            break
    if start < 0:
        print("no start", i)
        continue
    end = pretty.find("确认提交", start)
    if end < 0:
        end = pretty.find("提交申请", start)
    chunk = pretty[start : end + 800 if end > 0 else start + 15000]
    (out / f"apply-form-{i}.txt").write_text(chunk, encoding="utf-8")
    print(i, "chunk", len(chunk), "submit", end)
