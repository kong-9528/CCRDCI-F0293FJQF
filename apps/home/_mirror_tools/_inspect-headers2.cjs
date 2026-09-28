const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-CTjUIe93.js", "utf8");
const i = s.indexOf("header-icon-wrapper");
console.log("icon area", JSON.stringify(s.slice(i - 50, i + 400)));

// find Plus button / default el-button size
const j = s.indexOf('type:"primary",icon:"Plus"');
console.log("\nplus btn", JSON.stringify(s.slice(j - 80, j + 200)));

// apporg css for buttons
const css = fs.readFileSync("apps/home/mirror/static/css/index-vH99sken.css", "utf8");
console.log("\nbtn css", (css.match(/[^}]*el-button[^}]*\{[^}]+\}/g) || []).slice(0, 10).join("\n"));
console.log("\nheader-right", (css.match(/[^}]*header-right[^}]*\{[^}]+\}/g) || []).join("\n"));

const ov = fs.readFileSync("apps/home/mirror/overrides.css", "utf8");
const k = ov.indexOf(".api-management-container .header-icon-wrapper");
console.log("\napi title pattern\n", ov.slice(k, k + 450));

// org-info header render
const info = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const h = info.indexOf("card-header flex-row");
console.log("\norg header", JSON.stringify(info.slice(h, h + 700)));
