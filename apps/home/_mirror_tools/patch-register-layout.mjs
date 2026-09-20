import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";

let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 140)}`);
  const n = js.split(from).length - 1;
  if (n !== 1) console.warn("WARN count", n, label);
  js = js.split(from).join(to);
  console.log("OK", label);
}

// 1) Import portal header + auth dialog
mustReplace(
  'import{u as Y}from"./passwordRule-CK9dJiC2.js";',
  'import{u as Y}from"./passwordRule-CK9dJiC2.js";import{A as ye}from"./index-BiQimQRe.js";import{P as be}from"./index-_fJendd7.js";',
  "imports",
);

// 2) Auth modal state + openAuth (register already on this page)
mustReplace(
  "const b=B();F();",
  'const b=B();F();const ge=p(!1),he=p("login");function me(u="login"){u==="register"||(he.value=u,ge.value=!0)}',
  "auth state",
);

// 3) Screenshot placeholders / labels
mustReplace(
  'placeholder:"8-12位，需含数字/大小写字母/特殊字符至少3种"',
  'placeholder:"请输入8-12位密码"',
  "pwd placeholder",
);
mustReplace('label:"手机号码"', 'label:"手机号"', "phone label");
mustReplace(
  'placeholder:"请输入 11 位手机号码"',
  'placeholder:"请输入手机号"',
  "phone placeholder",
);

// 4) Captcha row: input left, image right (match screenshot)
mustReplace(
  'o("div",le,[o("img",{src:y.value,class:"cursor-pointer",style:{height:"38px",width:"110px",border:"1px solid #dcdfe6","border-radius":"6px","box-sizing":"border-box","object-fit":"fill","flex-shrink":"0"},alt:"验证码",title:"点击刷新",onClick:x},null,8,se),r(f,{modelValue:a.value.code,"onUpdate:modelValue":e[5]||(e[5]=t=>a.value.code=t),placeholder:"请输入图形验证码",maxlength:"6",clearable:""},null,8,["modelValue"])])',
  'o("div",le,[r(f,{modelValue:a.value.code,"onUpdate:modelValue":e[5]||(e[5]=t=>a.value.code=t),placeholder:"请输入图形验证码",maxlength:"6",clearable:"",class:"captcha-input"},null,8,["modelValue"]),o("img",{src:y.value,class:"cursor-pointer captcha-img",style:{height:"40px",width:"120px",border:"1px solid #dcdfe6","border-radius":"6px","box-sizing":"border-box","object-fit":"fill","flex-shrink":"0"},alt:"验证码",title:"点击刷新",onClick:x},null,8,se)])',
  "captcha order",
);

// 5) Replace old header + banner with PortalHeader
const oldTop =
  'o("header",ee,[o("div",{class:"brand-logo-wrap flex-row align-center cursor-pointer",onClick:e[0]||(e[0]=t=>d(b).push("/"))},[...e[10]||(e[10]=[o("span",{class:"brand-title"},"DCI 技术服务中心",-1),o("span",{class:"brand-sub"},"® 官方门户注册",-1)])]),o("div",ae,[r(l,{link:"",type:"primary",onClick:e[1]||(e[1]=t=>d(b).push("/"))},{default:s(()=>[...e[11]||(e[11]=[C("返回首页",-1)])]),_:1})])]),e[15]||(e[15]=o("div",{class:"dci-portal-banner flex-col align-center justify-center"},[o("span",{class:"banner-title"},""),o("span",{class:"banner-desc"},"")],-1)),';

const newTop = "r(be,{onOpenAuth:me}),";

mustReplace(oldTop, newTop, "portal header");

// 6) Append Auth dialog before closing root children; keep footer
mustReplace(
  'e[16]||(e[16]=o("footer",{class:"dci-portal-footer text-center"},[o("span",null,"© 2026 中国版权保护中心 京ICP备09080213号-2")],-1))])}}})',
  'e[16]||(e[16]=o("footer",{class:"dci-portal-footer text-center"},[o("span",null,"© 2026 中国版权保护中心 京ICP备09080213号-2")],-1)),r(ye,{modelValue:ge.value,"onUpdate:modelValue":e[21]||(e[21]=t=>ge.value=t),"initial-mode":he.value},null,8,["modelValue","initial-mode"])])}}})',
  "auth dialog",
);

fs.writeFileSync(path, js, "utf8");
try {
  execSync(`node --check "${path}"`, { stdio: "pipe" });
  console.log("SYNTAX OK", js.length);
} catch (e) {
  console.error("SYNTAX FAIL");
  console.error(String(e.stderr || e));
  process.exit(1);
}
