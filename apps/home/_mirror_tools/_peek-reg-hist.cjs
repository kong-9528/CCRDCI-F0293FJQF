const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
let p = 0,
  c = 0;
while ((p = s.indexOf("Le(", p)) >= 0 && c < 10) {
  console.log(c, s.slice(Math.max(0, p - 80), p + 120));
  p += 3;
  c++;
}
const idx = s.indexOf("历史申请记录");
console.log("\ndialog area", s.slice(idx, idx + 800));
