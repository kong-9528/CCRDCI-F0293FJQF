import fs from "node:fs";

for (const f of [
  "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
  "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
  "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
]) {
  const s = fs.readFileSync(f, "utf8");
  const i = s.indexOf("codeManage-details");
  console.log("\n====", f);
  console.log(i >= 0 ? s.slice(i - 150, i + 500) : "NO codeManage-details");
  console.log("has View", s.includes('icon:"View"'));
  console.log("has query permi", s.includes("dci:codeManage:query"));
  console.log("has export permi", s.includes("dci:codeManage:export"));
}

// Find router route registrations
const dir = "apps/ops-dci/mirror/static/js";
const hits = [];
for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith(".js")) continue;
  const s = fs.readFileSync(`${dir}/${name}`, "utf8");
  if (s.includes("codeManage-details") || s.includes("opusRdetails")) {
    hits.push(name);
  }
}
console.log("\nfiles mentioning routes:", hits);
