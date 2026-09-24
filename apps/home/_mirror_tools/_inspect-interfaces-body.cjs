const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DTpd2dgU.js", "utf8");
const i = s.indexOf("api-item-body");
console.log(s.slice(i, i + 2500));
