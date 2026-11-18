import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const liveVue = path.join(root, "_mirror_tools/_portal_capture/vue.runtime.esm-bundler-BBGdfCsq.js");
const opsIdx = path.join(root, "mirror/static/js/index-DsYmzmNg.js");
const outShim = path.join(root, "mirror/static/js/vue-runtime-ops-shim.js");

// minimal DOM stubs so index-DsYmzmNg can evaluate
const g = globalThis;
if (!g.document) {
  const fakeEl = () => ({
    style: {},
    setAttribute() {},
    getAttribute() { return null; },
    appendChild() {},
    removeChild() {},
    addEventListener() {},
    removeEventListener() {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    childNodes: [],
  });
  g.document = {
    createElement: () => fakeEl(),
    createElementNS: () => fakeEl(),
    createTextNode: () => ({}),
    createComment: () => ({}),
    createDocumentFragment: () => fakeEl(),
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    head: fakeEl(),
    body: fakeEl(),
    documentElement: fakeEl(),
    addEventListener() {},
    removeEventListener() {},
  };
  g.window = g;
  g.navigator = { userAgent: "node" };
  g.location = { href: "http://localhost/", protocol: "http:", host: "localhost" };
  g.HTMLElement = class {};
  g.SVGElement = class {};
  g.MutationObserver = class { observe() {} disconnect() {} };
  g.getComputedStyle = () => new Proxy({}, { get: () => "" });
  g.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  g.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  g.sessionStorage = g.localStorage;
  g.customElements = { define() {}, get() {} };
}

const liveNeeded = [
  "C","D","Dt","E","Lt","N","O","Q","S","W","Y","Z","_t","an","b","ct","d","ft","i","m","q","st","u","x","y","yt",
];

const liveMod = await import(pathToFileURL(liveVue).href);
const opsMod = await import(pathToFileURL(opsIdx).href);

function fingerprint(fn) {
  if (typeof fn !== "function") return "nonfn:" + typeof fn;
  const s = Function.prototype.toString.call(fn);
  return [fn.name || "", s.length, s.slice(0, 100), s.slice(-80)].join("|");
}

const opsByFp = new Map();
for (const [k, v] of Object.entries(opsMod)) {
  if (typeof v !== "function") continue;
  const fp = fingerprint(v);
  if (!opsByFp.has(fp)) opsByFp.set(fp, []);
  opsByFp.get(fp).push(k);
}

const mapping = {};
const missing = [];
for (const key of liveNeeded) {
  const liveVal = liveMod[key];
  if (typeof liveVal !== "function") {
    missing.push(key + ":not-fn");
    continue;
  }
  const hits = opsByFp.get(fingerprint(liveVal)) || [];
  if (!hits.length) {
    // fuzzy: same name + similar length
    const name = liveVal.name;
    const len = Function.prototype.toString.call(liveVal).length;
    const fuzzy = Object.entries(opsMod)
      .filter(([, v]) => typeof v === "function" && v.name === name)
      .map(([k, v]) => ({ k, d: Math.abs(Function.prototype.toString.call(v).length - len) }))
      .sort((a, b) => a.d - b.d);
    if (fuzzy[0] && fuzzy[0].d < 80) {
      mapping[key] = fuzzy[0].k;
      continue;
    }
    missing.push(key);
    mapping[key] = null;
  } else {
    mapping[key] = hits[0];
  }
}

console.log("mapping", mapping);
console.log("missing", missing);

// Manual overrides based on known Vue API usage in nav/article + ops bizConsult aliases
const manual = {
  // live → vue meaning → ops export
  C: "c", // createElementBlock
  D: "i", // createVNode
  Dt: null, // unref — find
  E: "y", // createTextVNode
  Lt: "k", // Fragment? or something called at top
  N: null, // called at top i() — maybe keepShapeFlags / createHydration?
  O: "d", // defineComponent
  Q: "S", // resolveDirective
  S: "n", // createCommentVNode
  W: "G", // onMounted
  Y: null, // renderList
  Z: "f", // resolveComponent
  _t: "D", // reactive
  an: "t", // toDisplayString
  b: "h", // createElementVNode
  ct: "N", // withDirectives
  d: "l", // withKeys
  ft: null, // createCommentVNode? or isRef?
  i: null, // called at top
  m: "k", // Fragment
  q: "o", // openBlock
  st: "j", // withCtx
  u: "T", // vShow
  x: "m", // createBlock
  y: null, // computed
  yt: "r", // ref
};

// find unref, computed, renderList, Fragment more carefully
function findByPred(pred, label) {
  for (const [k, v] of Object.entries(opsMod)) {
    if (typeof v !== "function") continue;
    try {
      if (pred(v, k)) return k;
    } catch {}
  }
  console.log("not found", label);
  return null;
}

// unref: unref(ref(1)) === 1, unref(1) === 1
const opsRef = opsMod.r;
const testR = opsRef(1);
const unrefKey = findByPred((fn) => {
  try { return fn(testR) === 1 && fn(2) === 2; } catch { return false; }
}, "unref");
console.log("unref", unrefKey);

// computed
const computedKey = findByPred((fn) => {
  try {
    const c = fn(() => 1);
    return c && typeof c === "object" && "value" in c && c.value === 1;
  } catch { return false; }
}, "computed");
console.log("computed", computedKey);

// renderList: renderList([1,2], (x,i)=>x) 
const renderListKey = findByPred((fn) => {
  try {
    const out = fn([1, 2], (x) => x * 2);
    return Array.isArray(out) && out[0] === 2 && out[1] === 4;
  } catch { return false; }
}, "renderList");
console.log("renderList", renderListKey);

// Fragment is a symbol or object
let fragKey = null;
for (const [k, v] of Object.entries(opsMod)) {
  if (v && (typeof v === "symbol" || (typeof v === "object" && v !== null))) {
    const s = String(v);
    if (s.includes("Fragment") || (v.__v_isVNode === undefined && v === opsMod.k)) {
      // check
    }
  }
}
// In Vue 3 Fragment is Symbol.for('v-fgt') or an object with a string name
for (const [k, v] of Object.entries(opsMod)) {
  if (typeof v === "symbol" && String(v).includes("Fragment")) fragKey = k;
  if (v && v.toString && v.toString() === "Symbol(v-fgt)") fragKey = k;
}
// also object Fragment
for (const [k, v] of Object.entries(opsMod)) {
  if (v && typeof v === "object" && v.name === "Fragment") fragKey = k;
}
console.log("Fragment", fragKey, "ops.k type", typeof opsMod.k, opsMod.k);

const finalMap = {
  C: "c",
  D: "i",
  Dt: unrefKey || "a$", // guess
  E: "y",
  Lt: fragKey || "k",
  N: "a0", // will probe
  O: "d",
  Q: "S",
  S: "n",
  W: "G",
  Y: renderListKey,
  Z: "f",
  _t: "D",
  an: "t",
  b: "h",
  ct: "N",
  d: "l",
  ft: "n", // createCommentVNode often aliased twice - article uses ft as h() at top
  i: "o", // openBlock? but q is openBlock - the i() at top might be noop helper
  m: fragKey || "k",
  q: "o",
  st: "j",
  u: "T",
  x: "m",
  y: computedKey,
  yt: "r",
};

// Probe the top-level callables i,h,m,Lt from live by arity/name
for (const key of ["i", "ft", "m", "Lt", "N"]) {
  const fn = liveMod[key];
  console.log("live", key, fn?.name, String(fn).slice(0, 150));
}

console.log("finalMap", finalMap);

// Write shim re-exporting from index using live export names
const lines = [`import{${[...new Set(Object.values(finalMap).filter(Boolean))].map((ops, i, arr) => {
  // build unique import
  return null;
}).filter(Boolean)}}`];

const pairs = Object.entries(finalMap).filter(([, v]) => v);
const importMap = new Map(); // opsKey -> liveKeys[]
for (const [live, ops] of pairs) {
  if (!importMap.has(ops)) importMap.set(ops, []);
  importMap.get(ops).push(live);
}

const importParts = [];
const exportParts = [];
let alias = 0;
for (const [opsKey, lives] of importMap) {
  const local = "_v" + alias++;
  importParts.push(`${opsKey} as ${local}`);
  for (const live of lives) {
    exportParts.push(`${local} as ${live}`);
  }
}

const shim = `/* Auto-mapped Vue runtime shim: live portal chunk letters → ops index-DsYmzmNg */\nimport{${importParts.join(",")}}from"./index-DsYmzmNg.js";\nexport{${exportParts.join(",")}};\n`;
fs.writeFileSync(outShim, shim);
console.log("wrote", outShim);
console.log(shim);
