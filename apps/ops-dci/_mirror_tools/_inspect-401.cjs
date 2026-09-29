const fs = require("fs");
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const k = s.indexOf("t===401");
console.log(s.slice(k, k + 1200));
console.log("\n--- permission guard ---");
const g = s.indexOf("getInfo");
// find router beforeEach
const be = s.indexOf("beforeEach");
console.log("beforeEach", be);
console.log(s.slice(be, be + 1500));
