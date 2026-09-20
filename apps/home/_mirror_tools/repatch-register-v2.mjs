import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";

// re-download clean
execSync(
  `curl.exe -sL "http://8.145.60.215:9020/dci-manage-reg/static/js/register-CvP1VOMb.js" -o "${path}"`,
);
let js = fs.readFileSync(path, "utf8");
js = js.replaceAll("/dci-manage-reg/", "/");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 160)}`);
  const n = js.split(from).length - 1;
  js = js.split(from).join(to);
  console.log("OK", label, "x" + n);
}

// copy
mustReplace('"用户极简注册"', '"账号注册"', "title");
mustReplace(
  '"填报以下账号密码，即刻体验 DCI 在线查验与控制台服务"',
  '"填写以下信息完成账号注册"',
  "subtitle",
);
mustReplace('label:"设置密码"', 'label:"密码"', "pwd label");
mustReplace(
  'placeholder:"请输入手机号码"',
  'placeholder:"请输入 11 位手机号码"',
  "phone ph",
);
mustReplace('C(" 立即注册并自动登录控制台 ",-1)', 'C("注册",-1)', "btn");
mustReplace(
  '"注册成功！已为您重定向至登录页，请登录"',
  '"注册成功"',
  "toast",
);
mustReplace('"DCI 账号极简注册"', '""', "banner title");
mustReplace(
  '"只需 3 秒完成注册，成功后自动为您登录控制台"',
  '""',
  "banner desc",
);

// reorder fields
{
  const formStart = 'default:s(()=>[r(g,{label:"账号名",prop:"username"}';
  const formBtn =
    'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg margin-top-24"';
  const fsIdx = js.indexOf(formStart);
  const feIdx = js.indexOf(formBtn);
  if (fsIdx < 0 || feIdx < 0) throw new Error("form markers");
  const prefix = js.slice(0, fsIdx + "default:s(()=>[".length);
  const suffix = js.slice(feIdx);
  const formInner = js.slice(fsIdx + "default:s(()=>[".length, feIdx);
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
  const order = [
    "username",
    "password",
    "confirmPassword",
    "phonenumber",
    "code",
    "smsCode",
  ];
  for (const k of order) if (!byProp[k]) throw new Error("missing " + k);
  js = prefix + order.map((k) => byProp[k]).join("") + suffix;
  console.log("OK reorder", order.join(","));
}

// card head + badge
mustReplace(
  'o("div",{class:"card-header-bar margin-bottom-24 text-center"},[o("h2",{class:"text-xl font-bold text-gray-800"},"账号注册"),o("p",{class:"text-sm text-gray-500 margin-top-4"},"填写以下信息完成账号注册")]',
  'o("div",{class:"card-header-bar register-card-head margin-bottom-24 text-center"},[o("div",{class:"reg-badge-box","aria-hidden":"true"}),o("h2",{class:"text-xl font-bold text-gray-800 reg-title"},"账号注册"),o("p",{class:"text-sm text-gray-500 margin-top-4 reg-subtitle"},"填写以下信息完成账号注册")]',
  "card head",
);

// Insert login row AFTER button r() closes, still inside form array
// Original: 8,["loading"])]),_:1}  →  ) closes button, ] closes form, ) closes s()
// Patched:  8,["loading"]),ROW])],_:1}  → ) closes button, ,ROW, ] closes form, ) closes s()
mustReplace(
  '8,["loading"])]),_:1},8,["model","rules"]',
  '8,["loading"]),o("div",{class:"reg-login-row"},[o("span",null,"已有账号？"),o("span",{class:"reg-login-link",onClick:e[20]||(e[20]=t=>d(b).push({path:"/",query:{showLogin:"true"}}))},"去登录")])])],_:1},8,["model","rules"]',
  "login row after button",
);

// Header: replace ae children to only 返回首页 (no trailing-comma hazard)
mustReplace(
  'o("div",ae,[r(l,{link:"",type:"primary",onClick:e[1]||(e[1]=t=>d(b).push("/"))},{default:s(()=>[...e[11]||(e[11]=[C("返回首页",-1)])]),_:1}),r(l,{type:"primary",plain:"",onClick:e[2]||(e[2]=t=>d(b).push("/login"))},{default:s(()=>[...e[12]||(e[12]=[C("已有账号？去登录",-1)])]),_:1})])',
  'o("div",ae,[r(l,{link:"",type:"primary",onClick:e[1]||(e[1]=t=>d(b).push("/"))},{default:s(()=>[...e[11]||(e[11]=[C("返回首页",-1)])]),_:1})])',
  "header actions",
);

// success navigate: no auto-login
mustReplace(
  'W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push("/login")})',
  'W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push({path:"/",query:{showLogin:"true"}})})',
  "success nav",
);

fs.writeFileSync(path, js, "utf8");
try {
  execSync(`node --check "${path}"`, { stdio: "pipe" });
  console.log("SYNTAX OK");
} catch (e) {
  console.error("SYNTAX FAIL");
  console.error(String(e.stderr || e));
  process.exit(1);
}
