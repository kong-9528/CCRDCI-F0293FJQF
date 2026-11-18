import fs from "node:fs";

const hits = JSON.parse(
  fs.readFileSync(
    "apps/ops-dci/_mirror_tools/_ops_capture/api-hits.json",
    "utf8",
  ),
);

const remarks = new Set();
JSON.stringify(hits, (k, v) => {
  if (typeof v === "string" && v.includes("auditRemark") && v.includes("auditStatus")) {
    try {
      const j = JSON.parse(v);
      for (const r of j.rows || []) {
        if (String(r.auditStatus) === "2" && r.auditRemark) {
          remarks.add(String(r.auditRemark));
        }
      }
    } catch (e) {}
  }
  return v;
});

console.log([...remarks].slice(0, 40).join("\n---\n"));
console.log("count", remarks.size);

const store = JSON.parse(
  fs.readFileSync("apps/ops-dci/mirror/static/js/ops-mock-store.json", "utf8"),
);
for (const [key, body] of Object.entries(store)) {
  const rows = body && body.rows;
  if (!Array.isArray(rows)) continue;
  for (const r of rows) {
    if (String(r.auditStatus) === "2") {
      console.log("store", key, r.loginUsername, r.orgName, r.auditRemark);
    }
  }
}
