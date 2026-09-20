import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const start = t.indexOf('h2",{class:"reg-title"},"找回密码"');
console.log(t.slice(start, start + 3200));

console.log("\n\n==== me / ie / Pe / Se / i model ====\n");
for (const k of ["function me()", "function ie()", "function Pe", "Se=H(", "const i=", "i=c(", "forgotStep", "Ve=", "rules:Se"]) {
  const i = t.indexOf(k);
  console.log("\n>>", k, i);
  if (i >= 0) console.log(t.slice(i, i + 450));
}

// find i model init
const mi = t.indexOf("phoneNumber:\"\"");
console.log("\nmodel around", t.slice(mi - 80, mi + 250));
