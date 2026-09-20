import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);
const i = t.indexOf('m("重置密码"');
console.log(JSON.stringify(t.slice(i, i + 120)));

const j = t.indexOf('m("下一步"');
console.log("next:", JSON.stringify(t.slice(j, j + 100)));

// e[60] conflict - yidun also uses e[60]
console.log("\ne[60] count", t.split("e[60]").length - 1);
console.log("e[61] count", t.split("e[61]").length - 1);
let idx = 0,
  n = 0;
while ((idx = t.indexOf("e[60]", idx)) >= 0 && n < 5) {
  console.log("e60@", idx, t.slice(idx, idx + 80));
  idx += 5;
  n++;
}
