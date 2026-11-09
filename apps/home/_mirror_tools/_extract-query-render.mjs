import fs from "node:fs";

const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");

// Extract result list render region
const start = s.indexOf('result-logo');
console.log("==== result region ====");
console.log(s.slice(start - 400, start + 2200));

// Find CSS for result
const cssFiles = fs.readdirSync("apps/home/mirror/static/css").filter((f) => f.includes("index") || f.includes("BZ7") || f.includes("query"));
console.log("\ncss candidates", cssFiles);

// Also search for result-status / result-card in all css
import { execSync } from "node:child_process";
try {
  const out = execSync('rg -l "result-logo|result-status|query-result" apps/home/mirror/static --glob "*.css"', { encoding: "utf8" });
  console.log("css hits:\n", out);
} catch (e) {
  console.log("rg fail", e.message);
}

// Find style block inside js
const styleIdx = s.indexOf(".result-logo");
console.log("\n==== style in js? ====", styleIdx);
if (styleIdx > 0) console.log(s.slice(styleIdx - 50, styleIdx + 800));
