import fs from "node:fs";
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
for (const name of ["CopyDocument", "DocumentCopy"]) {
  const i = s.indexOf(`name:"${name}"`);
  console.log("\n" + name, i);
  console.log(s.slice(i, i + 600));
}
