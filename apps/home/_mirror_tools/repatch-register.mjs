import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let js = fs.readFileSync(path, "utf8");

// Ensure base path rewrite
js = js.replaceAll("/dci-manage-reg/", "/");

function mustReplace(from, to, label) {
  if (!js.includes(from)) {
    throw new Error(`MISSING: ${label}\n---\n${from.slice(0, 120)}`);
  }
  js = js.split(from).join(to);
  console.log("OK", label);
}

// ---- Copy: screenshot only ----
mustReplace('"用户极简注册"', '"账号注册"', "title");
mustReplace(
  '"填报以下账号密码，即刻体验 DCI 在线查验与控制台服务"',
  '"填写以下信息完成账号注册"',
  "subtitle",
);
mustReplace('label:"设置密码"', 'label:"密码"', "password label");
mustReplace(
  'placeholder:"请输入手机号码"',
  'placeholder:"请输入 11 位手机号码"',
  "phone placeholder",
);
mustReplace(
  'C(" 立即注册并自动登录控制台 ",-1)',
  'C("注册",-1)',
  "submit btn",
);
mustReplace(
  '"注册成功！已为您重定向至登录页，请登录"',
  '"注册成功"',
  "success toast",
);

// Hide banner text by emptying (banner hidden via CSS too)
mustReplace('"DCI 账号极简注册"', '""', "banner title empty");
mustReplace(
  '"只需 3 秒完成注册，成功后自动为您登录控制台"',
  '""',
  "banner desc empty",
);

// password placeholder should already be exact; verify
if (!js.includes("8-12位，需含数字/大小写字母/特殊字符至少3种")) {
  const m = js.match(/placeholder:"8-12[^"]*"/);
  if (!m) throw new Error("password placeholder missing");
  js = js.replace(m[0], 'placeholder:"8-12位，需含数字/大小写字母/特殊字符至少3种"');
  console.log("OK pwd placeholder fixed from", m[0]);
} else {
  console.log("OK pwd placeholder already exact");
}

// ---- Reorder fields ----
const formStart = 'default:s(()=>[r(g,{label:"账号名",prop:"username"}';
const formBtn = 'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg margin-top-24"';
const fsIdx = js.indexOf(formStart);
const feIdx = js.indexOf(formBtn);
if (fsIdx < 0 || feIdx < 0) throw new Error(`form markers ${fsIdx} ${feIdx}`);

const prefix = js.slice(0, fsIdx + 'default:s(()=>['.length);
const suffix = js.slice(feIdx);
const formInner = js.slice(fsIdx + 'default:s(()=>['.length, feIdx);

const re = /r\(g,\{label:"[^"]+",prop:"[^"]+"\}/g;
const starts = [];
let m;
while ((m = re.exec(formInner))) starts.push(m.index);
const parts = starts.map((start, i) =>
  formInner.slice(start, i + 1 < starts.length ? starts[i + 1] : formInner.length),
);
const byProp = Object.fromEntries(
  parts.map((p) => [p.match(/prop:"([^"]+)"/)[1], p]),
);
console.log(
  "fields",
  Object.keys(byProp),
);
const order = ["username", "password", "confirmPassword", "phonenumber", "code", "smsCode"];
for (const k of order) {
  if (!byProp[k]) throw new Error(`missing field ${k}`);
}
js = prefix + order.map((k) => byProp[k]).join("") + suffix;
console.log("OK reordered");

// ---- Card head with badge ----
mustReplace(
  'o("div",{class:"card-header-bar margin-bottom-24 text-center"},[o("h2",{class:"text-xl font-bold text-gray-800"},"账号注册"),o("p",{class:"text-sm text-gray-500 margin-top-4"},"填写以下信息完成账号注册")]',
  'o("div",{class:"card-header-bar register-card-head margin-bottom-24 text-center"},[o("div",{class:"reg-badge-box","aria-hidden":"true"}),o("h2",{class:"text-xl font-bold text-gray-800 reg-title"},"账号注册"),o("p",{class:"text-sm text-gray-500 margin-top-4 reg-subtitle"},"填写以下信息完成账号注册")]',
  "card head badge",
);

// ---- Insert 已有账号？去登录 under submit (inside form array) ----
mustReplace(
  'C("注册",-1)])]),_:1},8,["loading"]',
  'C("注册",-1)])]),_:1},8,["loading"]),o("div",{class:"reg-login-row"},[o("span",null,"已有账号？"),o("span",{class:"reg-login-link",onClick:e[20]||(e[20]=t=>d(b).push({path:"/",query:{showLogin:"true"}}))},"去登录")])',
  "login row",
);

// ---- Remove header duplicate「已有账号？去登录」without leaving trailing comma issues ----
// Original: ...返回首页...}),r(l,{type:"primary",plain:"",onClick:...已有账号？去登录...}),_:1})])]),
mustReplace(
  'r(l,{type:"primary",plain:"",onClick:e[2]||(e[2]=t=>d(b).push("/login"))},{default:s(()=>[...e[12]||(e[12]=[C("已有账号？去登录",-1)])]),_:1})',
  "",
  "remove header login link",
);

// ---- Success: no auto-login; go home and open login ----
mustReplace(
  'W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push("/login")})',
  'W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push({path:"/",query:{showLogin:"true"}})})',
  "success navigate",
);

fs.writeFileSync(path, js, "utf8");

// syntax check via Function / acorn-less: node --check
console.log("bytes", fs.statSync(path).size);
