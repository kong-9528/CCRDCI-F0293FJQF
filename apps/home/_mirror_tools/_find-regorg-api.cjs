const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");

// find exports ae and a9 near end or in export list
const needles = [
  "infoByUserId",
  "/dci/regorg/",
  "getRegOrg",
  "regOrgInfo",
  "function ae",
  "ae=",
  "a9=",
];
for (const n of needles) {
  let i = 0, c = 0;
  while ((i = s.indexOf(n, i)) >= 0 && c < 3) {
    console.log("---", n, i);
    console.log(s.slice(Math.max(0, i - 80), i + 200));
    i += n.length;
    c++;
  }
}

// Find export mapping for ae/a9 - look at how identity imports
// import { ae as O, a9 as T }
const exportMatch = s.match(/ae:([A-Za-z0-9_$]+)/);
console.log("ae export sample", exportMatch && exportMatch[0]);
