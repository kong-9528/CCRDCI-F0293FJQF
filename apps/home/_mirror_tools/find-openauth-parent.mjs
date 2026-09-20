import fs from "fs";
import path from "path";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of fs.readdirSync(dir)) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (!t.includes("openAuth") && !t.includes("@openAuth")) continue;
  if (f.includes("index-_fJendd7")) continue; // header itself
  console.log("FILE", f);
  let from = 0;
  let n = 0;
  while (n < 8) {
    const i = t.indexOf("openAuth", from);
    if (i < 0) break;
    console.log(t.slice(Math.max(0, i - 100), i + 180));
    console.log("---");
    from = i + 8;
    n++;
  }
}
