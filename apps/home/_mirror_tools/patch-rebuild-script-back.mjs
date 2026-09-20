import fs from "fs";

const p =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/rebuild-forgot-clean.mjs";
let t = fs.readFileSync(p, "utf8");
const a =
  's("span",{class:"forgot-back-link",onMousedown:A(Ue,["prevent","stop"]),onClick:A(Ue,["prevent","stop"])},"上一步")';
const b =
  's("span",{class:"forgot-back-link",onClick:e[96]||(e[96]=r=>Ht(r))},"上一步")';
if (!t.includes(a)) {
  const i = t.indexOf("forgot-back-link");
  console.log("MISS, context:", t.slice(i, i + 220));
  process.exit(1);
}
t = t.split(a).join(b);
fs.writeFileSync(p, t);
console.log("OK rebuild script back→Ht");
