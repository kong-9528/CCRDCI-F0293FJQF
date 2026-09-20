import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 180)}`);
  const n = js.split(from).length - 1;
  js = js.split(from).join(to);
  console.log("OK", label, "x" + n);
}

// 1) forgot step ref
mustReplace(
  'i=c({phoneNumber:"",imgCode:"",smsCode:"",uuid:"",newPassword:"",confirmPassword:""}),k=c(0);',
  'i=c({phoneNumber:"",imgCode:"",smsCode:"",uuid:"",newPassword:"",confirmPassword:""}),ft=c(1),k=c(0);',
  "forgotStep ref",
);

// 2) step-aware rules
mustReplace(
  'Se=H(()=>({phoneNumber:[{required:!0,message:"请输入绑定的 11 位手机号码",trigger:"blur"},{pattern:/^1[3-9]\\d{9}$/,message:"请输入正确的 11 位手机号码格式",trigger:"blur"}],imgCode:[{required:!0,message:"请输入图形验证码！",trigger:"blur"}],smsCode:[{required:!0,message:"请输入短信验证码！",trigger:"blur"},{pattern:/^\\d{6}$/,message:"请输入有效短信验证码！",trigger:"blur"}],newPassword:ae.value,confirmPassword:[{validator:oe(()=>i.value.newPassword),trigger:"blur"}]}));',
  'Se=H(()=>ft.value===1?{phoneNumber:[{required:!0,message:"请输入绑定的 11 位手机号码",trigger:"blur"},{pattern:/^1[3-9]\\d{9}$/,message:"请输入正确的 11 位手机号码格式",trigger:"blur"}],imgCode:[{required:!0,message:"请输入图形验证码！",trigger:"blur"}],smsCode:[{required:!0,message:"请输入短信验证码！",trigger:"blur"},{pattern:/^\\d{6}$/,message:"请输入有效短信验证码！",trigger:"blur"}]}:{newPassword:[{required:!0,message:"请输入新密码",trigger:"blur"}].concat(ae.value||[]),confirmPassword:[{required:!0,message:"请输入确认新密码",trigger:"blur"},{validator:oe(()=>i.value.newPassword),trigger:"blur"}]});',
  "step rules",
);

// 3) mode switch: reset step; open forgot at step 1
mustReplace(
  "function q(o){_.value=o,y()}",
  'function q(o){_.value=o,o==="forgot"?ft.value=1:ft.value=1,y()}',
  "q reset step",
);
// simplify q - always reset ft when switching modes is fine
mustReplace(
  'function q(o){_.value=o,o==="forgot"?ft.value=1:ft.value=1,y()}',
  "function q(o){_.value=o,ft.value=1,y()}",
  "q simplify",
);

// 4) two-step submit
mustReplace(
  'function me(){W.value&&W.value.validate(o=>{o&&(f.value=!0,Qe({phoneNumber:i.value.phoneNumber,smsCode:i.value.smsCode,newPassword:i.value.newPassword}).then(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""}).catch(()=>{f.value=!1}))})}',
  'function me(){W.value&&W.value.validate(o=>{if(!o)return;if(ft.value===1){ft.value=2;return}f.value=!0,Qe({phoneNumber:i.value.phoneNumber,smsCode:i.value.smsCode,newPassword:i.value.newPassword}).then(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""}).catch(()=>{f.value=!1})})}',
  "me two-step",
);

// 5) card body class: is-forgot-mode
mustReplace(
  '{"is-register-mode":_.value==="register","is-login-mode":_.value==="login"}',
  '{"is-register-mode":_.value==="register","is-login-mode":_.value==="login","is-forgot-mode":_.value==="forgot"}',
  "forgot mode class",
);

// 6) Dynamic subtitle
mustReplace(
  'e[51]||(e[51]=s("h2",{class:"reg-title"},"找回密码",-1)),e[52]||(e[52]=s("p",{class:"reg-subtitle"},"通过绑定手机号码重置您的账号密码",-1))',
  'e[51]||(e[51]=s("h2",{class:"reg-title"},"找回密码",-1)),s("p",{class:"reg-subtitle"},le(ft.value===1?"验证绑定手机号以继续重置密码":"设置您的新登录密码"),1)',
  "dynamic subtitle",
);

// 7) Split form fields into two steps
// Capture from first form-group (phone) through submit button
const formStart =
  's("div",Ns,[e[53]||(e[53]=s("label",{class:"form-label"},[m("手机号码 "),s("span",{class:"required-star"},"*")],-1))';
const formStartIdx = js.indexOf(formStart);
if (formStartIdx < 0) throw new Error("form start missing");

const btnMarker =
  'l(x,{type:"primary",class:"login-main-btn",loading:f.value,onClick:me},{default:a(()=>[...e[58]||(e[58]=[m(" 重 置 密 码 ",-1)])]),_:1},8,["loading"])';
const btnIdx = js.indexOf(btnMarker, formStartIdx);
if (btnIdx < 0) throw new Error("submit btn missing");
const formEndIdx = btnIdx + btnMarker.length;

const step1Fields = js.slice(
  formStartIdx,
  js.indexOf('s("div",Ls,[e[56]', formStartIdx),
);
const step2Fields = js.slice(
  js.indexOf('s("div",Ls,[e[56]', formStartIdx),
  btnIdx,
);

if (!step1Fields.includes("手机号码") || !step2Fields.includes("新密码")) {
  throw new Error("failed to split steps");
}

const step1Btn =
  'l(x,{type:"primary",class:"login-main-btn",disabled:!(i.value.phoneNumber&&i.value.imgCode&&i.value.smsCode),onClick:me},{default:a(()=>[...e[58]||(e[58]=[m("下一步",-1)])]),_:1},8,["disabled"])';
const step2Btn =
  's("div",{class:"forgot-step-actions"},[s("span",{class:"forgot-back-link",onClick:e[60]||(e[60]=r=>ft.value=1)},"上一步"),l(x,{type:"primary",class:"login-main-btn",loading:f.value,disabled:!(i.value.newPassword&&i.value.confirmPassword),onClick:me},{default:a(()=>[...e[61]||(e[61]=[m("重置密码",-1)])]),_:1},8,["loading","disabled"])])';

const newFormBody =
  `ft.value===1?(v(),h(j,{key:"forgot-step1"},[${step1Fields}${step1Btn}])):(v(),h(j,{key:"forgot-step2"},[${step2Fields}${step2Btn}]))`;

js = js.slice(0, formStartIdx) + newFormBody + js.slice(formEndIdx);
console.log("OK form two-step UI");

fs.writeFileSync(path, js, "utf8");
try {
  execSync(`node --check "${path}"`, { stdio: "pipe" });
  console.log("SYNTAX OK", js.length);
} catch (e) {
  console.error("SYNTAX FAIL");
  console.error(String(e.stderr || e).slice(0, 800));
  process.exit(1);
}
