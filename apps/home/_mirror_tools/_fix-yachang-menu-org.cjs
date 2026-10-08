const fs = require("fs");
const path = require("path");

const files = [
  "apps/home/mirror/static/js/index-_fJendd7.js",
  "apps/home/mirror/static/js/index-DA8BAxJb.js",
];

const old = 'I=A(()=>a.regOrgName||"")';
const neu =
  'I=A(()=>{const _n=String(a.name||a.nickName||"").toLowerCase();if(_n==="yachang")return"个人账号";try{const M=window.__DCI_MOCK__;const mu=M&&M.currentUser();if(mu&&String(mu.username||"").toLowerCase()==="yachang")return"个人账号"}catch(_e){}return a.regOrgName||""})';

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log("skip missing", file);
    continue;
  }
  let s = fs.readFileSync(file, "utf8");
  if (s.includes(neu)) {
    console.log("already patched", path.basename(file));
    continue;
  }
  if (!s.includes(old)) {
    // also detect already-partial / different form
    const i = s.indexOf("dropdown-header-org");
    const j = s.indexOf("a.regOrgName");
    console.log(
      "NOT FOUND in",
      path.basename(file),
      "header-org=",
      i >= 0,
      "regOrgName near",
      j >= 0 ? JSON.stringify(s.slice(Math.max(0, j - 40), j + 60)) : "n/a"
    );
    continue;
  }
  s = s.replace(old, neu);
  fs.writeFileSync(file, s);
  console.log("OK", path.basename(file));
}
