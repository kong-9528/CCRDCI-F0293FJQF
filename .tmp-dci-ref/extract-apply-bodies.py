import pathlib
import re

for i in range(2):
    p = pathlib.Path(rf"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/apply-html-{i}.txt")
    text = p.read_text(encoding="utf-8")
    # find main form area - look for 申请
    for key in ["申请成为DCI注册中心", "申请开通", "技术服务中心", "账号中心", "开通管理"]:
        print(i, key, text.find(key))
    # strip header/footer-ish: from first card or form title
    idx = text.find("申请成为")
    if idx < 0:
        idx = text.find("申请开通")
    if idx < 0:
        idx = text.find("技术服务")
    chunk = text[max(0, idx - 200) : idx + 12000]
    pathlib.Path(rf"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/apply-body-{i}.txt").write_text(
        chunk, encoding="utf-8"
    )
    print("body", i, len(chunk))
