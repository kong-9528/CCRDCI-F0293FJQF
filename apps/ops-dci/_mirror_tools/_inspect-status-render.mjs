import fs from "node:fs";
const soft = fs.readFileSync("apps/ops-dci/mirror/static/js/soft-D-V6yNun.js", "utf8");
// find status column default slot
const i = soft.indexOf('label:"状态"');
console.log(soft.slice(i, i + 500));
console.log("---");
const j = soft.indexOf("soft-status-revoked");
console.log(soft.slice(j - 350, j + 200));
// Y is S from utils - STATUS options for select
const utils = fs.readFileSync(
  "apps/ops-dci/mirror/static/js/dciCodeManageUtils-EpDHrTiS.js",
  "utf8",
);
// find select options arrays - look for 已申领
const k = utils.indexOf("已申领");
console.log("已申领 in utils", k, k >= 0 ? utils.slice(k - 80, k + 200) : "");
const softK = soft.indexOf("已申领");
console.log("已申领 in soft", softK, soft.slice(softK - 100, softK + 250));
