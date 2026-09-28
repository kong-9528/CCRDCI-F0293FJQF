const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const idx = s.indexOf('class:"history-btn"');
console.log("history-btn at", idx);
console.log(s.slice(idx, idx + 350));
