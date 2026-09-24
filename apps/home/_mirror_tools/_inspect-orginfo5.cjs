const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
let idx = 0;
while ((idx = s.indexOf("注册中心类型", idx)) >= 0) {
  console.log(JSON.stringify(s.slice(idx - 30, idx + 40)));
  idx += 6;
}

console.log("\n--- ce submit success ---");
const ce = s.indexOf("function ce()");
console.log(s.slice(ce + 400, ce + 1100));
