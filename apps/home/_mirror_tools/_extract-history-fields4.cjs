const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

// Full submit-action branches
let from = 0,
  n = 0;
while ((from = s.indexOf("submit-action", from)) !== -1 && n < 8) {
  // find nearby condition
  console.log("\n=== submit", n, "@", from, "===");
  console.log(s.slice(from - 120, from + 450));
  from += 12;
  n++;
}

console.log("\n=== Se() edit entry ===");
from = s.indexOf("function Se()");
console.log(s.slice(from, from + 200));

console.log("\n=== onClick:Se ===");
from = 0;
n = 0;
while ((from = s.indexOf("onClick:Se", from)) !== -1 && n < 3) {
  console.log(n, s.slice(from - 200, from + 120));
  from += 10;
  n++;
}

console.log("\n=== 编辑 button ===");
from = 0;
n = 0;
while ((from = s.indexOf("编辑", from)) !== -1 && n < 8) {
  console.log(n, s.slice(from - 150, from + 80));
  from += 2;
  n++;
}

// M ref init
console.log("\n=== M=C ===");
from = s.indexOf("M=C(");
console.log(s.slice(from - 80, from + 80));

// G dialog secondary
console.log("\n=== G dialog ===");
from = s.indexOf('title:"历次申请全景明细信息"');
console.log(s.slice(from - 100, from + 200));
