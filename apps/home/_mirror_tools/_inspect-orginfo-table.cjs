const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const i = s.indexOf('class:"custom-descriptions"');
console.log("history custom-desc idx", i);
console.log(s.slice(i - 80, i + 100));
// main form structure around 基本信息
const j = s.indexOf('基本信息');
console.log("\nform area", s.slice(j - 40, j + 200));
// Is main view form or descriptions?
console.log("\nhas apply-form", s.includes("apply-form"));
console.log("form-text-value count", (s.match(/form-text-value/g) || []).length);
