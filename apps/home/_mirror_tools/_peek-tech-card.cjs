const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-CsmZrPeY.js", "utf8");
const i = s.indexOf("DCI®技术服务中心");
console.log("title idx", i);
// find service-card tech section near card-bottom after title
const chunk = s.slice(i, i + 1800);
console.log(chunk);
console.log("\n--- flags ---");
const f = s.indexOf("bt=r(null)");
console.log(s.slice(f, f + 700));
