import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const i = t.indexOf("auth-card-body");
console.log(t.slice(i, i + 250));

// class binding for card body
const j = t.indexOf("is-login-mode");
console.log("\nis-login-mode contexts:");
let idx = 0,
  n = 0;
while ((idx = t.indexOf("is-login-mode", idx)) >= 0 && n < 5) {
  console.log(t.slice(idx - 60, idx + 100));
  idx += 10;
  n++;
}

const k = t.indexOf("is-register-mode");
console.log("\nis-register-mode:\n", t.slice(k - 80, k + 120));
