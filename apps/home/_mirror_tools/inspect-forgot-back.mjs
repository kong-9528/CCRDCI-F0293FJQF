import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

console.log("Ue:", t.slice(t.indexOf("function Ue()"), t.indexOf("function Ue()") + 80));
console.log("me:", t.slice(t.indexOf("function me()"), t.indexOf("function me()") + 280));

const i = t.indexOf("forgot-back-link");
console.log("\nback:\n", t.slice(i - 80, i + 200));

const j = t.indexOf("forgot-step-actions");
console.log("\nactions:\n", t.slice(j - 20, j + 350));

const k = t.indexOf("记起密码了");
console.log("\nfooter:\n", t.slice(k - 100, k + 150));
