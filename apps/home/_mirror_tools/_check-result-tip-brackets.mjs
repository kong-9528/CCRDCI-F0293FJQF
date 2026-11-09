import fs from "node:fs";
const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
const i = s.indexOf("result-count-tip");
console.log(s.slice(i - 120, i + 700));
