const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

const a = s.indexOf("__DCI_ORGINFO_DEMO__.apply");
console.log(JSON.stringify(s.slice(a - 300, a + 500)));

// try parse
try {
  require("acorn").parse(s, { ecmaVersion: "latest", sourceType: "module" });
  console.log("PARSE OK");
} catch (e) {
  console.log("PARSE FAIL", e.message);
  // fallback: Function constructor on stripped imports?
  try {
    new Function(s.replace(/^import[^;]+;/gm, "/*imp*/").replace(/export\s+\{[^}]+\}/, ""));
    console.log("Function OK");
  } catch (e2) {
    console.log("Function FAIL", e2.message.slice(0, 200));
  }
}

// geAudit definition should be org-info aware
const g = s.indexOf("geAudit=E");
console.log("geAudit:", s.slice(g, g + 80));

// header withdraw duplicate
const h = s.indexOf('geAudit.value?(o(),p(d,{key:0,type:"danger"');
console.log("header withdraw:", h >= 0, h);

// cancel button text - user wants 取消申请
const cancel = s.indexOf('[s(" 取消 "');
console.log("cancel label present", cancel >= 0);

// Check label for type field in template
const lab = s.indexOf('label:"DCI注册中心类型"');
console.log("type field label", lab, JSON.stringify(s.slice(lab, lab + 80)));
const lab2 = s.indexOf("注册中心类型");
let from = 0, n = 0;
while ((from = s.indexOf("注册中心类型", from)) !== -1 && n < 8) {
  console.log("label hit", n, JSON.stringify(s.slice(from - 30, from + 40)));
  from += 5; n++;
}
