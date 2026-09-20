import fs from "fs";

const main = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);

const idx = main.indexOf("register-CvP1VOMb");
console.log("register in mapDeps area:", main.slice(idx - 80, idx + 120));

// find route definition for /register
const r = main.indexOf('path:"/register"');
console.log("\nroute:", main.slice(r, r + 250));

const r2 = main.indexOf("register-CvP1VOMb.js");
console.log("\nall occurrences:");
let i = 0;
while ((i = main.indexOf("register-CvP1VOMb", i)) >= 0) {
  console.log(main.slice(i - 60, i + 100));
  i += 10;
}
