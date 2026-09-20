import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// dump snippets around go-register / register mode
const keys = ["go-register", "is-register-mode", '==="register"', "register", "/register", "push("];
for (const k of keys) {
  let from = 0;
  let n = 0;
  while (n < 5) {
    const i = t.indexOf(k, from);
    if (i < 0) break;
    console.log("\n===", k, i, "===");
    console.log(t.slice(Math.max(0, i - 100), i + 160));
    from = i + k.length;
    n++;
  }
}
