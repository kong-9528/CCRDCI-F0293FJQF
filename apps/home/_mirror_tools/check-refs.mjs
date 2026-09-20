import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");

// ue / W refs declaration
const setupIdx = t.indexOf("const Se1=");
console.log("--- setup around Se1 ---");
console.log(t.slice(setupIdx - 200, setupIdx + 800));

console.log("\n--- Ms const ---");
const ms = t.indexOf("Ms=");
console.log(t.slice(ms, ms + 80));

console.log("\n--- ue declaration ---");
const ueMatches = [...t.matchAll(/\bue\b/g)].slice(0, 20);
console.log(
  "ue count",
  (t.match(/\bue\b/g) || []).length,
  "W count",
  (t.match(/\bW\b/g) || []).length,
);
// find const/let/var ue or ue=c(
for (const pat of ["ue=c(", "ue=c(", ",ue=", "const ue", "let ue", "W=c(", ",W="]) {
  console.log(pat, t.includes(pat), t.indexOf(pat));
}

// Return statement includes?
const ret = t.indexOf("return{");
console.log("\nreturn slice", t.slice(ret, ret + 400));
