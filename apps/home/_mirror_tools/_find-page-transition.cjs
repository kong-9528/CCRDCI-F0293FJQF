const fs = require("fs");
const css = fs.readFileSync("apps/home/mirror/static/css/index-wJISaRHc.css", "utf8");
const js = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");

const keys = [
  "fade-transform",
  "fade-enter",
  "fade-leave",
  "fade-in",
  "breadcrumb",
  "zoom-fade",
  "slide-fade",
  "el-fade-in",
  "transition-group",
  "name:\"fade",
  "name:'fade",
];

for (const k of keys) {
  const count = css.split(k).length - 1;
  const jcount = js.split(k).length - 1;
  if (count || jcount) console.log(k, "css", count, "js", jcount);
}

// dump fade-transform CSS
let idx = css.indexOf("fade-transform");
while (idx >= 0) {
  console.log("\nCSS@", idx, css.slice(Math.max(0, idx - 20), idx + 280));
  idx = css.indexOf("fade-transform", idx + 1);
  if (idx > 0 && idx - (css.lastIndexOf("fade-transform", idx - 1)) > 5000) break;
}

// find Transition usage near app-main / router-view
idx = js.indexOf("fade-transform");
console.log("\nJS fade-transform@", idx);
if (idx >= 0) console.log(js.slice(idx - 200, idx + 400));

idx = js.indexOf('name:"fade-transform"');
console.log("\nname fade-transform@", idx);
if (idx < 0) {
  // search more broadly
  const re = /fade-[a-zA-Z-]{0,30}/g;
  const set = new Set();
  let m;
  while ((m = re.exec(css))) set.add(m[0]);
  while ((m = re.exec(js))) set.add(m[0]);
  console.log("fade-*", [...set].slice(0, 40));
}
