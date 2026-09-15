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

# Find Account page related strings with more context
patterns = [
    "注销账号",
    "已开通服务",
    "修改密码",
    "账号名",
    "绑定手机",
    "门户",
    "工作台",
    "AccountInfo",
    "children:`账号中心`",
    "注销后账号",
    "********",
]

out_dir = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref")
for i, pat in enumerate(patterns):
    idx = text.find(pat)
    print(pat, idx)
    if idx >= 0:
        chunk = text[max(0, idx - 1500) : idx + 3500]
        (out_dir / f"js-hit-{i}.txt").write_text(chunk, encoding="utf-8")

# Search for sidebar items
for pat in ["门户首页", "控制台", "侧边", "sidebar", "aside", "账号信息", "基本信息"]:
    print("count", pat, text.count(pat), "first", text.find(pat))
