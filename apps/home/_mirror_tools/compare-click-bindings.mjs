import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");

// How working links bind click
for (const needle of [
  "找回密码",
  "去登录",
  "go-register-link",
  "forgot-back-link",
  "onClick:ie",
  "onClick:Ue",
]) {
  const i = t.indexOf(needle);
  if (i < 0) {
    console.log("MISS", needle);
    continue;
  }
  console.log("\n===", needle, "===");
  console.log(t.slice(Math.max(0, i - 100), i + 120));
}
