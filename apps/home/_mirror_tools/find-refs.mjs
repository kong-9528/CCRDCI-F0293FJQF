import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// find W=c and te=c ne=c
for (const pat of ["W=c(", "te=c(", "ne=c(", "Wt=", ",W=", "forgotForm"]) {
  const i = t.indexOf(pat);
  console.log(pat, i, i >= 0 ? t.slice(Math.max(0, i - 30), i + 50) : "");
}

const start = t.indexOf('_.value==="forgot"?(v(),h(j,{key:2}');
const end = t.indexOf('去登录")])],64)):G("",!0)', start) + '去登录")])],64)):G("",!0)'.length;
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_forgot-ui-full.txt",
  t.slice(start, end),
  "utf8",
);
console.log("full ui len", end - start);
