const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-D_FAjFVe.js", "utf8");
const i = s.indexOf('class:"hero-desc"');
console.log(s.slice(i, i + 200));
