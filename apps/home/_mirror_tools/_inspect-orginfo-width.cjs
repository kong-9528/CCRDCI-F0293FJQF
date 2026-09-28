const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
for (const t of [
  "is-embedded",
  "embedded",
  "apply-console-container",
  "main-card",
  "apply-form",
]) {
  let from = 0,
    n = 0;
  while ((from = s.indexOf(t, from)) !== -1 && n < 2) {
    console.log("\n---", t, n, "---");
    console.log(JSON.stringify(s.slice(Math.max(0, from - 80), from + 200)));
    from += t.length;
    n++;
  }
}
