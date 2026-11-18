import fs from "node:fs";
import path from "node:path";

const dir = "apps/ops-dci/mirror/static/js";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
const needles = [
  "bizConsult",
  "栏目标题",
  "新增栏目",
  "内容维护",
  "portal/nav",
  "portal/article",
  "accountList",
  "门户用户",
  "内容编辑",
];
for (const f of files) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hit = needles.filter((n) => t.includes(n));
  if (hit.length) console.log(f, hit.join(", "));
}

const idx = fs.readFileSync(path.join(dir, "index-DsYmzmNg.js"), "utf8");
for (const key of [
  "dci/portal",
  "dci/bizConsult",
  "dci/account",
  "contentManag",
  "/portal",
]) {
  let i = 0;
  let c = 0;
  console.log("\n==", key);
  while ((i = idx.indexOf(key, i)) >= 0 && c < 8) {
    console.log(idx.slice(Math.max(0, i - 30), i + 120).replace(/\s+/g, " "));
    i += key.length;
    c += 1;
  }
}
