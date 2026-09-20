import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");

// First 800 chars of imports
console.log(t.slice(0, 800));
console.log("\n--- A usages near forgot ---");
const i = t.indexOf("forgot-back");
console.log(t.slice(i - 50, i + 200));

// Find: ,A as or A as or withModifiers
console.log("\nwithModifiers?", t.includes("withModifiers"));
console.log("import A", [...t.matchAll(/([A-Za-z$]+) as A\b/g)].map((m) => m[0]));
console.log("A as", [...t.matchAll(/\bA as ([A-Za-z$]+)/g)].map((m) => m[0]));

// How login uses A
const j = t.indexOf('["prevent"]');
console.log("\nfirst prevent", t.slice(j - 40, j + 20));

// Is ft only one?
console.log("\nft=c", (t.match(/ft=c\(/g) || []).length);
console.log("ft.value=", (t.match(/ft\.value=/g) || []).length);
console.log(t.match(/ft\.value=[^,;)]+/g));
