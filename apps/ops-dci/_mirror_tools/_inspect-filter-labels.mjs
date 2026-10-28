import fs from "node:fs";

for (const [name, file] of [
  ["opus", "opus-DCRymxdq.js"],
  ["soft", "soft-D-V6yNun.js"],
  ["dataset", "dataset-cXmRoDti.js"],
]) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${file}`, "utf8");
  const labels = [...s.matchAll(/label:"([^"]+)",prop:"([^"]+)"/g)].map(
    (m) => `${m[1]} (${m[2]})`,
  );
  console.log("\n====", name, "====");
  console.log(labels.join("\n"));
  // options for category/status/type
  for (const prop of ["caseCategoryCode", "dciStatus", "dciCodeType"]) {
    const i = s.indexOf(`prop:"${prop}"`);
    if (i < 0) continue;
    const snip = s.slice(i, i + 800);
    const opts = [...snip.matchAll(/label:"([^"]+)"/g)].map((m) => m[1]);
    console.log(prop, "options:", opts.slice(0, 25).join(", "));
  }
}

// export util
const utils = fs.readFileSync(
  "apps/ops-dci/mirror/static/js/dciCodeManageUtils-EpDHrTiS.js",
  "utf8",
);
console.log("\nutils export?", utils.includes("export"), utils.slice(0, 200));
const idx = utils.indexOf("xlsx");
console.log("xlsx", idx, utils.slice(Math.max(0, idx - 100), idx + 200));

// me / ve download helper from soft imports: ax as me
console.log("\nsoft import ax");
