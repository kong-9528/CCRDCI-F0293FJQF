import fs from "node:fs";

const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");

// Find where permissions array gates route registration
const patterns = [
  "route.permissions",
  ".permissions",
  "hasPermiOr(e.permissions",
  "hasPermiOr(t.permissions",
  "hasPermiOr(n.permissions",
  "hasPermiOr(o.permissions",
  "hasPermiOr(r.permissions",
  "hasPermiOr(a.permissions",
  "filterAsyncRouter",
  "dynamicRoutes",
  "constantRoutes",
];

for (const p of patterns) {
  let idx = -1;
  let n = 0;
  while ((idx = s.indexOf(p, idx + 1)) >= 0 && n < 3) {
    console.log("\n==", p, "at", idx);
    console.log(s.slice(idx - 100, idx + 220));
    n++;
  }
}

// getInfo permissions sample from store
const store = JSON.parse(
  fs.readFileSync("apps/ops-dci/mirror/static/js/ops-mock-store.json", "utf8"),
);
const info = store["GET /api/v1/dciManage/getInfo"] || store["GET /getInfo"];
const perms = info?.data?.permissions || info?.permissions;
console.log("\nmock permissions sample", Array.isArray(perms) ? perms.slice(0, 30) : perms);
console.log(
  "has details query?",
  Array.isArray(perms) &&
    (perms.includes("*:*:*") ||
      perms.includes("dci:codeManageDetails:query") ||
      perms.includes("dci:codeManage:list")),
);

// dataset id regex issue: path datasetR/:id(\\d+) — our mock ids are 1788403000001 which IS digits
// soft/opus use :id without \\d+ — good for any id
console.log("\ndataset path constraint ok for numeric ids");

// Check if DciEntityDetail.css path resolves in import from opusRdetails
const opusR = fs.readFileSync(
  "apps/ops-dci/mirror/static/js/opusRdetails-BcBlhLGL.js",
  "utf8",
);
console.log("opusR imports css?", opusR.includes("DciEntityDetail.css"));
console.log(
  "css exists?",
  fs.existsSync("apps/ops-dci/mirror/static/css/DciEntityDetail.css"),
);
console.log(
  "css next to js relative ../css?",
  fs.existsSync("apps/ops-dci/mirror/static/css/DciEntityDetail.css"),
);
