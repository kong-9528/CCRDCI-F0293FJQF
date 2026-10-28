import fs from "node:fs";

function extractAround(s, needle, before = 200, after = 500) {
  const i = s.indexOf(needle);
  if (i < 0) return null;
  return s.slice(Math.max(0, i - before), i + after);
}

for (const f of [
  "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
  "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
  "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
]) {
  const s = fs.readFileSync(f, "utf8");
  console.log("\n========", f);
  console.log("--- export btn ---");
  console.log(extractAround(s, "export-btn", 80, 280));
  console.log("--- applyDoc/export ---");
  console.log(extractAround(s, "/dci/applyDoc/export", 200, 200));
  // find onClick function that downloads
  const m = s.match(/function \w+\(\)\{[^}]{0,40}h\.value=!0[\s\S]{0,400}?applyDoc\/export[\s\S]{0,300}?\}/);
  console.log("--- export fn ---", m ? m[0] : "not found");
  // simpler: search for Download
  console.log("--- Download context ---");
  console.log(extractAround(s, 'icon:"Download"', 300, 200));
}

// How was detail perm removed? look for withDirectives patterns that were unwrapped
const soft = fs.readFileSync("apps/ops-dci/mirror/static/js/soft-D-V6yNun.js", "utf8");
console.log("\n--- soft detail button ---");
console.log(extractAround(soft, "详情", 250, 100));

const opus = fs.readFileSync("apps/ops-dci/mirror/static/js/opus-DCRymxdq.js", "utf8");
console.log("\n--- opus export btn (no perm) ---");
console.log(extractAround(opus, "opus-export-btn", 200, 200));

// M8e download helper
const idx = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const m8 = idx.indexOf("M8e=");
console.log("\nM8e at", m8, m8 >= 0 ? idx.slice(m8, m8 + 600) : "");
// also try function M8e
const m8b = idx.search(/M8e\s*=\s*(async\s*)?function|function M8e|const M8e=/);
console.log("M8e search", m8b, m8b >= 0 ? idx.slice(m8b, m8b + 500) : "");

// codeManage API export
const cm = fs.readFileSync("apps/ops-dci/mirror/static/js/codeManage-CIC4UakA.js", "utf8");
console.log("\ncodeManage file:", cm.slice(0, 1500));
