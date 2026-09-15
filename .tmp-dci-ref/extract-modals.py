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
idx = text.find("修改手机号")
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/phone-modal.txt").write_text(
    text[idx : idx + 4500], encoding="utf-8"
)
idx2 = text.find("修改密码")
print("修改密码", idx2)
# try 更换密码 / 旧密码
for k in ["旧密码", "新密码", "确认新密码", "确认注销", "登录密码", "短信验证码", "图形验证码"]:
    print(k, text.find(k))
idx3 = text.find("旧密码")
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/pwd-modal.txt").write_text(
    text[idx3 - 500 : idx3 + 4000], encoding="utf-8"
)
idx4 = text.find("确认注销")
if idx4 < 0:
    idx4 = text.find("账号注销")
pathlib.Path(r"c:/WORKING_PLACE/CODE_R/sampleA/.tmp-dci-ref/cancel-modal.txt").write_text(
    text[idx4 - 200 : idx4 + 3500], encoding="utf-8"
)
