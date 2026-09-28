const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const i = s.indexOf("合同附件");
console.log(JSON.stringify(s.slice(i - 80, i + 500)));
const css = fs.readFileSync("apps/home/mirror/static/css/info-DVZhlGCX.css", "utf8");
console.log("\nfile-item", (css.match(/[^}]*file-item[^}]*\{[^}]+\}/g) || []).join("\n"));
console.log("\nupload", (css.match(/[^}]*upload[^}]*\{[^}]+\}/g) || []).slice(0, 8).join("\n"));
