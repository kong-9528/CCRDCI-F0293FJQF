import fs from "node:fs";

const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const needle = 'path:"/dci/codeManage-details"';
const i = s.indexOf(needle);
console.log("route idx", i);
console.log(s.slice(i, i + 1500));

const markers = [
  "filterDynamicRoutes",
  "codeManageDetails:query",
  "dci:codeManage:list",
  "auth.hasPermiOr",
  "hasPermiOr",
];
for (const m of markers) {
  const j = s.indexOf(m);
  console.log("\nmarker", m, j);
  if (j >= 0) console.log(s.slice(Math.max(0, j - 60), j + 350));
}

for (const f of [
  "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
  "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
  "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
]) {
  const t = fs.readFileSync(f, "utf8");
  const k = t.indexOf('icon:"View"');
  console.log("\n====", f);
  console.log(t.slice(k - 50, k + 280));
}
