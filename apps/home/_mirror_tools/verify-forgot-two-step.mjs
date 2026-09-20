import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });

const checks = [
  ["ft ref", "ft=c(1)"],
  ["step rules", "ft.value===1?{phoneNumber"],
  ["me step", "ft.value===1){ft.value=2"],
  ["forgot class", "is-forgot-mode"],
  ["step1 ui", 'key:"forgot-step1"'],
  ["step2 ui", 'key:"forgot-step2"'],
  ["next btn", 'm("下一步"'],
  ["reset btn", 'm("重置密码"'],
  ["back link", "上一步"],
  ["dyn sub", "验证绑定手机号以继续重置密码"],
  ["step2 sub", "设置您的新登录密码"],
];
for (const [n, v] of checks) console.log(t.includes(v) ? "OK" : "MISS", n);

const i = t.indexOf('key:"forgot-step1"');
console.log("\nstep1 snippet:\n", t.slice(i, i + 200));
const j = t.indexOf('key:"forgot-step2"');
console.log("\nstep2 snippet:\n", t.slice(j, j + 200));
const k = t.indexOf("function me()");
console.log("\nme:\n", t.slice(k, k + 320));
