const fs = require("fs");
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";
const needle = "DCI数字版权唯一标识符";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const s = fs.readFileSync(dir + f, "utf8");
  if (s.includes(needle) || s.includes("数字版权唯一标识符")) {
    const i = s.indexOf(needle);
    const j = s.indexOf("数字版权唯一标识符");
    console.log(f, "exact", i, "partial", j);
    if (i >= 0) console.log(s.slice(i - 150, i + 80));
    else if (j >= 0) console.log(s.slice(j - 150, j + 80));
  }
}
