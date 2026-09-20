import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

const keys = [
  "账号注册",
  "填写以下",
  "隐私",
  "协议",
  "已同意",
  "去登录",
  "手机号",
  "手机验证码",
  "短信验证码",
  "获取验证码",
  "请输入图形验证码",
  "请输入短信验证码",
  "请输入8-12位密码",
];
for (const k of keys) console.log(t.includes(k) ? "OK" : "NO", k);

console.log("\n--- labels order ---");
for (const l of [
  "账号名",
  "密码",
  "确认密码",
  "手机号",
  "图形验证码",
  "手机验证码",
  "短信验证码",
]) {
  console.log(l, t.indexOf(`label:"${l}"`));
}

console.log("\n--- sms block ---");
const j = t.indexOf('prop:"smsCode"');
console.log(t.slice(j - 40, j + 450));

console.log("\n--- before submit ---");
const s = t.indexOf('C("注册"');
console.log(t.slice(s - 200, s + 280));

// search agreement in other files
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const x = fs.readFileSync(`${dir}/${f}`, "utf8");
  if (x.includes("隐私协议") || x.includes("用户协议") || x.includes("已同意")) {
    console.log("\nagree in", f);
    const i = x.indexOf("隐私");
    console.log(x.slice(Math.max(0, i - 80), i + 160));
  }
}
