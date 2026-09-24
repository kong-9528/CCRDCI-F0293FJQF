const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DTpd2dgU.js", "utf8");
// find 4th interface in O
const markers = ["撤销", "revoke", "id:4", "id:3"];
for (const m of markers) {
  let idx = 0, c = 0;
  while ((idx = s.indexOf(m, idx)) >= 0 && c < 3) {
    if (idx > 5000 && idx < 20000) {
      console.log("---", m, idx, "---");
      console.log(JSON.stringify(s.slice(idx - 80, idx + 160)));
    }
    idx += m.length;
    c++;
  }
}
// find end of O array
const oStart = s.indexOf("O=[{id:");
const oEnd = s.indexOf("}];function U", oStart);
console.log("O length", oEnd - oStart);
console.log("O tail", s.slice(oEnd - 400, oEnd + 20));
