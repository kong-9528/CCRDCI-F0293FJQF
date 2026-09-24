const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
// extract imports for oa, ra, na
const imp = s.match(/as na,at as oa,au as ra/);
console.log("imports", imp && imp[0]);
// find how change submit decides
const i = s.indexOf("function ce()");
console.log(s.slice(i, i + 1200));
const j = s.indexOf("function Ue(");
console.log("\n--- Ue ---\n", s.slice(j, j + 600));
