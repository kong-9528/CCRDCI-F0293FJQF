import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// find render function args near forgot
const i = t.indexOf('_.value==="forgot"');
console.log("before forgot branch:\n", t.slice(i - 200, i + 50));

// search return ( 
const r = t.lastIndexOf("return (", i);
console.log("\nreturn:\n", t.slice(r, r + 150));

// setup return render
const s = t.indexOf("setup(");
console.log("\nsetup start area has i=c", t.slice(4100, 4300));

// e[61] usages
let idx = 0,
  n = 0;
while ((idx = t.indexOf("e[61]", idx)) >= 0 && n < 8) {
  console.log("e61@", idx, t.slice(idx, idx + 90));
  idx += 5;
  n++;
}

// ae.value - strongPwd for newPassword - when concat on step2
const ae = t.indexOf("ae.value");
console.log("\nae:", t.slice(ae - 40, ae + 80));
const aeDef = t.indexOf("ae=");
console.log("ae def", t.slice(aeDef, aeDef + 80));
