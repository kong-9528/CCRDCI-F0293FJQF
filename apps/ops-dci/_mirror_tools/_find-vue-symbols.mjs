import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ops = fs.readFileSync(
  path.join(__dirname, "../mirror/static/js/index-DsYmzmNg.js"),
  "utf8",
);
const exp = Object.fromEntries(
  ops
    .match(/export\{([^}]+)\}/)[1]
    .split(",")
    .map((p) => {
      const [a, b] = p.split(" as ");
      return [a.trim(), (b || a).trim()];
    }),
);

for (const pat of ["v-fgt", "v-cmt", "v-txt", "Fragment", "Text,", "Comment,"]) {
  const i = ops.indexOf(pat);
  console.log(pat, i, i >= 0 ? ops.slice(Math.max(0, i - 60), i + 80).replace(/\n/g, " ") : "");
}

// withKeys
{
  const i = ops.indexOf("_withKeys");
  console.log("withKeys ctx", ops.slice(i - 80, i + 120).replace(/\n/g, " "));
  // find nearby function assigned / const On=
}

// renderList distinctive
for (const pat of [
  "isString(e)",
  "Number(e)",
  "isArray(e)",
  ".length;n++",
]) {
  // skip
}

// Find: function that iterates for renderList - look for exported pd (Y)
console.log("pd export", exp.pd, "fe export", exp.fe, "Be export", exp.Be, "At export", exp.At);
console.log("he export", exp.he, "RS export", exp.RS, "Fr export", exp.Fr, "J6 export", exp.J6);

// Search createElementVNode / createBaseVNode patterns used by bizConsult h=N
console.log("N local is", [...Object.entries(exp)].filter(([, v]) => v === "h"));

// Look at pending for renderList letter: Y as ka (pd)
// Search ops around "function" near renderList usage in a page
const pending = fs.readFileSync(
  path.join(__dirname, "../mirror/static/js/pending-CPU4DaaD.js"),
  "utf8",
);
// find renderList usage: often `c(n(P)` or `Y(`
const m = pending.match(/Y as (\w+)/);
console.log("pending Y alias", m);

// In bizConsult, is renderList used?
const biz = fs.readFileSync(
  path.join(__dirname, "../mirror/static/js/index-BP2abaoZ.js"),
  "utf8",
);
console.log("biz head", biz.slice(0, 200));
console.log("biz has renderList-like F", /\bF\(/.test(biz.slice(0, 5000)));

// Find computed: live is (e,t)=>bn(e,t,jc)
// ops often: (e,t)=>xx(e,t,yy) exported
const comp = [...ops.matchAll(/(\w+)=\(e,t\)=>\w+\(e,t,\w+\)/g)].slice(0, 10);
console.log(
  "computed-like assigns",
  comp.map((x) => x[0] + " => " + exp[x[1]]),
);

// onMounted: gt as G - good
// Fragment: in Vue 3.5 might be Symbol.for("v-fgt")
const frag = [...ops.matchAll(/(\w+)=Symbol\.for\([\"']v-fgt[\"']\)/g)];
console.log("frag for", frag);
const frag2 = [...ops.matchAll(/(\w+)=Symbol\([\"']v-fgt[\"']\)/g)];
console.log("frag2", frag2);

// vShow: name:"show" with beforeMount
const vs = ops.indexOf('name:"show"');
console.log("vShow area", ops.slice(vs - 100, vs + 200));
// find const Ft= or Ft=
const before = ops.lastIndexOf("=", vs);
const nameStart = ops.lastIndexOf(",", vs);
console.log("nearby assign", ops.slice(vs - 200, vs - 50));
