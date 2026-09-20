import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });

const start = t.indexOf('_.value==="forgot"?');
const end = t.indexOf('去登录")])],64)):G("",!0)', start) + '去登录")])],64)):G("",!0)'.length;
const block = t.slice(start, end);
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_forgot-rebuilt.txt",
  block,
  "utf8",
);

// Structure assertions
const must = [
  'key:"forgot-verify"',
  'key:"forgot-setpwd"',
  'key:"forgot-back"',
  "onClick:Ze2",
  "ref:ue",
  "ref:W",
  "rules:Se1",
  "rules:Se2.value",
  'm("下一步"',
  'm("重置密码"',
  "上一步",
  "记起密码了",
];
for (const m of must) {
  if (!block.includes(m)) console.log("MISS in UI", m);
  else console.log("OK", m);
}

// Ensure login/register still present
console.log("login branch", t.includes('_.value==="login"?'), "register", t.includes('_.value==="register"?'), "forgot", t.includes('_.value==="forgot"?'));

// Ze2 not colliding as const
console.log("function Ze2", t.includes("function Ze2()"));
console.log("banner Ze still", t.includes('Ze={class:"banner-top-content"}'));

// Captcha row: input before img
const cap = block.indexOf('prop:"imgCode"');
const slice = block.slice(cap, cap + 350);
console.log("captcha order input-first", slice.indexOf("captcha-input-flex") < slice.indexOf("captcha-img-btn"));
