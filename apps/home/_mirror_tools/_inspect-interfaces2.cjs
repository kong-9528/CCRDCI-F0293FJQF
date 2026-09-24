const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DTpd2dgU.js", "utf8");
// Extract V() load function and w computed / mapping
const i = s.indexOf("async function V");
const i2 = s.indexOf("function V(");
const start = i >= 0 ? i : s.indexOf("function V");
console.log("V at", start);
console.log(s.slice(start, start + 1200));
console.log("\n--- w computed ---");
const w = s.indexOf("w=j(()=>");
console.log(s.slice(w, w + 800));
