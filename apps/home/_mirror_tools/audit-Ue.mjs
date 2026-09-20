import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");

console.log("function Ue count", (t.match(/function Ue\(/g) || []).length);
console.log("onClick:Ue count", (t.match(/onClick:Ue/g) || []).length);

// All Ue contexts
let idx = 0;
let n = 0;
while ((idx = t.indexOf("Ue", idx)) >= 0 && n < 30) {
  const ctx = t.slice(Math.max(0, idx - 30), idx + 40);
  if (/\bUe\b/.test(ctx)) {
    console.log(n, ctx.replace(/\s+/g, " "));
    n++;
  }
  idx += 2;
}

// What should SMS be? Look for Pe and qe
console.log("\nPe", t.includes("function Pe"));
console.log("qe", t.includes("function qe"));
const q = t.indexOf("function qe");
console.log(t.slice(q, q + 200));
