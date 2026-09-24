const fs = require("fs");
const s = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js",
  "utf8",
);
let i = -1;
let c = 0;
while ((i = s.indexOf("已开通", i + 1)) !== -1 && c < 5) {
  console.log(c, s.slice(i - 80, i + 100));
  c++;
}
console.log("count", c);
console.log("row-label pattern", s.includes('row-label"},"已开通"'));
