const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/css/index-CgFL8VU8.css", "utf8");
const i = s.indexOf("profile-layout-inner");
console.log(s.slice(i, i + 900));
const js = fs.readFileSync("apps/home/mirror/static/js/index-CsmZrPeY.js", "utf8");
const re = /class:"[^"]+"/g;
let m, c = 0;
while ((m = re.exec(js)) && c < 40) {
  if (/right|left|layout|card|profile|side/i.test(m[0])) {
    console.log(m[0]);
    c++;
  }
}
