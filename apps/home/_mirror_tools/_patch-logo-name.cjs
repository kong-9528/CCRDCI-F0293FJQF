const fs = require("fs");
const p = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-_fJendd7.js";
let s = fs.readFileSync(p, "utf8");

const old =
  'e("img",{class:"portal-logo cursor-pointer",referrerpolicy:"no-referrer",src:n(W),alt:"DCI",onClick:t[0]||(t[0]=i=>n(s).push("/"))},null,8,$),e("div",ee,[';

const neu =
  'e("img",{class:"portal-logo cursor-pointer",referrerpolicy:"no-referrer",src:n(W),alt:"DCI",onClick:t[0]||(t[0]=i=>n(s).push("/"))},null,8,$),e("span",{class:"portal-logo-name"},"数字版权唯一标识符",-1),e("div",ee,[';

if (!s.includes(old)) {
  console.error("OLD NOT FOUND");
  process.exit(1);
}
if (s.includes('class:"portal-logo-name"')) {
  console.log("already patched");
  process.exit(0);
}
s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("patched ok", s.includes('class:"portal-logo-name"'));
