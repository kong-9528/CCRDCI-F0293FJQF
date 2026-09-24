const fs = require("fs");
const s = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);
const needles = ["sidebar-logo", "logo-title", "class:\"logo\"", "logo-container", "svg-icon"];
for (const n of needles) {
  let i = s.indexOf(n);
  let c = 0;
  while (i !== -1 && c < 2) {
    console.log("---", n, i);
    console.log(s.slice(Math.max(0, i - 60), i + 180));
    i = s.indexOf(n, i + 1);
    c++;
  }
}
