import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) {
    throw new Error(`MISSING: ${label}\n${from.slice(0, 180)}`);
  }
  const n = js.split(from).length - 1;
  js = js.split(from).join(to);
  console.log("OK", label, "x" + n);
}

// ========== 1) Replace setup: model rules + handlers ==========
// From i=c({...forgot model...}) through end of me(), keep qe() for mobile login SMS

const setupFrom = `i=c({phoneNumber:"",imgCode:"",smsCode:"",uuid:"",newPassword:"",confirmPassword:""}),ft=c(1),k=c(0);let L=null;const Se=H(()=>ft.value===1?{phoneNumber:[{required:!0,message:"请输入绑定的 11 位手机号码",trigger:"blur"},{pattern:/^1[3-9]\\d{9}$/,message:"请输入正确的 11 位手机号码格式",trigger:"blur"}],imgCode:[{required:!0,message:"请输入图形验证码！",trigger:"blur"}],smsCode:[{required:!0,message:"请输入短信验证码！",trigger:"blur"},{pattern:/^\\d{6}$/,message:"请输入有效短信验证码！",trigger:"blur"}]}:{newPassword:[{required:!0,message:"请输入新密码",trigger:"blur"}].concat(ae.value||[]),confirmPassword:[{required:!0,message:"请输入确认新密码",trigger:"blur"},{validator:oe(()=>i.value.newPassword),trigger:"blur"}]});`;

// Find the block from i=c through me() end - replace rules + functions cleanly
if (!js.includes(setupFrom)) {
  // try to locate current Se definition
  const i = js.indexOf('i=c({phoneNumber:""');
  console.log("setup slice:\n", js.slice(i, i + 500));
  throw new Error("setupFrom not found");
}

const setupTo = `i=c({phoneNumber:"",imgCode:"",smsCode:"",uuid:"",newPassword:"",confirmPassword:""}),ft=c(1),k=c(0);let L=null;const Se1={phoneNumber:[{required:!0,message:"请输入绑定的 11 位手机号码",trigger:"blur"},{pattern:/^1[3-9]\\d{9}$/,message:"请输入正确的 11 位手机号码格式",trigger:"blur"}],imgCode:[{required:!0,message:"请输入图形验证码！",trigger:"blur"}],smsCode:[{required:!0,message:"请输入短信验证码！",trigger:"blur"},{pattern:/^\\d{6}$/,message:"请输入有效短信验证码！",trigger:"blur"}]},Se2=H(()=>({newPassword:[{required:!0,message:"请输入新密码",trigger:"blur"}].concat(ae.value||[]),confirmPassword:[{required:!0,message:"请输入确认新密码",trigger:"blur"},{validator:oe(()=>i.value.newPassword),trigger:"blur"}]}));`;

mustReplace(setupFrom, setupTo, "Se1/Se2 rules");

// Replace handlers: Ue, Pe, me → clean nextStep / resetPwd / back
mustReplace(
  `function Ue(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}function Pe(){if(k.value>0){g.warning("获取验证码过于频繁，请稍后再试！");return}if(!i.value.phoneNumber||!/^1[3-9]\\d{9}$/.test(i.value.phoneNumber)){g.warning("请输入有效的 11 位手机号码！");return}if(!i.value.imgCode){g.warning("请输入图形验证码！");return}g.success("短信验证码已发送，请注意查收（演示）"),k.value=60,L&&clearInterval(L),L=setInterval(()=>{k.value--,k.value<=0&&clearInterval(L)},1e3)}function me(){if(!W.value)return;W.value.validate(o=>{if(!o){g.warning(ft.value===1?"请完整填写手机号与验证码":"请完整填写并确认新密码");return}if(ft.value===1){ft.value=2,W.value&&W.value.clearValidate&&W.value.clearValidate();return}f.value=!0,setTimeout(()=>{f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""},300)})}`,
  `function Ht(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}function Pe(){if(k.value>0){g.warning("获取验证码过于频繁，请稍后再试！");return}if(!i.value.phoneNumber||!/^1[3-9]\\d{9}$/.test(i.value.phoneNumber)){g.warning("请输入有效的 11 位手机号码！");return}if(!i.value.imgCode){g.warning("请输入图形验证码！");return}g.success("短信验证码已发送，请注意查收（演示）"),k.value=60,L&&clearInterval(L),L=setInterval(()=>{k.value--,k.value<=0&&clearInterval(L)},1e3)}function Ze2(){var o; (o=W.value)==null||o.validate(function(e){if(!e){g.warning("请完整填写手机号与验证码");return}ft.value=2})}function me(){var o;(o=ue.value)==null||o.validate(function(e){if(!e){g.warning("请完整填写并确认新密码");return}f.value=!0,setTimeout(function(){f.value=!1,g.success("密码重置成功！请使用新密码登录"),q("login"),w.value.username=i.value.phoneNumber,w.value.password=""},300)})}`,
  "handlers next/reset/back",
);

