const fs = require("fs");
const files = [
  "apps/home/mirror/static/js/index-CsmZrPeY.js",
  "apps/home/mirror/static/js/index-_fJendd7.js",
  "apps/home/mirror/static/js/dci-tech-apply.js",
  "apps/home/mirror/static/js/dci-tech-store.js",
  "apps/home/mirror/static/js/dci-mock-auth.js",
  "apps/home/mirror/static/js/dci-mock-api.js",
];
for (const f of files) {
  require("child_process").execSync(`node --check "${f}"`, { stdio: "pipe" });
  console.log("SYNTAX OK", f);
}
const s = fs.readFileSync(files[0], "utf8");
console.log({
  Zt: s.includes("function Zt"),
  applyTech: s.includes("applyTech"),
  applyCta: s.includes("申请接入技术服务中心"),
  progress: s.includes("查看申请进度"),
  badges: s.includes("status-tag reviewing"),
});
const h = fs.readFileSync(files[1], "utf8");
console.log({
  headerApply: h.includes("申请接入技术服务中心"),
  headerQuery: h.includes('action:"applyTech"') || h.includes("action:\\\"applyTech\\\""),
  headerPush: h.includes('query:{tab:"open",action:"applyTech"}'),
});
