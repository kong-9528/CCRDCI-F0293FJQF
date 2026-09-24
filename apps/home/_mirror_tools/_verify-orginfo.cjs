const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
console.log("geAudit", s.includes("geAudit"));
console.log("geIdle", s.includes("geIdle"));
console.log("无状态", s.includes("无状态"));
console.log("撤回申请 only footer", s.includes('e[26]||(e[26]=[s(" 撤回申请 "'));
console.log("申请正在审核中", s.includes("申请正在审核中"));
console.log("更新 ", s.includes('s(" 更新 "'));
console.log("ORGINFO_DEMO apply", s.includes("__DCI_ORGINFO_DEMO__"));

const i = s.indexOf("Je(");
console.log("Je context", s.slice(i, i + 200));

const c = s.indexOf("geAudit=E");
console.log("computed", s.slice(c - 80, c + 350));

const f = s.indexOf("geAudit.value?(o(),c(\"div\",Ua");
console.log("footer audit", s.slice(f, f + 280));
