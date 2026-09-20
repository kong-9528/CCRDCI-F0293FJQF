import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// Find Le definition or import
const imp = t.match(/import\{([^}]+)\}from"\.\/index-DA8BAxJb\.js"/);
console.log("DA8 import bindings count", imp[1].split(",").length);
// find "as Le" or function Le
const i = t.indexOf("function Le");
console.log("function Le", i, i >= 0 ? t.slice(i, i + 200) : "");
const j = t.indexOf("Le=");
console.log("Le=", j >= 0 ? t.slice(j, j + 80) : "no");
// search Le in import
const parts = imp[1].split(",");
for (const p of parts) {
  if (p.includes("Le") || p.trim().endsWith("as t") || p.includes(" J3e") || p.trim() === "t" || /as t$/.test(p.trim()))
    console.log("part", p.trim());
}
// What calls captcha - Le
const k = t.indexOf("function y(){Le()");
console.log("y():", t.slice(k, k + 250));

// Is Le imported as something?
const leImp = parts.find((p) => p.includes("Le") || p.match(/\bas\s+Le\b/));
console.log("leImp", leImp);

// Maybe Le is local wrapper
const leDef = t.match(/function Le\(\)\{[^}]+\}/);
console.log("leDef", leDef && leDef[0]);
const leArrow = t.match(/Le=[^;]+/);
console.log("leArrow", leArrow && leArrow[0]);

// Search all Le(
let idx = 0, n = 0;
while ((idx = t.indexOf("Le(", idx)) >= 0 && n < 5) {
  console.log("Le( @", idx, t.slice(idx - 30, idx + 50));
  idx += 3;
  n++;
}
