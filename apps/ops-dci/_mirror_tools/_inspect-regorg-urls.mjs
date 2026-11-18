import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("apps/ops-dci/mirror/static/js");
for (const f of ["pending-CPU4DaaD.js", "all-P_iaY6f_.js", "my-REeFPyN8.js"]) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  console.log("\n====", f);
  let idx = 0;
  let n = 0;
  while ((idx = t.indexOf("regorg", idx)) >= 0 && n < 12) {
    console.log(t.slice(Math.max(0, idx - 70), idx + 90).replace(/\s+/g, " "));
    idx += 6;
    n += 1;
  }
  idx = 0;
  n = 0;
  while ((idx = t.indexOf("myList", idx)) >= 0 && n < 8) {
    console.log("myList:", t.slice(Math.max(0, idx - 70), idx + 90).replace(/\s+/g, " "));
    idx += 6;
    n += 1;
  }
}

const idxFile = fs.readFileSync(path.join(dir, "index-DsYmzmNg.js"), "utf8");
let i = 0;
let c = 0;
console.log("\n==== index myList/regorg/list");
while ((i = idxFile.indexOf("/dci/regorg", i)) >= 0 && c < 20) {
  console.log(idxFile.slice(i, i + 80).replace(/\s+/g, " "));
  i += 10;
  c += 1;
}
