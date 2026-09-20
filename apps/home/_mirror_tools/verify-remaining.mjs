import fs from "fs";
import path from "path";

const jsDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of fs.readdirSync(jsDir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(path.join(jsDir, f), "utf8");
  const hits = [];
  if (t.includes('value="register"') && t.includes("value=!0")) hits.push("set-register-mode");
  if (t.includes('R("register")')) hits.push('R("register")');
  if (t.includes('q("register")')) hits.push('q("register")');
  if (t.includes('function R(i="login"){') && t.includes("c.value=!0")) hits.push("openAuth-R");
  if (hits.length) console.log(f, hits.join(", "));
}

// verify BiQimQRe has de and re in scope near the patch
const bi = fs.readFileSync(path.join(jsDir, "index-BiQimQRe.js"), "utf8");
const i = bi.indexOf('de();re.push("/register")');
console.log("\npatch ctx:", bi.slice(i - 80, i + 80));
console.log("has function de", /function de\(/.test(bi));
console.log("has re= or ,re=", /[=,]re[=,]|const re=|let re=|,re=/.test(bi) || bi.includes("re.push"));
