import fs from "node:fs";
import { spawnSync } from "node:child_process";

for (const f of [
  "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
  "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
  "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
]) {
  const s = fs.readFileSync(f, "utf8");
  console.log("\n====", f);
  for (const key of ["caseCategoryCode", "dciStatus", "dciCodeType"]) {
    const i = s.indexOf(`prop:"${key}"`);
    if (i < 0) {
      console.log(key, "absent");
      continue;
    }
    const chunk = s.slice(i, i + 280);
    const cm = chunk.match(/class:"([^"]+)"/);
    console.log(key, "->", cm && cm[1]);
  }
  const exp = s.indexOf("export-btn");
  console.log("export snippet:", s.slice(exp - 30, exp + 220));
  console.log("still has export permi?", s.includes("dci:codeManage:export"));
}

for (const f of [
  "apps/ops-dci/mirror/static/css/opus-Duaj6xyj.css",
  "apps/ops-dci/mirror/static/css/soft-BPUiBseB.css",
  "apps/ops-dci/mirror/static/css/dataset-DmhoyApB.css",
]) {
  const s = fs.readFileSync(f, "utf8");
  console.log(
    f,
    "select rules:",
    [...s.matchAll(/form-select--[a-z-]+\[data-v-[^\]]+\]\{[^}]+\}/g)].map(
      (x) => x[0],
    ),
  );
}

const mock = fs.readFileSync("apps/ops-dci/mirror/static/js/ops-mock-api.js", "utf8");
console.log("\nmock has export?", mock.includes("applyDoc/export"));
console.log("mock has __opsMockBlob?", mock.includes("__opsMockBlob"));
// syntax check
const r = spawnSync(process.execPath, ["--check", "apps/ops-dci/mirror/static/js/ops-mock-api.js"], {
  encoding: "utf8",
});
console.log("syntax", r.status === 0 ? "OK" : r.stderr);
