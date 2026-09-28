const fs = require("fs");

function hits(file, needles) {
  const s = fs.readFileSync(file, "utf8");
  console.log("\n====", file, "====");
  for (const t of needles) {
    let from = 0,
      n = 0;
    while ((from = s.indexOf(t, from)) !== -1 && n < 3) {
      console.log("---", t, n, "---");
      console.log(JSON.stringify(s.slice(Math.max(0, from - 100), from + 220)));
      from += t.length;
      n++;
    }
  }
}

hits("apps/home/mirror/static/js/index-CTjUIe93.js", [
  "header-title",
  "header-icon",
  "card-header",
  "el-button",
  "新增",
  "height",
]);

hits("apps/home/mirror/static/js/info-0k0-BfNc.js", [
  "header-title",
  "header-icon",
  "history-btn",
  "机构信息",
  "card-header",
]);

const cssApp = fs.readFileSync("apps/home/mirror/static/css/index-vH99sken.css", "utf8");
console.log("\n==== apporg css header ====");
console.log(
  (cssApp.match(/[^}]*header[^}]{0,80}\{[^}]+\}/g) || []).slice(0, 20).join("\n")
);

const cssInfo = fs.readFileSync("apps/home/mirror/static/css/info-DVZhlGCX.css", "utf8");
console.log("\n==== orginfo css header ====");
console.log(
  (cssInfo.match(/[^}]*header[^}]{0,80}\{[^}]+\}/g) || []).slice(0, 20).join("\n")
);
console.log(
  (cssInfo.match(/[^}]*history-btn[^}]*\{[^}]+\}/g) || []).join("\n")
);
