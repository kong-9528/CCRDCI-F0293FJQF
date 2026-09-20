import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 140)}`);
  js = js.split(from).join(to);
  console.log("OK", label);
}

// SMS label match screenshot
mustReplace('label:"手机验证码"', 'label:"短信验证码"', "sms label");

// Agree state
if (!js.includes("const pe=p(!1)")) {
  mustReplace(
    'const ge=p(!1),he=p("login");',
    'const ge=p(!1),he=p("login"),pe=p(!1);',
    "agree ref",
  );
}

// Gate submit on agreement
mustReplace(
  "function S(){var u;if(!V.value&&!a.value.smsCode){m.warning(\"请输入短信验证码！\");return}",
  "function S(){var u;if(!pe.value){m.warning(\"请仔细阅读协议内容，勾选后方可完成注册\");return}if(!V.value&&!a.value.smsCode){m.warning(\"请输入短信验证码！\");return}",
  "agree gate",
);

// Soften SMS get-code button (gray style via class; keep plain)
mustReplace(
  'r(l,{type:"primary",plain:"",class:"sms-btn margin-left-12"',
  'r(l,{plain:"",class:"sms-btn margin-left-12"',
  "sms btn type",
);

// Insert agreement block BEFORE submit button
const agreeBlock =
  'o("div",{class:"reg-agree-box"},[o("label",{class:"reg-agree-row"},[o("input",{type:"checkbox",class:"reg-agree-check",checked:pe.value,onChange:e[22]||(e[22]=t=>pe.value=t.target.checked)}),o("span",{class:"reg-agree-text"},[C("已同意 "),o("a",{class:"reg-agree-link",href:"javascript:;",onClick:e[23]||(e[23]=t=>t.preventDefault())},"隐私协议"),C("、"),o("a",{class:"reg-agree-link",href:"javascript:;",onClick:e[24]||(e[24]=t=>t.preventDefault())},"用户协议")])]),o("p",{class:"reg-agree-hint"},"请仔细阅读协议内容，勾选后方可完成注册")]),';

if (!js.includes("reg-agree-box")) {
  mustReplace(
    'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg margin-top-24",loading:_.value,onClick:S}',
    agreeBlock +
      'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg reg-submit-btn",loading:_.value,onClick:S}',
    "agree + submit class",
  );
} else {
  console.log("skip agree (already)");
}

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK", js.length);
