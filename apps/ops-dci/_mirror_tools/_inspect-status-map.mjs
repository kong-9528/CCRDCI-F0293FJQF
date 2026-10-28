import fs from "node:fs";

for (const f of [
  "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
  "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
  "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
]) {
  const s = fs.readFileSync(f, "utf8");
  // status cell render
  const i = s.indexOf("dciStatus");
  console.log("\n", f);
  // find formatter or status display near soft-status
  const j = s.indexOf("status-revoked");
  console.log(s.slice(j - 200, j + 250));
  // STATUS_OPTIONS
  const m = s.match(/S as Y|S as E|const \w+=\[\{label:\"全部\"[\s\S]{0,200}/);
  console.log("status const?", m && m[0].slice(0, 150));
}

const utils = fs.readFileSync(
  "apps/ops-dci/mirror/static/js/dciCodeManageUtils-EpDHrTiS.js",
  "utf8",
);
console.log("\nutils status/category:");
for (const key of ["已申领", "已撤销", "原始分配", "文字作品", "STATUS", "dciStatus"]) {
  const i = utils.indexOf(key);
  if (i >= 0) console.log(key, utils.slice(i - 40, i + 120));
}
console.log(utils.slice(utils.length - 800));
