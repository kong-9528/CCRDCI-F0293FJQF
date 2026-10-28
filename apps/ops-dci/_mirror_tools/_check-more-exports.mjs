import fs from "node:fs";
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const m = s.match(/export\{([^}]+)\}/);
const exports = m[1].split(",").map((x) => x.trim());
for (const k of ["j", "y", "m", "F", "t", "k", "X"]) {
  const hit = exports.find((e) => e === k || e.endsWith(" as " + k) || e.startsWith(k + " as"));
  console.log(k, hit || "MISSING");
}
const soft = fs.readFileSync("apps/ops-dci/mirror/static/js/softRdetails-C7nosZyJ.js");
console.log("softR bytes", soft.slice(soft.indexOf("ElMessage"), soft.indexOf("ElMessage") + 40).toString("utf8"));
console.log("softR has返回", soft.toString("utf8").includes("返回"));
