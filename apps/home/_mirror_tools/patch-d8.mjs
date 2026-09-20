import fs from "fs";

const p =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-D8JrnKcV.js";
let t = fs.readFileSync(p, "utf8");

const from = 'function b(i="login"){l.value=i,o.value=!0}';
// find router - look for .push( near setup
const pushHits = [...t.matchAll(/([a-zA-Z_$][\w$]*)\.push\(/g)].map((m) => m[1]);
console.log("push vars", [...new Set(pushHits)]);

// common: const x = useRouter()
const routerMatch = t.match(/([a-zA-Z_$][\w$]*)=([A-Za-z_$][\w$]*)\(\).*?function b\(i="login"\)/s);
console.log("near", t.slice(t.indexOf('function b(i="login")') - 200, t.indexOf('function b(i="login")') + 120));

if (!t.includes(from)) {
  console.log("pattern missing");
  process.exit(1);
}
// Guess router from context - usually early in setup
const setupIdx = t.indexOf("setup(");
const chunk = t.slice(setupIdx, setupIdx + 400);
console.log("setup head", chunk);
