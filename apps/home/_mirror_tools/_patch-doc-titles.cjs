/**
 * Align doc module page titles with identity (icon + 16px header-title).
 */
const fs = require("fs");
const p = "apps/home/mirror/static/js/index-DTpd2dgU.js";
let s = fs.readFileSync(p, "utf8");

if (!s.includes('ce={class:"panel-title"}')) {
  console.error("ce const missing");
  process.exit(1);
}
s = s.replace('ce={class:"panel-title"}', 'ce={class:"card-header panel-header"}');

const oldTitle = 'n("h2",ce,d(L.value),1)';
const newTitle =
  'n("div",ce,[n("div",{class:"header-left"},[n("div",{class:"header-icon-wrapper"},[n("svg",{viewBox:"0 0 24 24",width:"18",height:"18",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true"},[n("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),n("path",{d:"M14 2v6h6"}),n("path",{d:"M8 13h8"}),n("path",{d:"M8 17h5"})])]),n("span",{class:"header-title"},d(L.value),1)])])';

if (!s.includes(oldTitle)) {
  console.error("title render missing");
  process.exit(1);
}
s = s.replace(oldTitle, newTitle);
fs.writeFileSync(p, s);
console.log("doc title structure updated");
