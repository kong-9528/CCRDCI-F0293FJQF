import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);
const i = t.indexOf('prop:"code"');
console.log(t.slice(i - 40, i + 600));
console.log("\nle=", t.match(/const le=\{[^}]+\}/)?.[0]);
