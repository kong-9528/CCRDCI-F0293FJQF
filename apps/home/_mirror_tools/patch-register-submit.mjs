import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 160)}`);
  js = js.split(from).join(to);
  console.log("OK", label);
}

// 1) All fields required (password + confirmPassword show required + asterisk)
mustReplace(
  'password:k.value,confirmPassword:[{validator:I(()=>a.value.password),trigger:"blur"}]',
  'password:[{required:!0,message:"请输入密码",trigger:"blur"}].concat(k.value||[]),confirmPassword:[{required:!0,message:"请输入确认密码",trigger:"blur"},{validator:I(()=>a.value.password),trigger:"blur"}]',
  "required rules",
);

// 2) Computed: can submit when agree + all fields filled
if (!js.includes("const fe=N(()=>")) {
  mustReplace(
    "E=N(()=>({",
    'fe=N(()=>!!(pe.value&&a.value.username&&a.value.password&&a.value.confirmPassword&&a.value.phonenumber&&a.value.code&&a.value.smsCode)),E=N(()=>({',
    "canSubmit computed",
  );
}

// 3) Bind disabled on submit button
mustReplace(
  'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg reg-submit-btn",loading:_.value,onClick:S},{default:s(()=>[...e[13]||(e[13]=[C("注册",-1)])]),_:1},8,["loading"])',
  'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg reg-submit-btn",loading:_.value,disabled:!fe.value,onClick:S},{default:s(()=>[...e[13]||(e[13]=[C("注册",-1)])]),_:1},8,["loading","disabled"])',
  "submit disabled bind",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK", js.length);
