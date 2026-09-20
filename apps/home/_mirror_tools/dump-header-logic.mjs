import fs from "fs";

const header =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-_fJendd7.js";
const t = fs.readFileSync(header, "utf8");

// Full setup logic around auditStatus
const i = t.indexOf("auditStatus");
console.log("--- audit contexts ---");
let idx = 0;
while ((idx = t.indexOf("auditStatus", idx)) >= 0) {
  console.log(t.slice(idx - 80, idx + 120).replace(/\s+/g, " "));
  console.log("---");
  idx += 11;
}

const j = t.indexOf("function") >= 0 ? t.indexOf("setup(") : -1;
console.log("\n--- setup start ---");
console.log(t.slice(t.indexOf("setup(w"), t.indexOf("setup(w") + 2200));
