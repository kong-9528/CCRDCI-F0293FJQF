const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const i = s.indexOf('label:"合同附件"');
console.log("prop label", i);
console.log(JSON.stringify(s.slice(i - 50, i + 800)));

// also search 合同附件 as text in template
const j = s.indexOf("合同附件");
console.log("\ntext hits");
let from = 0,
  n = 0;
while ((from = s.indexOf("合同附件", from)) !== -1 && n < 5) {
  console.log(n, JSON.stringify(s.slice(from - 100, from + 200)));
  from += 4;
  n++;
}

// section-title after contract
const k = s.indexOf("联系人信息");
console.log("\n联系人", JSON.stringify(s.slice(k - 150, k + 100)));
