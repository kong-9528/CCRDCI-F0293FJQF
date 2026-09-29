const fs = require("fs");
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const i = s.indexOf("`/login?redirect=${e.fullPath}`");
console.log(s.slice(i - 800, i + 200));
