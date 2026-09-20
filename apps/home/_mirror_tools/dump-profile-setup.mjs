import fs from "fs";

const profile =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js";
const t = fs.readFileSync(profile, "utf8");

// Find j computed (已开通服务 uses j.value)
const setup = t.indexOf("setup(");
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_profile-setup.txt",
  t.slice(setup, setup + 3500),
  "utf8",
);

// open cards section
const open = t.indexOf("已通过");
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_profile-cards.txt",
  t.slice(open - 400, open + 1800),
  "utf8",
);

console.log("j.value DCI", t.includes('j.value?"DCI注册中心":"暂无"'));
console.log("auditStatus", (t.match(/auditStatus/g) || []).length);

// getInfo / user store usage in main bundle
const main =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js";
const m = fs.readFileSync(main, "utf8");
for (const n of ["getInfo", "auditStatus", "login(", "smsLogin", "Admin-Token", "phonenumber"]) {
  console.log("main", n, m.includes(n));
}
const gi = m.indexOf("getInfo");
console.log("getInfo ctx", m.slice(gi, gi + 400));
