import fs from "fs";

const js = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

const checks = [
  ["portal header import", 'from"./index-_fJendd7.js"'],
  ["auth import", 'from"./index-BiQimQRe.js"'],
  ["onOpenAuth", "onOpenAuth:me"],
  ["auth dialog", "r(ye,{modelValue"],
  ["no render old header", !js.includes('o("header",ee')],
  ["pwd ph", 'placeholder:"请输入8-12位密码"'],
  ["phone label", 'label:"手机号"'],
  ["phone ph", 'placeholder:"请输入手机号"'],
  ["captcha input class", 'class:"captcha-input"'],
  ["title", "账号注册"],
];

for (const [label, v] of checks) {
  const ok = typeof v === "boolean" ? v : js.includes(v);
  console.log(ok ? "OK" : "MISS", label);
}

const css = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/overrides.css",
  "utf8",
);
for (const k of [
  "PingFangSC-Regular",
  "#eef1f6",
  "align-items: stretch",
  "portal-header-wrapper",
  "index--ISO3lnV.css",
]) {
  console.log(css.includes(k) ? "OK css" : "MISS css", k);
}
