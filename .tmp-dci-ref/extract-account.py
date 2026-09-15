import glob
import pathlib
import re

files = glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*.html")
text = pathlib.Path(files[0]).read_text(encoding="utf-8", errors="replace")
print("file", files[0])
print("len", len(text))

# Find account-related Chinese strings positions
for key in ["账号中心", "门户首页", "基本信息", "修改密码", "手机号", "绑定手机", "机构信息", "安全设置"]:
    print(key, text.find(key))

idx = text.find("账号中心")
chunk = text[max(0, idx - 800) : idx + 12000]
# Insert newlines before opening tags to make readable
pretty = re.sub(r"><", ">\n<", chunk)
out = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-extract.txt")
out.write_text(pretty, encoding="utf-8")
print("wrote", out, "chars", len(pretty))
