const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

// Header / button visibility region
const histBtn = s.indexOf('class:"history-btn"');
console.log("=== HEADER REGION ===");
console.log(s.slice(histBtn - 1200, histBtn + 200));

console.log("\n=== SUBMIT ACTION REGION ===");
const submit = s.indexOf("submit-action");
console.log(s.slice(submit - 100, submit + 900));

console.log("\n=== HEADER TITLE ===");
const ht = s.indexOf("header-title");
console.log(s.slice(ht - 50, ht + 400));

// Full history descriptions labels once
const start = s.indexOf('class:"history-dialog"');
const end = s.indexOf('title:"历次申请全景明细信息"', start);
const region = s.slice(start, end);
const labels = [...region.matchAll(/label:"([^"]+)"/g)].map((m) => m[1]);
console.log("\n=== HISTORY CARD LABELS (unique order) ===");
const seen = new Set();
for (const l of labels) {
  if (!seen.has(l)) {
    seen.add(l);
    console.log("-", l);
  }
}

// Card header structure
console.log("\n=== CARD HEADER SNIPPET ===");
const cardHdr = region.indexOf("注册中心申请");
console.log(region.slice(cardHdr - 400, cardHdr + 500));

// cooperationField on main form
console.log("\n=== 合作领域 on form ===");
let from = 0,
  n = 0;
while ((from = s.indexOf("合作领域", from)) !== -1 && n < 5) {
  console.log(n, s.slice(from - 40, from + 120));
  from += 3;
  n++;
}

// xe.value = org-info embedded flag?
console.log("\n=== xe.value definitions ===");
from = 0;
n = 0;
while ((from = s.indexOf("xe=", from)) !== -1 && n < 5) {
  console.log(n, s.slice(from, from + 120));
  from += 3;
  n++;
}
from = 0;
n = 0;
while ((from = s.indexOf("xe.value", from)) !== -1 && n < 3) {
  console.log("use", n, s.slice(Math.max(0, from - 60), from + 100));
  from += 8;
  n++;
}

console.log("\n=== apply refs / demo hook ===");
from = 0;
n = 0;
while ((from = s.indexOf("__DCI_ORGINFO_DEMO__", from)) !== -1 && n < 6) {
  console.log(n, s.slice(from - 40, from + 200));
  from += 20;
  n++;
}

// Route registration for org-info
const routerFiles = [
  "apps/home/mirror/static/js/index-DA8BAxJb.js",
];
for (const f of routerFiles) {
  try {
    const r = fs.readFileSync(f, "utf8");
    let i = r.indexOf("org-info");
    let c = 0;
    while (i !== -1 && c < 5) {
      console.log("\nroute", c, r.slice(i - 80, i + 160));
      i = r.indexOf("org-info", i + 8);
      c++;
    }
  } catch (e) {
    console.log("no", f);
  }
}
