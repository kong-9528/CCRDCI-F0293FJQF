import glob
import pathlib

js = pathlib.Path(
    sorted(
        glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*1_files/*"),
        key=lambda f: pathlib.Path(f).stat().st_size,
        reverse=True,
    )[0]
)
# prefer the larger js from either folder
cands = []
for pat in [
    r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*_files/*",
    r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*1_files/*",
]:
    cands.extend(glob.glob(pat))
js = pathlib.Path(sorted(cands, key=lambda f: pathlib.Path(f).stat().st_size, reverse=True)[0])
print("js", js, js.stat().st_size)
text = js.read_text(encoding="utf-8", errors="replace")
for k in [
    "申请接入技术服务中心",
    "申请成为DCI注册中心",
    "提交申请",
    "撤回申请",
    "联系人姓名",
    "合作领域",
    "内容平台",
    "历史申请记录",
]:
    print(k, text.find(k), text.count(k))

idx = text.find("申请接入技术服务中心")
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/js-tech-apply.txt").write_text(
    text[idx - 500 : idx + 6000] if idx >= 0 else "missing", encoding="utf-8"
)
idx2 = text.find("申请成为DCI注册中心")
# find form submit nearby in registry apply component - search compact form fields
idx3 = text.find("org_pinyin")
print("org_pinyin", idx3)
if idx3 > 0:
    pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/js-registry-fields.txt").write_text(
        text[idx3 - 2000 : idx3 + 4000], encoding="utf-8"
    )
