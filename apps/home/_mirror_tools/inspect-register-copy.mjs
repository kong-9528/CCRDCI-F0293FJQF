import fs from "fs";

const js = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

// extract Chinese strings
const texts = [...js.matchAll(/["'`]([\u4e00-\u9fff][^"'`]{0,80})["'`]/g)].map((m) => m[1]);
console.log([...new Set(texts)].join("\n"));

console.log("\n--- snippets ---");
for (const k of [
  "用户极简注册",
  "账号注册",
  "DCI 账号",
  "立即注册",
  "请输入账号名",
  "填写以下",
  "已有账号",
  "去登录",
]) {
  const i = js.indexOf(k);
  if (i >= 0) console.log(k, "=>", js.slice(i - 30, i + 80));
}
