import fs from "fs";
import { execSync } from "child_process";

const p =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let r = fs.readFileSync(p, "utf8");

const from =
  '$=async(u,e,l)=>{if(!e)return l(new Error("请输入账号名"));try{const n=await J(e);if(n&&n.data===!1)return l(new Error("该账号名已被注册，可直接登录！"));l()}catch{l()}},D=async(u,e,l)=>{if(!e)return l(new Error("请输入手机号码！"));if(!/^1[3-9]\\d{9}$/.test(e))return l(new Error("请输入有效的11位手机号码！"));try{const n=await K(e);if(n&&n.data===!1)return l(new Error("该手机号码已被注册，可直接登录！"));l()}catch{l()}}';

const to =
  '$=async(u,e,l)=>{if(!e)return l(new Error("请输入账号名"));l()},D=async(u,e,l)=>{if(!e)return l(new Error("请输入手机号码！"));if(!/^1[3-9]\\d{9}$/.test(e))return l(new Error("请输入有效的11位手机号码！"));l()}';

if (!r.includes(from)) {
  console.error("MISSING validators");
  process.exit(1);
}
r = r.split(from).join(to);
fs.writeFileSync(p, r);
execSync(`node --check "${p}"`, { stdio: "inherit" });
console.log("OK uniqueness validators mocked");
