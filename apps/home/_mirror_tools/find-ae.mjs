import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);
const i = t.indexOf("from\"./passwordRule");
console.log(t.slice(i - 5, i + 30));
const j = t.indexOf("Ge()");
console.log(t.slice(j - 80, j + 200));

// find all =Ge or Ge().
let idx = 0;
while ((idx = t.indexOf("Ge", idx)) >= 0 && idx < j + 500) {
  console.log(idx, t.slice(idx, idx + 40));
  idx += 2;
}
