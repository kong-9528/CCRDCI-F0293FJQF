import fs from "fs";
const m = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);
const i = m.indexOf("const E3=");
console.log(m.slice(i, i + 80));
const j = m.indexOf("Admin-Token");
console.log("Admin-Token", j, m.slice(j - 40, j + 80));
// Cookies library - Ea
const k = m.indexOf("Ea={");
console.log("Ea", m.slice(k, k + 200));
