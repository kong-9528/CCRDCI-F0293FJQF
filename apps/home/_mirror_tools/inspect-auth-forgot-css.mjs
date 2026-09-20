import fs from "fs";

const c = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/index-CLvhJbpp.css",
  "utf8",
);

// extract rules mentioning form-label, register-mode, forgot, captcha-flex
const keys = [
  "form-label",
  "is-register",
  "forgot",
  "captcha-flex",
  "captcha-img-btn",
  "Ms[",
  "pure-form",
];
for (const k of keys) {
  let i = 0,
    n = 0;
  while ((i = c.indexOf(k, i)) >= 0 && n < 6) {
    console.log("\n", k, "@", i);
    console.log(c.slice(Math.max(0, i - 40), i + 160));
    i += k.length;
    n++;
  }
}
