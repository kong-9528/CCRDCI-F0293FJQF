const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DTpd2dgU.js", "utf8");
const i = s.indexOf('n("h2",ce,d(L.value),1)');
console.log("title render:", i, JSON.stringify(s.slice(i - 40, i + 80)));
console.log("ce const:", s.slice(s.indexOf("ce={class:"), s.indexOf("ce={class:") + 40));
