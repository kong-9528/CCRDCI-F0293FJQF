import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const s2 = t.indexOf('key:"forgot-step2"');
console.log("from step2, next 1500 chars:\n");
console.log(t.slice(s2, s2 + 1500));
console.log("\n\n==== following 400 ====\n");
console.log(t.slice(s2 + 1500, s2 + 1900));
