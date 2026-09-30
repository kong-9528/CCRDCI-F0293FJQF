const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-_fJendd7.js", "utf8");
const keys = ["applyTech", "techWorkbench", "tt.value", "申请接入"];
for (const k of keys) {
  let i = 0,
    c = 0;
  while ((i = s.indexOf(k, i)) >= 0 && c < 3) {
    console.log("---", k, i, "---");
    console.log(s.slice(Math.max(0, i - 100), i + 260));
    i += k.length;
    c++;
  }
}
