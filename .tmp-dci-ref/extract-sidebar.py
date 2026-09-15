import glob
import pathlib
import re

js = pathlib.Path(
    sorted(
        glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*_files/*"),
        key=lambda f: pathlib.Path(f).stat().st_size,
        reverse=True,
    )[0]
)
text = js.read_text(encoding="utf-8", errors="replace")

# Find sidebar nav labels near account page - look for overview/records tab labels
for pat in [
    "账号概览",
    "概览",
    "申请记录",
    "我的申请",
    "个人信息",
    "返回",
    "首页",
    "u===`overview`",
    "setSearchParams",
    "tab:",
    "navItems",
    "侧栏",
]:
    print(repr(pat), text.find(pat), text.count(pat))

# Extract function that contains 已开通服务 - find function start
idx = text.find("已开通服务")
# walk back to find "function" or "=>{"
start = text.rfind("function ", max(0, idx - 50000), idx)
print("fn start candidates")
for m in re.finditer(r"function \w+|var \w+=\(|const \w+=\(", text[max(0, idx - 30000) : idx]):
    pass
# Get 15k before 账号中心 title usage in account
idx2 = text.find("title:`账号中心`")
print("title account", idx2)
chunk = text[idx2 - 12000 : idx2 + 2000]
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-before.txt").write_text(
    chunk, encoding="utf-8"
)

# Look for left nav structure with path / or 门户
idx3 = text.find("max-w-7xl mx-auto px-4 py-8")
print("layout", idx3)
if idx3 > 0:
    pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-layout.txt").write_text(
        text[idx3 - 2000 : idx3 + 4000], encoding="utf-8"
    )
