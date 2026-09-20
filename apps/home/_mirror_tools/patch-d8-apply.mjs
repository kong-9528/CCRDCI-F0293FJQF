import fs from "fs";

const p =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-D8JrnKcV.js";
let t = fs.readFileSync(p, "utf8");
const from = 'function b(i="login"){l.value=i,o.value=!0}';
const to =
  'function b(i="login"){i==="register"?B().push("/register"):(l.value=i,o.value=!0)}';
if (!t.includes(from)) {
  console.log("missing");
  process.exit(1);
}
t = t.replace(from, to);
fs.writeFileSync(p, t);
console.log("patched D8");
