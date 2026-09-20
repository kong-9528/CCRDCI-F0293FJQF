import fs from "fs";

const main = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);

const exp = main.match(/export\{[^}]+\}/);
// Find J3e in exports
const i = main.lastIndexOf("J3e");
console.log("last J3e context:", main.slice(i - 20, i + 40));

// search export alias for captcha
const exportBlock = main.slice(main.lastIndexOf("export{"));
console.log("\nexport has J3e?", exportBlock.includes("J3e"));
const m = exportBlock.match(/J3e as ([A-Za-z0-9]+)/);
console.log("export alias", m && m[0]);

// Also check imports in each consumer file for captcha fetch
const consumers = [
  "register-CvP1VOMb.js",
  "index-BiQimQRe.js",
  "login-C3yLEQUn.js",
  "index-CsmZrPeY.js",
  "index-CTKcd-BI.js",
];
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";
for (const f of consumers) {
  const t = fs.readFileSync(dir + f, "utf8");
  const imp = t.match(/import\{([^}]+)\}from"\.\/index-DA8BAxJb\.js"/);
  console.log("\n", f);
  console.log("  import:", imp && imp[1].slice(0, 200));
  // find which imported binding is used as captcha fetch near base64 assign
  const around = t.indexOf("data:image/gif;base64");
  console.log("  around:", t.slice(Math.max(0, around - 80), around + 60));
}
