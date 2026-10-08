const fs = require("fs");

const file = "apps/home/mirror/static/js/index-DA8BAxJb.js";
let s = fs.readFileSync(file, "utf8");

const old = 'c=E(()=>l.regOrgName||"")';
const neu =
  'c=E(()=>{const _n=String(l.name||l.nickName||"").toLowerCase();if(_n==="yachang")return"个人账号";try{const M=window.__DCI_MOCK__;const mu=M&&M.currentUser();if(mu&&String(mu.username||"").toLowerCase()==="yachang")return"个人账号"}catch(_e){}return l.regOrgName||""})';

if (s.includes(neu)) {
  console.log("already patched Navbar");
  process.exit(0);
}
if (!s.includes(old)) {
  const i = s.indexOf("regOrgName||\"\"");
  console.error("NOT FOUND", i >= 0 ? JSON.stringify(s.slice(i - 40, i + 40)) : "n/a");
  process.exit(1);
}
s = s.replace(old, neu);
fs.writeFileSync(file, s);
console.log("OK Navbar yachang -> 个人账号");
