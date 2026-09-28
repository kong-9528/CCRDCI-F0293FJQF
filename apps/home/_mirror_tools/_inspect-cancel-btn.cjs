const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const i = s.indexOf("onClick:we");
console.log(JSON.stringify(s.slice(i - 200, i + 120)));
const css = fs.readFileSync("apps/home/mirror/overrides.css", "utf8");
const j = css.indexOf("not(.submit-btn)");
console.log(css.slice(j - 80, j + 220));
