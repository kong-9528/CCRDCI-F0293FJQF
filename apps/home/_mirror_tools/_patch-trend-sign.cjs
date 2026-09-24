const fs = require("fs");
const p = "apps/home/mirror/static/js/statistics-D1aA8P2b.js";
let s = fs.readFileSync(p, "utf8");

const pairs = [
  ['Zt("span",oY,"12%",-1)', 'Zt("span",oY,"+12%",-1)'],
  ['Zt("span",uY,"8%",-1)', 'Zt("span",uY,"+8%",-1)'],
  ['s.value="12%"', 's.value="+12%"'],
  ['f.value="8%"', 'f.value="+8%"'],
];

for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.error("missing:", a);
    // show nearby
    if (a.includes("oY")) {
      const i = s.indexOf('Zt("span",oY');
      console.error(JSON.stringify(s.slice(i, i + 40)));
    }
    if (a.includes("uY")) {
      const i = s.indexOf('Zt("span",uY');
      console.error(JSON.stringify(s.slice(i, i + 40)));
    }
    process.exit(1);
  }
  s = s.replace(a, b);
  console.log("ok", b);
}

fs.writeFileSync(p, s);
console.log("done");
