import fs from "fs";

const main =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js";
const m = fs.readFileSync(main, "utf8");

// Find SS( org status
for (const n of ["function SS(", "SS=function", "SS=(", 'url:"/system/regOrg', "regOrg", "auditStatus"]) {
  let idx = 0,
    c = 0;
  while ((idx = m.indexOf(n, idx)) >= 0 && c < 3) {
    console.log("\n", n, "@", idx);
    console.log(m.slice(idx, idx + 180));
    idx += n.length;
    c++;
  }
}

// axios baseURL
const b = m.indexOf("baseURL");
console.log("\nbaseURL", m.slice(b, b + 120));

// Hve sms login
const h = m.indexOf("function Hve");
console.log("\nHve", m.slice(h, h + 200));

// cookie token helpers hl Qg
const hl = m.indexOf("function hl");
console.log("\nhl", m.slice(hl, hl + 150));
