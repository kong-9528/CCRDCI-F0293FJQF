const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");

// Find the big conditional for submit buttons: look for "提交申请" and nearby conditions
const markers = [
  's(" 提交申请 "',
  's(" 更新 "',
  's(" 取消申请 "',
  "Ne.value",
  "geIdle.value",
  "O.value",
  "xe.value?",
];

for (const t of markers) {
  let from = 0,
    n = 0;
  while ((from = s.indexOf(t, from)) !== -1 && n < 4) {
    console.log("\n===", JSON.stringify(t), n, "===");
    console.log(s.slice(Math.max(0, from - 250), from + 200));
    from += t.length;
    n++;
  }
}

// Full branch around 更新 button
const upd = s.indexOf('s(" 更新 "');
console.log("\n=== FULL ACTION BRANCH (before history dialog) ===");
console.log(s.slice(upd - 1800, upd + 200));
