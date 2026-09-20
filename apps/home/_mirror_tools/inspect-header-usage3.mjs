import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-D8JrnKcV.js",
  "utf8",
);

console.log("len", t.length);
// Find all occurrences of ",I," or " I," as component usage - Vue creates with createVNode / resolveComponent
const needles = ["t(I,", "t(v,", "t(C,", "s(I,", "s(v,", "s(C,", "r(I,", "G(I,"];
for (const n of needles) {
  const i = t.indexOf(n);
  console.log(n, i, i >= 0 ? t.slice(i, i + 200) : "");
}

// dump from "setup"
const s = t.indexOf("setup(");
console.log("\nsetup@", s);
console.log(t.slice(s, s + 400));
console.log("\n...tail setup render...");
console.log(t.slice(-800));
