const fs = require("fs");
const checks = [
  ["home overrides identity labels", "apps/home/mirror/overrides.css", "history-dialog .custom-descriptions .el-descriptions__label"],
  ["home overrides browse form", "apps/home/mirror/overrides.css", "el-form-item:has(.form-text-value)"],
  ["home history class", "apps/home/mirror/static/js/info-0k0-BfNc.js", 'class:"custom-descriptions"'],
  ["customer info label bg", "apps/customer/src/styles/customer.css", ".c-org-info-row__label"],
  ["customer info fafafa", "apps/customer/src/styles/customer.css", "background: #fafafa"],
  ["customer history grid table", "apps/customer/src/styles/customer.css", ".c-apply-history-field__label"],
];
for (const [name, file, needle] of checks) {
  const s = fs.readFileSync(file, "utf8");
  console.log(name, s.includes(needle));
}
// snippet customer label
const c = fs.readFileSync("apps/customer/src/styles/customer.css", "utf8");
const i = c.indexOf(".c-org-info-row__label {");
console.log(c.slice(i, i + 220));
