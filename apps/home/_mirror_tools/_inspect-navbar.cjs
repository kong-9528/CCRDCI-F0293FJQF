const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");

for (const needle of ["top-console-nav", "top-nav-item", "navbar-center", "dci-navbar"]) {
  let idx = 0;
  let c = 0;
  console.log("\n====", needle, "count", (s.split(needle).length - 1));
  while ((idx = s.indexOf(needle, idx)) >= 0 && c < 5) {
    console.log("---", idx);
    console.log(s.slice(Math.max(0, idx - 100), idx + 280));
    idx += needle.length;
    c++;
  }
}

// Find render around dci-navbar class object
const i = s.indexOf('class:"dci-navbar"');
console.log("\n==== render chunk");
console.log(s.slice(i, i + 3500));
