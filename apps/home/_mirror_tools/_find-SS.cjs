const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");

// SS is exported as ae - find function SS or const SS=
const patterns = ["function SS(", "SS=function", "SS=D(", "const SS=", "SS=e=>", "function SS"];
for (const p of patterns) {
  const i = s.indexOf(p);
  console.log(p, i);
  if (i >= 0) console.log(s.slice(i, i + 400));
}

// Also look near orgPayload mock for nme/SS
const i = s.indexOf("orgPayload(mu)");
console.log("\norgPayload contexts:");
let idx = 0, c = 0;
while ((idx = s.indexOf("orgPayload(mu)", idx)) >= 0 && c < 5) {
  console.log("---", idx);
  console.log(s.slice(idx - 250, idx + 150));
  idx += 10;
  c++;
}

// Find SS= near 1292000
console.log("\naround 1292000", s.slice(1291900, 1292300));
