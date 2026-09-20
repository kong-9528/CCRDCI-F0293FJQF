import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// find reset / forgot related state
for (const k of [
  "is-reset",
  "reset-mode",
  "forgot",
  "resetPwd",
  "resetStep",
  "step",
  "mobileForm",
  "newPassword",
  "confirmPassword",
  "通过绑定",
  "记起密码",
  "获取验证码",
]) {
  const n = t.split(k).length - 1;
  if (n) console.log(k, "x" + n);
}

// dump around 找回密码 title area and mode switches
let idx = 0;
let c = 0;
while ((idx = t.indexOf("找回密码", idx)) >= 0 && c < 5) {
  console.log("\n---", c, "---\n", t.slice(idx - 100, idx + 200));
  idx += 4;
  c++;
}

const i = t.indexOf("密码重置成功");
console.log("\nsuccess flow:\n", t.slice(i - 200, i + 120));
