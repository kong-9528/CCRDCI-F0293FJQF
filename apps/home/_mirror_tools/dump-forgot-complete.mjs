import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// Dump entire forgot-related setup
const setupStart = t.indexOf('i=c({phoneNumber:""');
console.log("=== SETUP MODEL/RULES/FNS ===\n");
console.log(t.slice(setupStart, setupStart + 2200));

console.log("\n\n=== FORGOT UI BRANCH ===\n");
const ui = t.indexOf('_.value==="forgot"');
console.log(t.slice(ui, ui + 4500));

fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_forgot-dump.txt",
  t.slice(setupStart, setupStart + 2200) + "\n\n----\n\n" + t.slice(ui, ui + 4500),
  "utf8",
);
console.log("\nwrote dump, total file", t.length);
