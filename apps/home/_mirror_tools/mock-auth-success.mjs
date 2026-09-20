import fs from "fs";
import { execSync } from "child_process";

const regPath =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
const authPath =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";

let reg = fs.readFileSync(regPath, "utf8");
let auth = fs.readFileSync(authPath, "utf8");

function mustReplace(src, from, to, label) {
  if (!src.includes(from)) throw new Error(`MISSING ${label}\n${from.slice(0, 160)}`);
  src = src.split(from).join(to);
  console.log("OK", label);
  return src;
}

// —— Register: mock submit success (skip W API) ——
reg = mustReplace(
  reg,
  '_.value=!0;const l=new FormData;l.append("username",a.value.username),l.append("phonenumber",a.value.phonenumber),l.append("smsCode",a.value.smsCode),l.append("password",a.value.password),l.append("confirmPassword",a.value.confirmPassword||a.value.password),l.append("userType","1"),l.append("code",a.value.code),l.append("uuid",a.value.uuid),W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push({path:"/",query:{showLogin:"true"}})}).catch(()=>{_.value=!1})',
  '_.value=!0,setTimeout(()=>{_.value=!1,m.success("注册成功"),b.push({path:"/",query:{showLogin:"true"}})},300)',
  "register submit mock",
);

// Mock register SMS send so “获取验证码” works offline
reg = mustReplace(
  reg,
  "v.value=!0,Q(u,a.value.code,a.value.uuid).then(()=>{V.value=!0,v.value=!1,m.success(\"短信验证码已发送，请注意查收\"),i.value=60,w&&clearInterval(w),w=setInterval(()=>{i.value--,i.value<=0&&(clearInterval(w),w=null)},1e3)}).catch(()=>{v.value=!1,x()})",
  'v.value=!0,setTimeout(()=>{V.value=!0,v.value=!1,m.success("短信验证码已发送，请注意查收（演示）"),i.value=60,w&&clearInterval(w),w=setInterval(()=>{i.value--,i.value<=0&&(clearInterval(w),w=null)},1e3)},200)',
  "register SMS mock",
);

// —— Forgot password: mock reset submit ——
auth = mustReplace(
  auth,
  'f.value=!0,Qe({phoneNumber:i.value.phoneNumber,smsCode:i.value.smsCode,newPassword:i.value.newPassword}).then(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""}).catch(()=>{f.value=!1})',
  'f.value=!0,setTimeout(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""},300)',
  "forgot reset mock",
);

// Mock forgot SMS send
auth = mustReplace(
  auth,
  'Je(i.value.phoneNumber).then(()=>{g.success("短信验证码已发送，请注意查收"),k.value=60,L&&clearInterval(L),L=setInterval(()=>{k.value--,k.value<=0&&clearInterval(L)},1e3)}).catch(()=>{y()})',
  'g.success("短信验证码已发送，请注意查收（演示）"),k.value=60,L&&clearInterval(L),L=setInterval(()=>{k.value--,k.value<=0&&clearInterval(L)},1e3)',
  "forgot SMS mock",
);

fs.writeFileSync(regPath, reg, "utf8");
fs.writeFileSync(authPath, auth, "utf8");

execSync(`node --check "${regPath}"`, { stdio: "inherit" });
execSync(`node --check "${authPath}"`, { stdio: "inherit" });
console.log("SYNTAX OK both");
