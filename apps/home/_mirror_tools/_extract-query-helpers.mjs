import fs from "node:fs";
const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
const i = s.indexOf("function __resolveQueryFields");
console.log(s.slice(i, i + 2200));
const j = s.indexOf('ye(o(r),l=>(d(),g("div",{key:');
console.log("\n==== card ====\n");
console.log(s.slice(j, j + 500));
