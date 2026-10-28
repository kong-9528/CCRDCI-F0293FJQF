import fs from "node:fs";
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
// Find export block at end
const m = s.match(/export\{([^}]+)\}/);
if (!m) {
  console.log("no export block");
  process.exit(1);
}
const exports = m[1].split(",").map((x) => x.trim());
const need = ["d", "r", "x", "w", "G", "f", "o", "c", "h", "i", "n", "_", "a8", "u", "a", "a6"];
for (const k of need) {
  const hit = exports.find((e) => e === k || e.endsWith(" as " + k) || e.startsWith(k + " as"));
  console.log(k, hit || "MISSING");
}