// ========== 2) Replace entire forgot UI with two independent forms ==========
const uiStart = js.indexOf('_.value==="forgot"?(v(),h(j,{key:2}');
const uiEnd =
  js.indexOf('去登录")])],64)):G("",!0)', uiStart) +
  '去登录")])],64)):G("",!0)'.length;
if (uiStart < 0 || uiEnd < uiStart) throw new Error("forgot UI bounds");

const newUi = `_.value==="forgot"?(v(),h(j,{key:"forgot-root"},[s("div",Ds,[s("div",Is,[s("div",Fs,[l(t,{class:"reg-badge-icon"},{default:a(()=>[l(u(S))]),_:1})]),e[80]||(e[80]=s("h2",{class:"reg-title"},"找回密码",-1)),s("p",{class:"reg-subtitle"},le(ft.value===1?"验证绑定手机号以继续重置密码":"设置您的新登录密码"),1)]),ft.value===1?(v(),M(K,{key:"forgot-verify",ref_key:"forgotVerifyRef",ref:W,model:i.value,rules:Se1,class:"pure-form",size:"large",onSubmit:A(Ze2,["prevent"])},{default:a(()=>[s("div",Ns,[e[81]||(e[81]=s("label",{class:"form-label"},[m("手机号码 "),s("span",{class:"required-star"},"*")],-1)),l(p,{prop:"phoneNumber"},{default:a(()=>[l(d,{modelValue:i.value.phoneNumber,"onUpdate:modelValue":e[82]||(e[82]=r=>i.value.phoneNumber=r),placeholder:"请输入绑定的 11 位手机号码",maxlength:"11",clearable:""},{prefix:a(()=>[l(t,{class:"icon-gray"},{default:a(()=>[l(u(se))]),_:1})]),_:1},8,["modelValue"])]),_:1})]),s("div",zs,[e[83]||(e[83]=s("label",{class:"form-label"},[m("图形验证码 "),s("span",{class:"required-star"},"*")],-1)),l(p,{prop:"imgCode"},{default:a(()=>[s("div",Ms,[l(d,{modelValue:i.value.imgCode,"onUpdate:modelValue":e[84]||(e[84]=r=>i.value.imgCode=r),placeholder:"请输入图形验证码",class:"captcha-input-flex"},{prefix:a(()=>[l(t,{class:"icon-gray"},{default:a(()=>[l(u(S))]),_:1})]),_:1},8,["modelValue"]),s("img",{src:P.value,class:"captcha-img-btn",alt:"验证码",title:"点击刷新",onClick:y},null,8,Bs)])]),_:1})]),s("div",Es,[e[85]||(e[85]=s("label",{class:"form-label"},[m("短信验证码 "),s("span",{class:"required-star"},"*")],-1)),l(p,{prop:"smsCode"},{default:a(()=>[s("div",Ts,[l(d,{modelValue:i.value.smsCode,"onUpdate:modelValue":e[86]||(e[86]=r=>i.value.smsCode=r),placeholder:"请输入短信验证码",maxlength:"6",class:"captcha-input-flex",onInput:e[87]||(e[87]=r=>i.value.smsCode=r.replace(/\\D/g,""))},{prefix:a(()=>[l(t,{class:"icon-gray"},{default:a(()=>[l(u(S))]),_:1})]),_:1},8,["modelValue"]),l(x,{class:"sms-send-btn",nativeType:"button",disabled:k.value>0,onClick:Pe},{default:a(()=>[m(le(k.value>0?\`\${k.value}s\`:"获取验证码"),1)]),_:1},8,["disabled"])])]),_:1})]),l(x,{type:"primary",class:"login-main-btn",nativeType:"button",disabled:!(String(i.value.phoneNumber||"").length>=11&&String(i.value.imgCode||"").length&&String(i.value.smsCode||"").length>=6),onClick:Ze2},{default:a(()=>[...e[88]||(e[88]=[m("下一步",-1)])]),_:1},8,["disabled"])]),_:2},8,["model","rules"])):(v(),M(K,{key:"forgot-setpwd",ref_key:"forgotPwdRef",ref:ue,model:i.value,rules:Se2.value,class:"pure-form",size:"large",onSubmit:A(me,["prevent"])},{default:a(()=>[s("div",Ls,[e[89]||(e[89]=s("label",{class:"form-label"},[m("新密码 "),s("span",{class:"required-star"},"*")],-1)),l(p,{prop:"newPassword"},{default:a(()=>[l(d,{modelValue:i.value.newPassword,"onUpdate:modelValue":e[90]||(e[90]=r=>i.value.newPassword=r),type:"password","show-password":"",maxlength:"12",placeholder:"8-12位，含数字/大小写字母/特殊字符至少3种"},{prefix:a(()=>[l(t,{class:"icon-gray"},{default:a(()=>[l(u(B))]),_:1})]),_:1},8,["modelValue"])]),_:1})]),s("div",Xs,[e[91]||(e[91]=s("label",{class:"form-label"},[m("确认新密码 "),s("span",{class:"required-star"},"*")],-1)),l(p,{prop:"confirmPassword"},{default:a(()=>[l(d,{modelValue:i.value.confirmPassword,"onUpdate:modelValue":e[92]||(e[92]=r=>i.value.confirmPassword=r),type:"password","show-password":"",maxlength:"12",placeholder:"请再次输入新密码"},{prefix:a(()=>[l(t,{class:"icon-gray"},{default:a(()=>[l(u(B))]),_:1})]),_:1},8,["modelValue"])]),_:1})]),l(x,{type:"primary",class:"login-main-btn",nativeType:"button",loading:f.value,disabled:!(String(i.value.newPassword||"").length&&String(i.value.confirmPassword||"").length),onClick:me},{default:a(()=>[...e[93]||(e[93]=[m("重置密码",-1)])]),_:1},8,["loading","disabled"])]),_:2},8,["model","rules"])),ft.value===2?(v(),h("div",{key:"forgot-back",class:"forgot-step-actions"},[s("span",{class:"forgot-back-link",onClick:e[96]||(e[96]=r=>Ht(r))},"上一步")])):G("",!0),s("div",Ks,[e[94]||(e[94]=s("span",null,"记起密码了？",-1)),s("span",{class:"go-register-link",onClick:e[95]||(e[95]=r=>q("login"))},"去登录")])])],64)):G("",!0)`;

