import fs from "node:fs";

for (const [name, file] of [
  ["opus", "opus-DCRymxdq.js"],
  ["soft", "soft-D-V6yNun.js"],
  ["dataset", "dataset-cXmRoDti.js"],
]) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${file}`, "utf8");
  console.log("\n====", name, "====");
  const push = [...s.matchAll(/\.push\(\{path:`[^`]+`[^}]*\}/g)].map((m) => m[0]);
  console.log("push paths:", push);
  const detailIdx = s.indexOf('f("详情"');
  console.log("详情 idx", detailIdx);
  if (detailIdx >= 0) console.log(s.slice(detailIdx - 120, detailIdx + 80));
  // find operation column
  const op = s.indexOf('label:"操作"');
  console.log("操作 col:", op >= 0 ? s.slice(op, op + 500) : "NONE");
  // find any View icon buttons
  const views = [...s.matchAll(/icon:"View"[^}]{0,120}/g)].map((m) => m[0]);
  console.log("View icons:", views);
}
