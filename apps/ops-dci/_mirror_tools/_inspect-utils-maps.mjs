import fs from "node:fs";
const utils = fs.readFileSync(
  "apps/ops-dci/mirror/static/js/dciCodeManageUtils-EpDHrTiS.js",
  "utf8",
);
const i = utils.indexOf("ae=");
const j = utils.indexOf("te=");
console.log("ae", utils.slice(i, i + 400));
console.log("te", utils.slice(j, j + 500));
// also ee
const k = utils.indexOf("ee=");
console.log("ee", utils.slice(k, k + 300));
