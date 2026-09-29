const fs = require("fs");
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const i = s.indexOf('T8="Admin-Token"');
console.log("token idx", i);
console.log(s.slice(i - 800, i + 500));
console.log("\n--- interceptor ---");
const k = s.indexOf("Ca()&&!t");
console.log(s.slice(k - 100, k + 800));
console.log("\n--- removeToken / toLogin ---");
for (const pat of ["k8e()", "removeToken", "toLogin", "isRelogin", 'push("/login"', "replace('/login'", 'path:"/login"']) {
  let c = 0,
    p = 0;
  while ((p = s.indexOf(pat, p)) >= 0 && c < 3) {
    console.log("\n", pat, p);
    console.log(s.slice(Math.max(0, p - 100), p + 180));
    p++;
    c++;
  }
}
