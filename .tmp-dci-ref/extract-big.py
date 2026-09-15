import glob
import pathlib

js = pathlib.Path(
    sorted(
        glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*_files/*"),
        key=lambda f: pathlib.Path(f).stat().st_size,
        reverse=True,
    )[0]
)
text = js.read_text(encoding="utf-8", errors="replace")

# Dump large chunk around 已开通服务 / account page component
idx = text.find("已开通服务")
chunk = text[idx - 8000 : idx + 6000]
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-comp-big.txt").write_text(
    chunk, encoding="utf-8"
)
print("big", len(chunk))

# Also around 账号信息
idx2 = text.find("账号信息")
chunk2 = text[idx2 - 3000 : idx2 + 5000]
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-info.txt").write_text(
    chunk2, encoding="utf-8"
)
print("info", len(chunk2))

# Find path /account route component
idx3 = text.find('path:"/account"')
if idx3 < 0:
    idx3 = text.find("path:`/account`")
print("route", idx3)
if idx3 >= 0:
    pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-route.txt").write_text(
        text[idx3 - 500 : idx3 + 1500], encoding="utf-8"
    )

# Search for tab=records and account tabs
for k in ["tab=records", "records", "申请记录", "入驻", "开通服务", "DCI注册中心", "技术服务"]:
    print(k, text.count(k))
