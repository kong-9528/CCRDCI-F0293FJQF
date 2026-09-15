import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(dir, "index.js"), "utf8");

// Dump large windows around each route path assignment
const markers = [
  "path:`/system`",
  "path:`/standard`",
  "path:`/registry`",
  "path:`/ecology`",
  "path:`/lab`",
  "path:`/query`",
  "path:`/faq`",
  "path:`/contact`",
  "path:`/tech-service`",
  "path:`/`",
  "DCI——",
  "children:`DCI体系",
  "children:`常见问题",
  "children:`联系我们",
];

for (const m of markers) {
  let from = 0;
  let n = 0;
  while (n < 3) {
    const i = js.indexOf(m, from);
    if (i < 0) break;
    const chunk = js.slice(i, i + 2500);
    fs.writeFileSync(path.join(dir, `chunk-${m.replace(/[^\w\u4e00-\u9fff]+/g, "_")}-${n}.txt`), chunk, "utf8");
    from = i + m.length;
    n++;
  }
  console.log(m, "hits", n);
}

// Extract image URLs
const imgs = [...js.matchAll(/https:\/\/[^"'`\s)]+\.(?:png|jpg|jpeg|svg|webp|gif)/gi)].map((m) => m[0]);
fs.writeFileSync(path.join(dir, "images.txt"), [...new Set(imgs)].join("\n"), "utf8");
console.log("images", [...new Set(imgs)].length);

// Extract FAQ-like Q/A pairs if present
const faqIdx = js.indexOf("常见问题");
fs.writeFileSync(path.join(dir, "around-faq.txt"), js.slice(faqIdx, faqIdx + 8000), "utf8");
