const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

const markers = [
  "无状态",
  "历史申请",
  "function Le",
  "q.value=",
  "auditList",
  "auditRemark",
  "geIdle.value",
  "title:\"无状态\"",
  "title:\"审核中\"",
];
for (const t of markers) {
  let from = 0,
    n = 0;
  while ((from = s.indexOf(t, from)) !== -1 && n < 3) {
    console.log("\n===", t, n, "===");
    console.log(JSON.stringify(s.slice(Math.max(0, from - 100), from + 280)));
    from += t.length;
    n++;
  }
}
