import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(dir, "index.js"), "utf8");

function dumpAround(needle, len = 6000, name) {
  const i = js.indexOf(needle);
  if (i < 0) {
    console.log("missing", needle);
    return;
  }
  fs.writeFileSync(path.join(dir, name), js.slice(i, i + len), "utf8");
  console.log("wrote", name, i);
}

dumpAround("DCI是什么？", 12000, "faq-block.txt");
dumpAround("DCI查询", 8000, "query-block.txt");
dumpAround("DCI注册中心职责", 6000, "registry-block.txt");
dumpAround("内容平台类", 6000, "ecology-block.txt");
dumpAround("DCI实验室基本介绍", 8000, "lab-block.txt");
dumpAround("DCI体系发展历程", 8000, "system-block.txt");
dumpAround("DCI标准体系", 8000, "standard-block.txt");
dumpAround("CONTACT US", 6000, "contact-block.txt");
dumpAround("DCI® Technical Service Center", 6000, "tech-block.txt");
dumpAround("数字空间唯一", 8000, "home-block.txt");

// CSS variables
const css = fs.readFileSync(path.join(dir, "index.css"), "utf8");
const rootMatch = css.match(/:root\{[^}]+\}/);
fs.writeFileSync(path.join(dir, "css-root.txt"), rootMatch ? rootMatch[0] : "none", "utf8");
const brand = [...css.matchAll(/--[a-zA-Z0-9-]+:\s*[^;]+;/g)].slice(0, 80).map((m) => m[0]);
fs.writeFileSync(path.join(dir, "css-vars.txt"), brand.join("\n"), "utf8");
