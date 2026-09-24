const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

const ae = s.indexOf("function ae()");
console.log("--- ae withdraw ---");
console.log(s.slice(ae, ae + 700));

const ce = s.indexOf("function ce()");
console.log("\n--- ce submit ---");
console.log(s.slice(ce, ce + 900));

// find label without DCI
const labels = s.match(/label:"[^"]*标识码[^"]*"/g);
console.log("\nlabels", labels);
const typeLabels = s.match(/label:"[^"]*类型[^"]*"/g);
console.log("type labels", typeLabels);
