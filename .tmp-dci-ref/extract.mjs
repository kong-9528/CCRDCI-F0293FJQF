import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(dir, "index.js"), "utf8");
const css = fs.readFileSync(path.join(dir, "index.css"), "utf8");
console.log("js", js.length, "css", css.length);

const routePaths = [...js.matchAll(/path:\s*["']([^"']+)["']/g)].map((m) => m[1]);
console.log("routePaths", [...new Set(routePaths)]);

const hrefs = [...js.matchAll(/to:\s*["']([^"']+)["']/g)].map((m) => m[1]);
console.log("tos", [...new Set(hrefs)].slice(0, 80));

const assets = [...js.matchAll(/\/assets\/[A-Za-z0-9._/-]+\.(?:js|css|png|jpg|jpeg|svg|webp|gif)/g)].map(
  (m) => m[0],
);
console.log("assets", [...new Set(assets)].slice(0, 100));

const cn = [...js.matchAll(/[\u4e00-\u9fff]{2,40}/g)].map((m) => m[0]);
const uniq = [...new Set(cn)];
fs.writeFileSync(path.join(dir, "cn-strings.txt"), uniq.join("\n"), "utf8");
console.log("cn count", uniq.length);

// Extract likely string literals containing Chinese
const literals = [];
const re = /["`]([^"`]*[\u4e00-\u9fff][^"`]{0,200})["`]/g;
let m;
while ((m = re.exec(js))) {
  if (m[1].length < 300) literals.push(m[1]);
}
fs.writeFileSync(path.join(dir, "cn-literals.txt"), [...new Set(literals)].join("\n---\n"), "utf8");
console.log("literals", [...new Set(literals)].length);
