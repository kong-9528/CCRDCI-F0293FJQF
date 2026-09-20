import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let js = fs.readFileSync(path, "utf8");

// --- 1) Exact copy replacements (screenshot only) ---
const copyMap = [
  ["DCI 技术服务中心", "DCI管理中心"], // keep minimal brand? User said no invention - screenshot has no header. Use DCI管理中心 from site title or just leave and hide via CSS
];

// Form / banner / button text — only screenshot strings
const exact = [
  ['"用户极简注册"', '"账号注册"'],
  [
    '"填报以下账号密码，即刻体验 DCI 在线查验与控制台服务"',
    '"填写以下信息完成账号注册"',
  ],
  ['"DCI 账号极简注册"', '""'], // will hide banner via CSS; empty unsafe - replace banner block later
  ['"只需 3 秒完成注册，成功后自动为您登录控制台"', '""'],
  ['label:"设置密码"', 'label:"密码"'],
  ['placeholder:"请输入手机号码"', 'placeholder:"请输入 11 位手机号码"'],
  ['C(" 立即注册并自动登录控制台 ",-1)', 'C("注册",-1)'],
  [
    '"注册成功！已为您重定向至登录页，请登录"',
    '"注册成功"',
  ],
];

// Fix password placeholder to exact screenshot (may already be close)
// Current likely truncated or different
if (js.includes("8-12位，需含数字/大小写字母/特殊字符至少3种")) {
  console.log("pwd placeholder already exact");
} else {
  // try find partial
  const m = js.match(/placeholder:"8-12[^"]+"/);
  console.log("pwd ph current", m && m[0]);
  if (m) {
    js = js.replace(
      m[0],
      'placeholder:"8-12位，需含数字/大小写字母/特殊字符至少3种"',
    );
  }
}

for (const [a, b] of exact) {
  if (!js.includes(a)) {
    console.log("MISSING copy", a);
    continue;
  }
  js = js.split(a).join(b);
  console.log("OK copy", a.slice(0, 24), "→", b.slice(0, 24));
}

// --- 2) Reorder form fields: username, password, confirm, phone, captcha, sms ---
const formStartMarker =
  'default:s(()=>[r(g,{label:"账号名",prop:"username"}';
const formEndMarker =
  'r(l,{type:"primary",size:"large",class:"w-full font-bold h-12 text-base rounded-lg margin-top-24"';

const fsIdx = js.indexOf(formStartMarker);
const feIdx = js.indexOf(formEndMarker);
if (fsIdx < 0 || feIdx < 0) {
  console.log("form markers missing", fsIdx, feIdx);
  // try after label change
} else {
  const formInner = js.slice(fsIdx + 'default:s(()=>['.length, feIdx);
  // split by r(g,{label:
  const parts = [];
  const re = /r\(g,\{label:"[^"]+",prop:"[^"]+"\}/g;
  const starts = [];
  let m;
  while ((m = re.exec(formInner))) starts.push(m.index);
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : formInner.length;
    parts.push(formInner.slice(start, end));
  }
  console.log(
    "fields",
    parts.map((p) => {
      const lm = p.match(/label:"([^"]+)",prop:"([^"]+)"/);
      return lm && `${lm[2]}:${lm[1]}`;
    }),
  );

  const byProp = Object.fromEntries(
    parts.map((p) => {
      const lm = p.match(/prop:"([^"]+)"/);
      return [lm[1], p];
    }),
  );

  const order = [
    "username",
    "password",
    "confirmPassword",
    "phonenumber",
    "code",
    "smsCode",
  ];
  for (const k of order) {
    if (!byProp[k]) console.log("missing prop", k);
  }
  const reordered = order.map((k) => byProp[k]).join("");
  js =
    js.slice(0, fsIdx + 'default:s(()=>['.length) +
    reordered +
    js.slice(feIdx);
  console.log("reordered fields");
}

// --- 3) Success: stay on page success state OR go home with message; use 去登录 + 返回首页 ---
// Change success handler: instead of only toast+push /login, push home with query or show success
// Keep simple: toast 注册成功, then navigate to /?showLogin=true so user can login
// Or push / with message

const oldSuccess =
  'W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push("/login")})';
const newSuccess =
  'W(l).then(()=>{_.value=!1,m.success("注册成功"),b.push({path:"/",query:{showLogin:"true"}})})';

// After our copy replace, message is 注册成功
if (js.includes(oldSuccess)) {
  js = js.replace(oldSuccess, newSuccess);
  console.log("OK success navigate");
} else {
  // find pattern
  const i = js.indexOf("W(l).then");
  console.log("success handler", js.slice(i, i + 160));
}

fs.writeFileSync(path, js);
console.log("written");
