const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DTpd2dgU.js", "utf8");
const i = s.indexOf("function W(");
console.log(s.slice(i, i + 500));
// also find how names are shown in template
const j = s.indexOf("api-item-titles");
console.log("\n--- titles render ---");
// search in return template
const k = s.indexOf('class:"api-item-titles"');
console.log(s.slice(s.indexOf("api-item-toggle"), s.indexOf("api-item-toggle") + 900));
