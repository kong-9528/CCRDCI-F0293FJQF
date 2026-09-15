import pathlib

text = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/js-registry-fields.txt").read_text(encoding="utf-8")
# also get more from big js around 申请接入技术服务
import glob
js = pathlib.Path(
    sorted(
        glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*1_files/*"),
        key=lambda f: pathlib.Path(f).stat().st_size,
        reverse=True,
    )[0]
)
t = js.read_text(encoding="utf-8", errors="replace")
idx = t.find("申请接入技术服务中心")
# find the component that renders this - search for creditCode or companyName state
for k in ["creditCode", "companyName", "company_address", "contact_email", "统一社会信用", "提交申请", "申请接入"]:
    print(k, t.find(k))

idx2 = t.find("统一社会信用")
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/js-tech-fields.txt").write_text(
    t[idx2 - 3000 : idx2 + 5000], encoding="utf-8"
)
print("wrote tech fields")
