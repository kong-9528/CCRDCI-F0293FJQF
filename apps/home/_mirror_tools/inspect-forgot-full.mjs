import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// Find forgot form section
const markers = [
  "forgotFormRef",
  "reg-title",
  "找回密码",
  "通过绑定",
  "phoneNumber",
  "smsCode",
  "newPassword",
  "confirmPassword",
  "重置密码",
  "记起密码",
  "去登录",
  "function me()",
  "function ie()",
  "Se.value",
  "i.value",
  "q(\"login\")",
  "is-forgot",
  "forgot",
];

for (const k of markers) {
  const n = t.split(k).length - 1;
  console.log(k, "x" + n, "first", t.indexOf(k));
}

const start = t.indexOf('h2",{class:"reg-title"},"找回密码"');
console.log("\n==== FORGOT UI BLOCK ====\n");
console.log(t.slice(start - 200, start + 2500));
