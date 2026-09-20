import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
const t = fs.readFileSync(path, "utf8");

execSync(`node --check "${path}"`, { stdio: "inherit" });

const checks = [
  ["sms label", 'label:"短信验证码"'],
  ["no old sms label", !t.includes('label:"手机验证码"')],
  ["agree box", "reg-agree-box"],
  ["agree text", "已同意"],
  ["privacy", "隐私协议"],
  ["user proto", "用户协议"],
  ["hint", "请仔细阅读协议内容，勾选后方可完成注册"],
  ["agree gate", "if(!pe.value)"],
  ["submit class", "reg-submit-btn"],
  ["login row", "已有账号？"],
  // captcha kept
  ["captcha label", 'label:"图形验证码"'],
  ["captcha ph", 'placeholder:"请输入图形验证码"'],
  ["captcha input class", "captcha-input"],
];

for (const [name, v] of checks) {
  const ok = typeof v === "boolean" ? v : t.includes(v);
  console.log(ok ? "OK" : "MISS", name);
}

const i = t.indexOf("reg-agree-box");
console.log("\nagree snippet:\n", t.slice(i - 20, i + 420));
