import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

for (const id of [58, 59, 60, 61, 62, 63, 64, 65]) {
  const re = new RegExp(`e\\[${id}\\]`, "g");
  const n = (t.match(re) || []).length;
  console.log(`e[${id}] x${n}`);
  let idx = 0,
    c = 0;
  while ((idx = t.indexOf(`e[${id}]`, idx)) >= 0 && c < 4) {
    console.log(" ", t.slice(idx, idx + 70).replace(/\n/g, " "));
    idx += 5;
    c++;
  }
}

// Also check ae for strong password - forgot uses ae.value in Se
const i = t.indexOf("strongPwd");
const j = t.indexOf("ae=");
const k = t.indexOf(",ae=");
console.log("\nstrongPwd", i);
// find registerPwd or strongPwd assignment to ae
const m = t.match(/ae=[^,;]+/);
console.log("ae assign", m && m[0]);
const m2 = t.match(/\{[^}]*strongPwdValidator[^}]*\}/);
console.log("destructure", t.slice(t.indexOf("Ge()"), t.indexOf("Ge()") + 120));
