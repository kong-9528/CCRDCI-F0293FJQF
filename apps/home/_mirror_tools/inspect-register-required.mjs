import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

const i = t.indexOf("E=N(()=>({");
console.log("RULES:\n", t.slice(i, i + 700));

const j = t.indexOf("reg-submit-btn");
console.log("\nSUBMIT:\n", t.slice(j - 120, j + 180));

const k = t.indexOf("function S()");
console.log("\nSUBMIT FN:\n", t.slice(k, k + 350));

const a = t.indexOf("strongPwdValidator");
console.log("\npwd validator around:", t.slice(a - 40, a + 80));
