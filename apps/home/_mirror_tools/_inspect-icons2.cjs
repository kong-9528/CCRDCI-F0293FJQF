const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
// find where F, d, ze etc assigned in setup return / const
const i = s.indexOf("const F=");
const j = s.indexOf("F=h(");
const k = s.indexOf(',F=');
console.log("F=", i, j, k);
// search el-icon resolve
let from = 0,
  n = 0;
while ((from = s.indexOf("el-icon", from)) !== -1 && n < 5) {
  console.log(JSON.stringify(s.slice(from - 40, from + 60)));
  from += 7;
  n++;
}
// find h( usage - h is imported as f as h - wait import says f as h
// import: f as h - that's resolveComponent typically in unplugin
console.log("import head", s.slice(0, 280));

// In vue script setup compiled: 
// h("el-icon") pattern
from = 0;
n = 0;
while ((from = s.indexOf('h("', from)) !== -1 && n < 15) {
  console.log(JSON.stringify(s.slice(from, from + 40)));
  from += 3;
  n++;
}
