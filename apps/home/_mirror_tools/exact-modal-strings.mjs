import fs from "fs";

const bi = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// extract placeholders from modal register
for (const k of [
  "请输入账号名",
  "8-12位",
  "请再次输入密码",
  "请输入 11 位手机号码",
  "请输入图形验证码",
  "请输入短信验证码",
  "获取验证码",
  "注册",
  "账号名",
  "密码",
  "确认密码",
  "手机号码",
  "图形验证码",
  "手机验证码",
]) {
  const i = bi.indexOf(k, bi.indexOf("账号注册"));
  if (i < 0) {
    console.log("MISS", k);
    continue;
  }
  console.log("OK", JSON.stringify(bi.slice(i, i + Math.min(60, k.length + 20))));
}

// password placeholder full
const p = bi.indexOf("8-12位");
console.log("pwd ph", JSON.stringify(bi.slice(p, p + 50)));
