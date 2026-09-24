const fs = require("fs");
const p = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js";
let s = fs.readFileSync(p, "utf8");

const old =
  'a("div",fa,[e[32]||(e[32]=a("div",{class:"row-label"},"已开通",-1)),a("div",ma,k(ot.value),1),e[33]||(e[33]=a("div",{class:"row-action"},null,-1))])';
const neu = 'N("",!0)';

if (!s.includes('row-label"},"已开通"')) {
  console.log("already removed");
  process.exit(0);
}
if (!s.includes(old)) {
  console.error("OLD NOT FOUND");
  const i = s.indexOf("已开通");
  console.log(s.slice(Math.max(0, i - 220), i + 200));
  process.exit(1);
}
s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("removed ok", !s.includes('row-label"},"已开通"'));
