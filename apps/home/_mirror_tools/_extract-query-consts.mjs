import fs from "node:fs";
const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");

// Find class object constants near result
const markers = ["result-head", "result-code", "result-body", "result-table-wrap", "result-grid", "cell-value", "result-card", "result-title", "result-empty", "search-input"];
for (const m of markers) {
  const i = s.indexOf(`"${m}"`);
  console.log(m, i);
  if (i >= 0) console.log(s.slice(Math.max(0, i - 60), i + 80));
}

// Find where const blocks for classes are - typically before $e=G
const before = s.lastIndexOf("const ", s.indexOf("$e=G({"));
// walk back for a chunk of const class defs
const chunkStart = s.lastIndexOf("const Ue=", s.indexOf("$e=G({"));
console.log("\nchunkStart Ue", chunkStart);
console.log(s.slice(chunkStart, s.indexOf("$e=G({")));
