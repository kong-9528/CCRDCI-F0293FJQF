import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(dir, "index.js"), "utf8");

const known = [
  "/",
  "/system",
  "/standard",
  "/registry",
  "/ecology",
  "/lab",
  "/query",
  "/faq",
  "/contact",
  "/tech-service",
];

for (const r of known) {
  const count = js.split(`"${r}"`).length - 1 + (js.split(`'${r}'`).length - 1);
  console.log(r, count);
}

// Find createBrowserRouter / Routes children patterns
const idx = js.indexOf("/tech-service");
console.log("tech-service idx", idx);
console.log(js.slice(Math.max(0, idx - 200), idx + 200));

const idx2 = js.indexOf("DCI");
console.log("\nfirst DCI context:\n", js.slice(idx2, idx2 + 500));

// Find nav labels near routes
const navHints = ["体系介绍", "标准规范", "注册管理", "生态合作", "实验室", "查询", "常见问题", "联系我们", "技术服务"];
for (const h of navHints) {
  const i = js.indexOf(h);
  console.log(h, i, i >= 0 ? js.slice(i - 80, i + h.length + 80).replace(/\n/g, " ") : "");
}
