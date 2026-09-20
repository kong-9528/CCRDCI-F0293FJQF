import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const start = t.indexOf('_.value==="forgot"?(v(),h(j,{key:2}');
console.log("start", start);

// Find 记起密码
const footer = t.indexOf("记起密码了", start);
console.log("footer", footer, t.slice(footer - 50, footer + 200));

// What comes after footer
console.log("\nafter footer 200:", t.slice(footer + 100, footer + 350));
