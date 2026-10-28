import fs from "node:fs";
const soft = fs.readFileSync("apps/ops-dci/mirror/static/js/soft-D-V6yNun.js", "utf8");
// table column 状态 (second occurrence after filter)
let from = 0;
let n = 0;
while (n < 5) {
  const i = soft.indexOf('label:"状态"', from);
  if (i < 0) break;
  n++;
  console.log("\n#", n, soft.slice(i, i + 450));
  from = i + 10;
}
// Y usage - S as Y from utils is status map ae
const yi = soft.indexOf("Y[");
console.log("\nY[", soft.slice(yi, yi + 80));
const yi2 = soft.indexOf("ne(Y");
const yi3 = soft.indexOf("O(Y");
console.log("ne(Y", soft.slice(yi2, yi2 + 80));
console.log("O(Y", soft.slice(yi3, yi3 + 80));
// look for l(Y) or Y,
const m = [...soft.matchAll(/\bY\b/g)].slice(0, 15);
console.log(
  "Y contexts",
  m.map((x) => soft.slice(x.index - 5, x.index + 40)),
);
