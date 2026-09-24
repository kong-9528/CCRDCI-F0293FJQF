const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");

// From export: st as e
// Find ",st=" or "st=" as declaration of lifecycle
const hits = [];
let idx = 0;
while ((idx = s.indexOf("st=", idx)) >= 0 && hits.length < 30) {
  const ctx = s.slice(Math.max(0, idx - 30), idx + 60);
  if (/^[,\n;{]/.test(s[idx - 1] || ",") || s.slice(idx - 6, idx).includes("const") || s.slice(idx - 4, idx).includes("let ") || s.slice(idx - 4, idx) === "var ") {
    hits.push([idx, ctx]);
  }
  // also catch ,st=
  idx += 3;
}
console.log("sample st=", hits.slice(0, 15).map(h => h[1]));

// Vue injectHook pattern
const patterns = ["injectHook", "bfu", "bu=", '"m"', "LifecycleHooks"];
for (const p of patterns) {
  const i = s.indexOf(p);
  console.log(p, i, i >= 0 ? s.slice(i, i + 100) : "");
}

// original identity used: e as k for onMounted - and k(()=>...)
// export st as e — search export again for st
const exp = s.slice(s.lastIndexOf("export{"));
const m = exp.match(/([^,{}]+) as e,/);
console.log("e export from", m && m[1]);
const name = m && m[1];
if (name) {
  const re = new RegExp(`(?:function |const |let |var |,)${name}(=|\\()`);
  const mi = s.search(re);
  console.log("def", mi, s.slice(mi, mi + 150));
}
