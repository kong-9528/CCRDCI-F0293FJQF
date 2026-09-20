import fs from "fs";

// Modal register mode copy in auth dialog
const bi = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);
const i = bi.indexOf("账号注册");
console.log("modal 账号注册 idx", i);
if (i >= 0) console.log(bi.slice(i - 100, i + 400));

const texts = [...bi.matchAll(/class:"reg-[^"]+"[^}]{0,200}/g)].slice(0, 10);
console.log("\nreg classes", texts.map((m) => m[0].slice(0, 120)));

// find register header strings
for (const k of [
  "账号注册",
  "填写以下信息完成账号注册",
  "请输入 11 位手机号码",
  "请输入11位",
  "获取验证码",
  "去登录",
  "已有账号",
]) {
  const j = bi.indexOf(k);
  console.log(k, j >= 0 ? "FOUND" : "missing", j >= 0 ? bi.slice(j, j + 60) : "");
}
