const fs = require("fs");
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/";
const js = fs.readFileSync(dir + "static/js/index-D_FAjFVe.js", "utf8");

for (const n of ["s[2]", "s[3]", "s[4]", "hero-icon"]) {
  console.log(n, (js.match(new RegExp(n.replace("[", "\\[").replace("]", "\\]"), "g")) || []).length);
}

// find css for hero-icon
for (const f of fs.readdirSync(dir + "static/css")) {
  const css = fs.readFileSync(dir + "static/css/" + f, "utf8");
  if (css.includes("hero-icon") && css.includes("dashboard-container")) {
    const i = css.indexOf("hero-icon");
    console.log("css", f, css.slice(i - 20, i + 300));
  }
}

const png = dir + "static/png/dci-logo-mark.png";
console.log("png exists", fs.existsSync(png), fs.existsSync(png) ? fs.statSync(png).size : 0);
