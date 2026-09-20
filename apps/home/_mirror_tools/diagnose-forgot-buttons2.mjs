import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// all ft usages
let i = 0,
  n = 0;
while ((i = t.indexOf("ft", i)) >= 0 && n < 40) {
  const ctx = t.slice(Math.max(0, i - 2), i + 20);
  if (/\bft\b/.test(ctx) || ctx.includes("ft=") || ctx.includes("ft.") || ctx.includes("ft,")) {
    console.log(i, ctx.replace(/\n/g, " "));
    n++;
  }
  i += 2;
}

// How is form default slot closed after our patch?
const a = t.indexOf('key:"forgot-step1"');
const b = t.indexOf("switch-register-row", a);
console.log("\naround form end:\n", t.slice(b - 250, b + 120));

// Check el-button component - is onClick correct or should be onClick with native?
// Element plus uses onClick in vue 3

// Maybe issue: form validate with empty rules fields for step2 props still mounted? 
// On step1 only step1 fields mounted.

// Print full step1 button + form closing
const c = t.indexOf("下一步");
console.log("\naround 下一步:\n", t.slice(c - 200, c + 200));
