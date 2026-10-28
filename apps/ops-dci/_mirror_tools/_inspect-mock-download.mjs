import fs from "node:fs";

const s = fs.readFileSync("apps/ops-dci/mirror/static/js/ops-mock-api.js", "utf8");
console.log("len", s.length);
console.log("blob?", s.includes("Blob"), "arraybuffer?", s.includes("arraybuffer"));
console.log("export?", s.includes("export"));
console.log("applyDoc?", [...s.matchAll(/applyDoc\/[^\s"']+/g)].map((x) => x[0]).slice(0, 30));

// How fetch is intercepted - look for Response construction
const idxs = [];
let i = -1;
while ((i = s.indexOf("new Response", i + 1)) >= 0 && idxs.length < 8) idxs.push(i);
console.log(
  "new Response samples",
  idxs.map((p) => s.slice(p, p + 180).replace(/\n/g, " ")),
);

// Look for K1 blob check used by download helper
const idx = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const k1 = idx.search(/function K1|K1=/);
console.log("K1", k1 >= 0 ? idx.slice(k1, k1 + 250) : "no");

// xA transform for form urlencoded
const xa = idx.search(/function xA|xA=/);
console.log("xA", xa >= 0 ? idx.slice(xa, xa + 200) : "no");
