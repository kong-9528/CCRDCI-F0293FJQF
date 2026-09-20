import fs from "fs";
import path from "path";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
const needles = ["openAuth", "open-auth", "onOpenAuth", 'q("register")', 'mode:"register"', "authVisible", "showAuth"];
for (const f of fs.readdirSync(dir)) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = needles.filter((n) => t.includes(n));
  if (!hits.length) continue;
  console.log(f, "=>", hits.join(", "));
}
