import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
const js = fs.readFileSync(path, "utf8");

// Find likely breakage around our patches
const markers = [
  "reg-login-row",
  "register-card-head",
  'C("注册"',
  "账号注册",
  "填写以下信息完成账号注册",
  'label:"密码"',
  "请输入 11 位手机号码",
  'push({path:"/",query:{showLogin:"true"}})',
];
for (const m of markers) {
  console.log(m, js.includes(m) ? "OK" : "MISSING");
}

const i = js.indexOf("reg-login-row");
console.log("\n--- around login row ---");
console.log(js.slice(i - 200, i + 350));

const j = js.indexOf("register-card-head");
console.log("\n--- around card head ---");
console.log(js.slice(j - 80, j + 400));

// count parentheses balance roughly in file
let bal = 0;
let minBal = 0;
for (const ch of js) {
  if (ch === "(") bal++;
  if (ch === ")") bal--;
  if (bal < minBal) minBal = bal;
}
console.log("\nparen balance", bal, "min", minBal);
