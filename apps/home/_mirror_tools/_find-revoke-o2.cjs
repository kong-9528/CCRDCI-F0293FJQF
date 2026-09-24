const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DTpd2dgU.js", "utf8");
const oStart = s.indexOf('O=[{id:');
console.log("oStart", oStart);
console.log(s.slice(oStart, oStart + 200));
const u = s.indexOf("function U(", oStart);
console.log("U at", u);
console.log("between", u - oStart);
// search revoke in first 15k after O
const chunk = s.slice(oStart, oStart + 12000);
console.log("has revoke", chunk.includes("revoke"));
console.log("has 撤销", chunk.includes("撤销"));
const r = chunk.indexOf("撤销");
console.log("撤销 at", r, JSON.stringify(chunk.slice(r - 100, r + 120)));
