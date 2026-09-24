const fs = require("fs");
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/";
const js = fs.readFileSync(dir + "static/js/index-D_FAjFVe.js", "utf8");

console.log("HEAD", js.slice(0, 500));
const i = js.indexOf("DCI数字版权唯一标识符");
console.log("\nCONTEXT", js.slice(i - 400, i + 200));

// find related class names nearby
const classMatch = js.slice(Math.max(0, i - 800), i).match(/class:"[^"]+"/g);
console.log("\nclasses", classMatch);

// css for this chunk
const cssFiles = fs.readdirSync(dir + "static/css").filter((f) => f.endsWith(".css"));
for (const f of cssFiles) {
  const css = fs.readFileSync(dir + "static/css/" + f, "utf8");
  if (css.includes("hero-title") && css.includes("构建可信")) {
    console.log("css file", f);
  }
  if (css.includes("DCI数字") || (css.includes("hero-badge") && css.includes("dashboard"))) {
    console.log("maybe", f);
  }
}

// search css for classes around the icon row
for (const f of cssFiles) {
  const css = fs.readFileSync(dir + "static/css/" + f, "utf8");
  if (css.includes("hero-brand") || css.includes("brand-tag") || css.includes("logo-check")) {
    console.log("hit", f);
  }
}
