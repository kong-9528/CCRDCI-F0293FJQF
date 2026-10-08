const fs = require("fs");
const file = "apps/home/mirror/static/js/index-CsmZrPeY.js";
let s = fs.readFileSync(file, "utf8");

const old =
  'jt.value?(u(),c("div",{key:0,class:"status-badge-wrap"},[a("span",{class:"status-tag approved"},"已开通")])):kt.value?(u(),c("div",{key:1,class:"status-badge-wrap"},[a("span",{class:"status-tag reviewing"},"审核中")])):lt.value?(u(),c("div",{key:2,class:"status-badge-wrap"},[a("span",{class:"status-tag rejected"},"未通过")])):mt.value?(u(),c("div",{key:3,class:"status-badge-wrap"},[a("span",{class:"status-tag withdrawn"},"已撤回")])):N("",!0)';

const neu =
  'jt.value?(u(),c("div",{key:0,class:"status-badge-wrap"},[a("span",{class:"status-tag approved"},"已开通")])):kt.value?(u(),c("div",{key:1,class:"status-badge-wrap"},[a("span",{class:"status-tag auditing"},"审核中")])):lt.value?(u(),c("div",{key:2,class:"status-badge-wrap"},[a("span",{class:"status-tag rejected"},"未通过")])):mt.value?(u(),c("div",{key:3,class:"status-badge-wrap"},[a("span",{class:"status-tag revoked"},"已撤回")])):(u(),c("div",{key:4,class:"status-badge-wrap"},[a("span",{class:"status-tag not-opened"},"未开通")]))';

if (!s.includes(old)) {
  console.error("badge block NOT FOUND");
  // show nearby
  const i = s.indexOf("status-tag reviewing");
  console.log(s.slice(i - 120, i + 350));
  process.exit(1);
}
s = s.replace(old, neu);
fs.writeFileSync(file, s);
console.log("OK tech card 未开通 badge");
