import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 160)}`);
  js = js.split(from).join(to);
  console.log("OK", label);
}

// 1) Explicit back handler — avoid e[N] cache collision with yidun slider
mustReplace(
  "function ie(){q(\"forgot\")}",
  'function ie(){q("forgot")}function Ue(){ft.value=1}',
  "Ue back fn",
);

// 2) Fix me(): toast on validate fail; clearValidate when entering step2
mustReplace(
  'function me(){W.value&&W.value.validate(o=>{if(!o)return;if(ft.value===1){ft.value=2;return}f.value=!0,setTimeout(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""},300)})}',
  'function me(){if(!W.value)return;W.value.validate(o=>{if(!o){g.warning(ft.value===1?"请完整填写手机号与验证码":"请完整填写并确认新密码");return}if(ft.value===1){ft.value=2,W.value&&W.value.clearValidate&&W.value.clearValidate();return}f.value=!0,setTimeout(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""},300)})}',
  "me robust",
);

// 3) 上一步: use Ue directly (not e[60])
mustReplace(
  's("span",{class:"forgot-back-link",onClick:e[60]||(e[60]=r=>ft.value=1)},"上一步")',
  's("span",{class:"forgot-back-link",onClick:Ue},"上一步")',
  "back onClick Ue",
);

// 4) 重置密码 label: use unused e[63] instead of colliding e[61]
mustReplace(
  '...e[61]||(e[61]=[m("重置密码",-1)])',
  '...e[63]||(e[63]=[m("重置密码",-1)])',
  "reset label e[63]",
);

// 5) Step2 disabled: also require passwords non-empty after trim; bind native-type button
mustReplace(
  'l(x,{type:"primary",class:"login-main-btn",loading:f.value,disabled:!(i.value.newPassword&&i.value.confirmPassword),onClick:me},{default:a(()=>[...e[63]||(e[63]=[m("重置密码",-1)])]),_:1},8,["loading","disabled"])',
  'l(x,{type:"primary",class:"login-main-btn",nativeType:"button",loading:f.value,disabled:!(String(i.value.newPassword||"").length&&String(i.value.confirmPassword||"").length),onClick:me},{default:a(()=>[...e[63]||(e[63]=[m("重置密码",-1)])]),_:1},8,["loading","disabled"])',
  "reset btn disabled+nativeType",
);

// 6) Step1 下一步: nativeType button + clearer disabled
mustReplace(
  'l(x,{type:"primary",class:"login-main-btn",disabled:!(i.value.phoneNumber&&i.value.imgCode&&i.value.smsCode),onClick:me},{default:a(()=>[...e[58]||(e[58]=[m("下一步",-1)])]),_:1},8,["disabled"])',
  'l(x,{type:"primary",class:"login-main-btn",nativeType:"button",disabled:!(String(i.value.phoneNumber||"").length>=11&&String(i.value.imgCode||"").length&&String(i.value.smsCode||"").length>=6),onClick:me},{default:a(()=>[...e[58]||(e[58]=[m("下一步",-1)])]),_:1},8,["disabled"])',
  "next btn disabled+nativeType",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK", js.length);

// verify no e[60]/e[61] in forgot back/reset
const t = fs.readFileSync(path, "utf8");
console.log("back uses Ue", t.includes('onClick:Ue},"上一步"'));
console.log("reset uses e[63]", t.includes('e[63]=[m("重置密码"'));
console.log("still e[60] on back", t.includes("forgot-back-link\",onClick:e[60]"));
