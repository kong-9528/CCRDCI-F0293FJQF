import fs from "node:fs";

for (const f of ["soft-D-V6yNun.js", "dataset-cXmRoDti.js"]) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${f}`, "utf8");
  const i = s.indexOf('icon:"View"');
  console.log("\n====", f, "====");
  console.log(s.slice(Math.max(0, i - 40), i + 260));
  console.log(
    "View still gated by query permi:",
    /icon:"View"[\s\S]{0,250}dci:codeManage:query/.test(s),
  );
  console.log("has 详情:", s.includes('f("详情"'));
  try {
    await import(`../mirror/static/js/${f}`);
  } catch (e) {
    // dynamic import of vue bundles may fail; use --check instead
  }
}
import { spawnSync } from "node:child_process";
for (const f of ["soft-D-V6yNun.js", "dataset-cXmRoDti.js"]) {
  const r = spawnSync(
    process.execPath,
    ["--check", `apps/ops-dci/mirror/static/js/${f}`],
    { encoding: "utf8" },
  );
  console.log("check", f, r.status === 0 ? "ok" : r.stderr);
}
