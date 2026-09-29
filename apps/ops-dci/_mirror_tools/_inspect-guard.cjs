const fs = require("fs");
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
// RuoYi permission: next(\`/login?redirect=...\`)
for (const pat of [
  "/login?redirect",
  'path:"/login"',
  "getToken()",
  "Ca()",
  "to.path===\"/login\"",
  "to.path=='/login'",
  'whiteList',
  "roles.length",
]) {
  let p = 0,
    c = 0;
  while ((p = s.indexOf(pat, p)) >= 0 && c < 4) {
    console.log("\n==", pat, p);
    console.log(s.slice(Math.max(0, p - 60), p + 250));
    p++;
    c++;
  }
}
