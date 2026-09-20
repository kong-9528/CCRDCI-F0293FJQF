import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let js = fs.readFileSync(path, "utf8");

// Insert 「已有账号？去登录」 under register button (still inside form)
const btnEnd = 'C("注册",-1)])]),_:1},8,["loading"]';
const insertAfter =
  'C("注册",-1)])]),_:1},8,["loading"]),o("div",{class:"reg-login-row"},[o("span",null,"已有账号？"),o("span",{class:"reg-login-link",onClick:e[20]||(e[20]=t=>d(b).push({path:"/",query:{showLogin:"true"}}))},"去登录")])';

if (!js.includes(btnEnd)) {
  console.log("btn end missing");
} else if (js.includes("reg-login-row")) {
  console.log("login row already present");
} else {
  js = js.replace(btnEnd, insertAfter);
  console.log("inserted login row");
}

// Add badge wrapper class on card header for CSS icon
const oldHead =
  'o("div",{class:"card-header-bar margin-bottom-24 text-center"},[o("h2",{class:"text-xl font-bold text-gray-800"},"账号注册"),o("p",{class:"text-sm text-gray-500 margin-top-4"},"填写以下信息完成账号注册")]';
const newHead =
  'o("div",{class:"card-header-bar register-card-head margin-bottom-24 text-center"},[o("div",{class:"reg-badge-box","aria-hidden":"true"}),o("h2",{class:"text-xl font-bold text-gray-800 reg-title"},"账号注册"),o("p",{class:"text-sm text-gray-500 margin-top-4 reg-subtitle"},"填写以下信息完成账号注册")]';

if (js.includes(oldHead)) {
  js = js.replace(oldHead, newHead);
  console.log("updated card head with badge");
} else {
  console.log("head pattern missing", js.includes("card-header-bar"));
  const i = js.indexOf("card-header-bar");
  console.log(js.slice(i, i + 280));
}

// Header top-right: keep only navigation that uses screenshot words
// Change header dual buttons: remove duplicate 「已有账号？去登录」 from top (it belongs under form)
const headerLoginBtn =
  'r(l,{type:"primary",plain:"",onClick:e[2]||(e[2]=t=>d(b).push("/login"))},{default:s(()=>[...e[12]||(e[12]=[C("已有账号？去登录",-1)])]),_:1})';
if (js.includes(headerLoginBtn)) {
  js = js.replace(headerLoginBtn, "");
  console.log("removed header duplicate 已有账号");
}

fs.writeFileSync(path, js);
console.log("done");
