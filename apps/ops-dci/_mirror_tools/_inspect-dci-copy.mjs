import fs from "node:fs";

for (const [name, file] of [
  ["opus", "opus-DCRymxdq.js"],
  ["soft", "soft-D-V6yNun.js"],
  ["dataset", "dataset-cXmRoDti.js"],
]) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${file}`, "utf8");
  console.log("\n====", name, "====");
  const i = s.indexOf('label:"DCI码"');
  console.log(i >= 0 ? s.slice(i, i + 450) : "no DCI码 col");
  console.log("DocumentCopy:", s.includes("DocumentCopy"));
  console.log("复制DCI:", s.includes("复制DCI") || s.includes("已复制"));
  // find copy helper
  const m = s.match(/function [A-Z]\([^)]*\)\{[^}]{0,200}clipboard[^}]{0,200}\}/);
  console.log("clipboard fn:", m ? m[0] : "none");
  const m2 = s.match(/async function [A-Z]\([^)]*\)\{[^}]{0,300}复制[^}]{0,100}\}/);
  console.log("copy async:", m2 ? m2[0] : "scan");
  const idxs = [...s.matchAll(/DocumentCopy|clipboard|已复制/g)].map((x) => x.index);
  console.log("hit idxs", idxs.slice(0, 5));
  for (const idx of idxs.slice(0, 3)) {
    console.log("---", s.slice(Math.max(0, idx - 80), idx + 120));
  }
}
