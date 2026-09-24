const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");
const css = fs.readFileSync("apps/home/mirror/static/css/index-wJISaRHc.css", "utf8");

// All topmenu-container CSS occurrences with context
let idx = 0;
let c = 0;
while ((idx = css.indexOf("topmenu-container", idx)) >= 0 && c < 20) {
  console.log("\n=== CSS hit", c, "at", idx);
  console.log(css.slice(Math.max(0, idx - 80), idx + 350));
  idx += 17;
  c++;
}

idx = 0;
c = 0;
while ((idx = css.indexOf("topbar-menu", idx)) >= 0 && c < 15) {
  console.log("\n=== topbar-menu", c, "at", idx);
  console.log(css.slice(Math.max(0, idx - 40), idx + 300));
  idx += 11;
  c++;
}

// Find s4e component definition - search near topmenu-container in JS
idx = s.indexOf('id:"topmenu-container"');
console.log("\n=== JS topmenu usage");
console.log(s.slice(idx - 200, idx + 300));

// Find TopNav / TopBar component
const names = [];
const re = /__name:"([^"]+)"/g;
let m;
while ((m = re.exec(s))) {
  if (/nav|Nav|layout|Layout|side|Side|bar|Bar|menu|Menu/i.test(m[1]) && !/icon|Icon|el-|El/.test(m[1])) {
    names.push([m[1], m.index]);
  }
}
console.log("\n=== relevant component names");
console.log(names.slice(0, 80).map(([n, i]) => n + "@" + i).join("\n"));

// navType default
idx = s.indexOf("navType");
c = 0;
while ((idx = s.indexOf("navType", idx)) >= 0 && c < 8) {
  console.log("\nnavType@", idx, s.slice(idx - 60, idx + 120));
  idx += 7;
  c++;
}
