import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
let js = fs.readFileSync(path, "utf8");

const i = js.indexOf('C("注册",-1)');
console.log(js.slice(i - 80, i + 400));

console.log("\n--- has 已有账号 under form?", js.includes("switch-register") || js.includes("go-register"));

// card header current
const h = js.indexOf("账号注册");
console.log("\nheader", js.slice(h - 120, h + 200));
