import fs from "fs";

const js = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

const keys = [
  "账号注册",
  "填写以下信息完成账号注册",
  'label:"密码"',
  'label:"确认密码"',
  'label:"账号名"',
  'label:"手机号码"',
  'label:"图形验证码"',
  'label:"手机验证码"',
  'C("注册"',
  "已有账号？",
  "去登录",
  "注册成功",
  "showLogin",
  "请输入 11 位手机号码",
];
for (const k of keys) console.log(js.includes(k) ? "OK" : "MISS", k);

const order = ["账号名", "密码", "确认密码", "手机号码", "图形验证码", "手机验证码"];
let pos = -1;
for (const l of order) {
  const i = js.indexOf(`label:"${l}"`);
  console.log("order", l, i, i > pos ? "ok" : "BAD");
  pos = i;
}

// showLogin handling in home entry chunks
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(`${dir}/${f}`, "utf8");
  if (t.includes("showLogin")) console.log("showLogin in", f);
}
