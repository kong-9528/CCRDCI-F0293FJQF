import glob
import pathlib
import re

js_files = glob.glob(r"c:/WORKING_PLACE/CODE_R/sampleA/docs/htmls/*_files/*")
for f in js_files:
    print(pathlib.Path(f).name, pathlib.Path(f).stat().st_size)

js = [f for f in js_files if "Rq7fqkkm" in f or f.endswith(".js") or "js" in pathlib.Path(f).name.lower()]
print("js candidates", js)
path = pathlib.Path(js[0]) if js else None
# find the largest js
cands = sorted(js_files, key=lambda f: pathlib.Path(f).stat().st_size, reverse=True)
path = pathlib.Path(cands[0])
print("using", path)
text = path.read_text(encoding="utf-8", errors="replace")

keys = [
    "账号中心",
    "门户首页",
    "返回门户",
    "基本信息",
    "账号信息",
    "修改密码",
    "手机号",
    "换绑",
    "绑定手机",
    "安全设置",
    "Account",
    "/account",
    "个人中心",
    "用户名",
    "注册时间",
    "上次登录",
    "邮箱",
]
for k in keys:
    print(repr(k), text.count(k))

# Extract JSX-ish chunks around 账号中心
for m in re.finditer("账号中心", text):
    start = max(0, m.start() - 2000)
    end = min(len(text), m.start() + 5000)
    chunk = text[start:end]
    out = pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/account-js.txt")
    out.write_text(chunk, encoding="utf-8")
    print("wrote account-js around first hit")
    break

# Also search for account page component patterns
for pat in [r"AccountPage|AccountCenter|/account`|/account'|path:`/account|children:`账号"]:
    ms = list(re.finditer(pat, text))
    print(pat, len(ms))
    if ms:
        m = ms[0]
        print(text[max(0, m.start()-300):m.start()+800][:1000])
