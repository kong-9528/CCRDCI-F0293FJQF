const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

const marker = 'geAudit.value?(o(),c("div",Ua';
const i = s.indexOf(marker);
console.log("footer idx", i);
console.log(JSON.stringify(s.slice(i, i + 1100)));

const ce = s.indexOf("function ce(");
console.log("\n--- ce ---");
console.log(JSON.stringify(s.slice(ce, ce + 900)));

const a = s.indexOf("ORGINFO_DEMO");
console.log("\n--- ORGINFO ---");
console.log(JSON.stringify(s.slice(a - 80, a + 400)));

const xe = s.indexOf("xe=");
console.log("\n--- xe ---");
console.log(JSON.stringify(s.slice(xe, xe + 250)));

// label for type field
const t = s.indexOf("DCI注册中心类型");
console.log("\n--- type label ---");
console.log(JSON.stringify(s.slice(t - 20, t + 200)));

// options rendering
const opt = s.indexOf("V.value");
let n = 0, from = 0;
while ((from = s.indexOf("el-option", from)) !== -1 && n < 3) {
  console.log("\nel-option", n, JSON.stringify(s.slice(from - 30, from + 120)));
  from += 10; n++;
}
from = 0; n = 0;
while ((from = s.indexOf("typeCode", from)) !== -1 && n < 5) {
  console.log("\ntypeCode", n, JSON.stringify(s.slice(from - 40, from + 100)));
  from += 8; n++;
}
