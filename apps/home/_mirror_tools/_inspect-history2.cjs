const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const marker = '?"通过":';
const i = s.indexOf(marker);
console.log("status map", JSON.stringify(s.slice(i - 80, i + 120)));
const j = s.indexOf("function Le(r)");
console.log("\nLe", s.slice(j, j + 1100));
