const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

// Find computed Ne, S, O, w
for (const m of ["Ne=E", "S=E", "O=E", "w=E", "const S=", "const Ne=", "const O=", "xe=E"]) {
  const i = s.indexOf(m);
  if (i >= 0) console.log(m, i, s.slice(i, i + 200));
}

console.log("\n--- status alert render ---");
const i = s.indexOf('class:"status-alert-wrapper"');
// find in template where it's used
const j = s.indexOf("status-alert-wrapper");
// search for el-alert usage
const k = s.indexOf("el-alert") >= 0 ? s.indexOf("el-alert") : s.indexOf("Alert");
console.log("alert", k);
const a = s.indexOf("ca,");
console.log(s.slice(s.indexOf("m(\"div\",ca"), s.indexOf("m(\"div\",ca") + 800));

console.log("\n--- header withdraw ---");
const h = s.indexOf("header-right");
console.log(s.slice(s.indexOf('class:"header-right"'), s.indexOf('class:"header-right"') + 100));
// template header buttons
const hb = s.indexOf("ua,[");
console.log(s.slice(s.indexOf("m(\"div\",ua"), s.indexOf("m(\"div\",ua") + 900));
