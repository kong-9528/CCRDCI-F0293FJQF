import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");
const i = t.indexOf("forgot-back");
console.log(t.slice(i - 80, i + 250));
console.log("\n--- Ue ---");
console.log(t.slice(t.indexOf("function Ue("), t.indexOf("function Ue(") + 120));
