import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js",
  "utf8",
);

for (const k of ["function R", "onOpenAuth:R", "w.value=", "c.value=!0", "AuthDialog", "te,", "import{A"]) {
  const i = t.indexOf(k);
  console.log("\n===", k, i);
  if (i >= 0) console.log(t.slice(Math.max(0, i - 60), i + 250));
}

// Find Auth component usage
const i2 = t.indexOf("s(te");
console.log("\n s(te", i2);
if (i2 > 0) console.log(t.slice(i2 - 40, i2 + 300));

const i3 = t.indexOf("Auth");
console.log("\nfirst Auth", i3, t.slice(i3, i3 + 80));
