const fs = require("fs");
const p = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-D_FAjFVe.js";
let s = fs.readFileSync(p, "utf8");

const old =
  'a("div",E,[e(n,null,{default:d(()=>[e(t(w))]),_:1}),s[3]||(s[3]=a("span",null,"DCI数字版权唯一标识符",-1))])';
const neu =
  'a("div",E,[a("img",{class:"hero-dci-mark",src:"/static/png/dci-logo-mark.png",alt:"DCI",referrerpolicy:"no-referrer"}),s[3]||(s[3]=a("span",null,"DCI数字版权唯一标识符",-1))])';

if (s.includes("hero-dci-mark")) {
  console.log("already patched");
  process.exit(0);
}
if (!s.includes(old)) {
  console.error("OLD NOT FOUND");
  const i = s.indexOf("DCI数字版权唯一标识符");
  console.log(s.slice(i - 120, i + 60));
  process.exit(1);
}
s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("patched ok");
