const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

const markers = [
  'title:"历史申请记录"',
  "history-dialog",
  "history-btn",
  'label:"机构名称"',
  'label:"审核意见',
  "section-title",
  "基本信息",
  "联系人信息",
  "编辑",
  "撤回申请",
  "取消",
  "提交",
  "geAudit",
  "M.value",
  "A.value",
  "P.value",
  "k.value",
  "isEdit",
  "browse",
];

for (const t of markers) {
  let from = 0,
    n = 0;
  while ((from = s.indexOf(t, from)) !== -1 && n < 2) {
    console.log("\n===", t, "@", from, "n=", n, "===");
    console.log(s.slice(Math.max(0, from - 80), from + 900));
    from += t.length;
    n++;
  }
}

// All label:"..." between history dialog start and next major function
const start = s.indexOf('title:"历史申请记录"');
const end = s.indexOf("function ae()", start);
const region = s.slice(start, end > start ? end : start + 6000);
const labels = [...region.matchAll(/label:"([^"]+)"/g)].map((m) => m[1]);
console.log("\n=== HISTORY DIALOG LABELS ===");
console.log(labels);

const statuses = [...region.matchAll(/["'](已通过|不通过|已撤回|审核中|无状态)["']/g)].map(
  (m) => m[1],
);
console.log("\n=== STATUS STRINGS ===");
console.log([...new Set(statuses)]);

// Form field labels on main page
const formStart = s.indexOf('class:"apply-form"');
const formRegion = s.slice(formStart, formStart + 8000);
const formLabels = [...formRegion.matchAll(/label:"([^"]+)"/g)].map((m) => m[1]);
console.log("\n=== MAIN FORM LABELS ===");
console.log(formLabels);

const sectionTitles = [...s.matchAll(/section-title[^>]{0,40}>([^<]+)/g)].map((m) => m[1]);
const sectionTitleLiterals = [...s.matchAll(/s\("([^"]*信息[^"]*)",-1\)/g)].map((m) => m[1]);
console.log("\n=== SECTION TITLE LITERALS ===");
console.log(sectionTitleLiterals);

const btnLiterals = [...s.matchAll(/s\("(编辑|取消|提交申请|撤回申请|历史申请记录|关闭|返回)",-1\)/g)].map(
  (m) => m[1],
);
console.log("\n=== BUTTON LITERALS ===");
console.log([...new Set(btnLiterals)]);
