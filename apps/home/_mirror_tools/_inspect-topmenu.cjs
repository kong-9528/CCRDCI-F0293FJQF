const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");
const css = fs.readFileSync("apps/home/mirror/static/css/index-wJISaRHc.css", "utf8");

for (const needle of [
  "topmenu-container",
  "top-menu",
  "TopMenu",
  "topmenu",
  "sidebarRouters",
  "el-menu",
  "navType",
]) {
  console.log(needle, (s.split(needle).length - 1));
}

// Find TopMenu / topmenu component
let idx = s.indexOf('class:"topmenu-container"');
console.log("\nclass topmenu-container at", idx);

// Search for __name:"Top
const re = /__name:"[^"]*[Tt]op[^"]*"/g;
let m;
while ((m = re.exec(s))) {
  console.log("name hit", m[0], "at", m.index);
  console.log(s.slice(m.index, m.index + 400));
}

const re2 = /__name:"[^"]*[Mm]enu[^"]*"/g;
while ((m = re2.exec(s))) {
  if (m[0].includes("Drop") || m[0].includes("Context")) continue;
  console.log("menu name", m[0], "at", m.index);
}

// CSS for topmenu
for (const needle of ["topmenu-container", "top-menu", ".el-menu--horizontal", "sidebar-item"]) {
  const i = css.indexOf(needle);
  console.log("\nCSS", needle, i);
  if (i >= 0) console.log(css.slice(Math.max(0, i - 50), i + 500));
}
