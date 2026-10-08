const fs = require("fs");
const file = "apps/home/mirror/static/js/index-CsmZrPeY.js";
let s = fs.readFileSync(file, "utf8");

const regOld =
  'j.value?(u(),c("span",_a,"已通过")):(u(),c("span",Da,"未开通"))';
const regNew =
  'j.value?(u(),c("span",_a,"已开通")):(u(),c("span",Da,"未开通"))';

const techOld = 'a("span",{class:"status-tag approved"},"已通过")';
const techNew = 'a("span",{class:"status-tag approved"},"已开通")';

if (!s.includes(regOld)) {
  console.error("REG badge NOT FOUND");
  process.exit(1);
}
if (!s.includes(techOld)) {
  console.error("TECH badge NOT FOUND");
  process.exit(1);
}

s = s.replace(regOld, regNew).replace(techOld, techNew);
fs.writeFileSync(file, s);

const left = (s.match(/已通过/g) || []).length;
const opened = (s.match(/已开通/g) || []).length;
console.log("OK open-manage labels: 已通过=", left, "已开通=", opened);
