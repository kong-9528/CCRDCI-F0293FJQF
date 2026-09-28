const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
// Find O.value? branches that are NOT form-text-value
let from = 0,
  n = 0;
while ((from = s.indexOf("O.value?", from)) !== -1 && n < 20) {
  console.log(n, JSON.stringify(s.slice(from, from + 160)));
  from += 8;
  n++;
}
