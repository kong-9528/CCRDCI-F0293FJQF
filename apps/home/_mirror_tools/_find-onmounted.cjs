const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");
// st as e — find onMounted
const i = s.indexOf("function st(");
console.log("function st", i);
if (i >= 0) console.log(s.slice(i, i + 200));
const j = s.indexOf("st=function");
console.log("st=function", j);
// onMounted typically
let idx = s.indexOf("onMounted");
console.log("onMounted string", idx);
// Common pattern: const st = (fn) => ...
const k = s.search(/st\s*=\s*[A-Za-z0-9_$]+/);
console.log("st assign near", s.slice(1290000, 1290200));
// Look at createHooks
const m = s.match(/onMounted[=:]([A-Za-z0-9_$]+)/);
console.log("onMounted bind", m && m[0]);
const n = s.match(/([A-Za-z0-9_$]+)\s*=\s*z[A-Za-z]?\(\"bm\"\)/); // before mount inject
console.log(s.slice(s.indexOf(',"bm"'), s.indexOf(',"bm"')+80));
const o = s.indexOf('createHook("bm")');
const p = s.indexOf('createHook("m")');
console.log("hooks", o, p, o>=0?s.slice(o-40,o+80):"", p>=0?s.slice(p-40,p+80):"");
