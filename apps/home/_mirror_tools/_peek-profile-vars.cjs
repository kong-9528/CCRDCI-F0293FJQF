const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-CsmZrPeY.js", "utf8");

function countIdent(name) {
  const re = new RegExp("\\b" + name + "\\b", "g");
  return (s.match(re) || []).length;
}
for (const n of ["bt", "kt", "lt", "mt", "jt", "ot", "Zt", "refreshTech", "ge", "se"]) {
  console.log(n, countIdent(n));
}

const ge = s.indexOf("function ge()");
console.log("\nge:", s.slice(ge, ge + 280));

const embed = s.indexOf('_.value==="applyTech"');
console.log("\nembed:", s.slice(embed, embed + 450));

// check if lt/mt collide with existing bindings in setup
const setup = s.indexOf("setup(Ta)");
const slice = s.slice(setup, setup + 2500);
console.log("\nconst decls near start:");
console.log(slice.match(/const [a-zA-Z]+=/g)?.slice(0, 40));
