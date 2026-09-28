const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

// When is history loaded? Search for Le( and M.value watch
const markers = ["function Le(", "M.value=!0", "watch(M", "()=>M.value", "la(", "auditList"];
for (const t of markers) {
  let from = 0,
    n = 0;
  while ((from = s.indexOf(t, from)) !== -1 && n < 3) {
    console.log("\n===", t, n, "@", from, "===");
    console.log(s.slice(Math.max(0, from - 60), from + 350));
    from += t.length;
    n++;
  }
}

// Edit/submit button conditions
console.log("\n=== BUTTON CONDITIONS ===");
const btns = ["编辑", "提交申请", "取消", "保存并提交", "确认提交"];
for (const t of btns) {
  let from = 0,
    n = 0;
  while ((from = s.indexOf(`s("${t}"`, from)) !== -1 && n < 3) {
    console.log(t, n, s.slice(from - 200, from + 80));
    from += 4;
    n++;
  }
  // also bare
  from = 0;
  n = 0;
  while ((from = s.indexOf(t, from)) !== -1 && n < 2) {
    if (s.slice(from - 30, from + 40).includes("default")) {
      console.log("ctx", t, n, s.slice(from - 180, from + 60));
    }
    from += t.length;
    n++;
  }
}

// O/A/geIdle related button rendering near submit-action
const idx = s.indexOf("submit-action");
// find template uses of Se, we, ce
console.log("\n=== ACTION BUTTONS TEMPLATE ===");
let from = s.indexOf("geIdle.value");
n = 0;
while (from !== -1 && n < 8) {
  console.log(n, s.slice(from - 40, from + 280));
  from = s.indexOf("geIdle.value", from + 10);
  n++;
}

from = s.indexOf("A.value?");
n = 0;
while (from !== -1 && n < 10) {
  console.log("A?", n, s.slice(from - 20, from + 250));
  from = s.indexOf("A.value?", from + 8);
  n++;
}
