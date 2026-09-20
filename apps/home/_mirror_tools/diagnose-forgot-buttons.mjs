import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const k = t.indexOf("function me()");
console.log("me:\n", t.slice(k, k + 400));

const i = t.indexOf('key:"forgot-step1"');
console.log("\n==== STEP1 (to 800) ====\n", t.slice(i, i + 900));

const j = t.indexOf('key:"forgot-step2"');
console.log("\n==== STEP2 (to 1200) ====\n", t.slice(j, j + 1200));

console.log("\nft=", t.includes("ft=c(1)"), "ft.value", (t.match(/ft\.value/g) || []).length);

// check if e[60] conflicts / onClick for back
console.log("\ne[60]", t.indexOf("e[60]"));
console.log("e[61]", t.indexOf("e[61]"));
console.log("e[58]", t.split("e[58]").length - 1);

// disabled expressions
const d1 = t.indexOf("disabled:!(i.value.phoneNumber");
console.log("\ndisabled step1:\n", t.slice(d1, d1 + 120));
const d2 = t.indexOf("disabled:!(i.value.newPassword");
console.log("disabled step2:\n", t.slice(d2, d2 + 150));

// Fragment / createBlock aliases
const imp = t.match(/import\{([^}]+)\}from"\.\/index-DA8BAxJb\.js"/)[1];
console.log("\nv,h,j bindings:");
for (const p of imp.split(",")) {
  const s = p.trim();
  if (/^(o|c|J|i|h|v|f) as /.test(s) || s === "o" || s === "c" || s === "J")
    console.log(" ", s);
}
