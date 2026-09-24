const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");

// Find export { ... ae: xxx, a9: yyy }
const idx = s.lastIndexOf("export{");
console.log("last export at", idx);
console.log(s.slice(idx, idx + 2500));

// Also search for sme and nme near org functions - which are exported as ae/a9
const i = s.indexOf("function sme");
console.log("\nsme context", s.slice(i - 400, i + 200));

// Look for ,ae: or ae as in export
const re = /[,{]ae:([A-Za-z0-9_$]+)/g;
let m;
while ((m = re.exec(s))) {
  if (m.index > s.length - 5000 || m.index > 1290000) console.log("ae binding", m[1], m.index);
}
const re2 = /[,{]a9:([A-Za-z0-9_$]+)/g;
while ((m = re2.exec(s))) {
  if (m.index > 1290000) console.log("a9 binding", m[1], m.index);
}
