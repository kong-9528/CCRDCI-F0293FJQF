const fs = require("fs");
const id = fs.readFileSync("apps/home/mirror/static/js/identity-sRS0ISv8.js", "utf8");
// find icon usage in header
const i = id.indexOf("header-icon");
console.log(id.slice(i - 200, i + 500));
console.log("\n--- ay as b ---");
const j = id.indexOf("ay as b");
// find where b is used
let from = 0,
  n = 0;
while ((from = id.indexOf("D(b)", from)) !== -1 && n < 5) {
  console.log(JSON.stringify(id.slice(from - 40, from + 60)));
  from += 4;
  n++;
}
// search OfficeBuilding in home mirror
const files = fs.readdirSync("apps/home/mirror/static/js").filter((f) => f.endsWith(".js"));
for (const f of files) {
  const s = fs.readFileSync("apps/home/mirror/static/js/" + f, "utf8");
  if (s.includes("OfficeBuilding") || s.includes("School") || s.includes("Management")) {
    console.log("found in", f);
  }
}

// Element plus default button height - check global CSS
const g = fs.readFileSync("apps/home/mirror/static/css/index-wJISaRHc.css", "utf8");
const bm = g.match(/\.el-button--default[^{]*\{[^}]+\}/);
console.log("\ndefault btn", bm && bm[0].slice(0, 200));
const bh = g.match(/--el-button-size:[^;]+/);
console.log("btn size var", bh);
const bh2 = g.match(/\.el-button\s*\{[^}]{0,300}\}/);
console.log("el-button", bh2 && bh2[0].slice(0, 250));
