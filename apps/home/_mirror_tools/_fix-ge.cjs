const fs = require("fs");
const file = "apps/home/mirror/static/js/index-CsmZrPeY.js";
let s = fs.readFileSync(file, "utf8");
const i = s.indexOf("function ge()");
console.log("ge now:", s.slice(i, i + 200));
const old =
  'function ge(){try{window.__DCI_TECH_APPLY__&&window.__DCI_TECH_APPLY__.unmount()}catch(e){}_.value="list",se(),refreshTech()}';
const neu =
  'function ge(){_.value="list";se();refreshTech()}';
if (s.includes(neu)) {
  console.log("already good");
} else if (s.includes(old)) {
  s = s.replace(old, neu);
  fs.writeFileSync(file, s);
  console.log("patched");
} else if (s.includes('function ge(){_.value="list"')) {
  // maybe partial
  console.log("partial?", s.slice(i, i + 180));
} else {
  // force replace any ge() body start
  const m = s.match(/function ge\(\)\{[^}]+\}/);
  console.log("matched", m && m[0]);
  if (m) {
    s = s.replace(m[0], neu);
    fs.writeFileSync(file, s);
    console.log("force patched");
  }
}