js = js.slice(0, uiStart) + newUi + js.slice(uiEnd);
console.log("OK forgot UI rebuilt", { uiStart, oldLen: uiEnd - uiStart, newLen: newUi.length });

fs.writeFileSync(path, js, "utf8");
try {
  execSync(`node --check "${path}"`, { stdio: "pipe" });
  console.log("SYNTAX OK", js.length);
} catch (e) {
  console.error("SYNTAX FAIL");
  console.error(String(e.stderr || e).slice(0, 1000));
  process.exit(1);
}

// Verify checklist
const t = fs.readFileSync(path, "utf8");
const checks = [
  ["Se1", "const Se1={phoneNumber"],
  ["Se2", "Se2=H(()=>({newPassword"],
  ["Ze2 next", "function Ze2()"],
  ["me reset uses ue", "o=ue.value"],
  ["verify form", 'key:"forgot-verify"'],
  ["pwd form", 'key:"forgot-setpwd"'],
  ["ref W step1", "forgotVerifyRef"],
  ["ref ue step2", "forgotPwdRef"],
  ["下一步", 'm("下一步"'],
  ["重置密码", 'm("重置密码"'],
  ["上一步 outside", 'key:"forgot-back"'],
  ["captcha input then img", 'class:"captcha-input-flex"},{prefix'],
  ["no old Se=H step ternary", !t.includes("Se=H(()=>ft.value===1")],
  ["SMS mock", "演示"],
  ["success mock", "密码重置成功"],
];
for (const [n, v] of checks) {
  console.log((typeof v === "boolean" ? v : t.includes(v)) ? "OK" : "MISS", n);
}
