import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(dir, "index.js"), "utf8");

// Find FAQ array by looking for first question then extract until next major section
const start = js.indexOf("DCI是什么？");
let depth = 0;
let i = start;
// walk backward to array start
while (i > 0 && js[i] !== "[") i--;
const arrStart = i;
i = arrStart;
depth = 0;
do {
  const ch = js[i++];
  if (ch === "[") depth++;
  else if (ch === "]") depth--;
} while (depth > 0 && i < js.length);
const arr = js.slice(arrStart, i);
fs.writeFileSync(path.join(dir, "faq-array.txt"), arr, "utf8");
console.log("faq array len", arr.length);

// Extract CSS custom properties from :root and .dark if any
const css = fs.readFileSync(path.join(dir, "index.css"), "utf8");
const m = css.match(/:root\{[\s\S]*?\}/);
fs.writeFileSync(path.join(dir, "css-root.txt"), m ? m[0].slice(0, 5000) : "none", "utf8");
console.log("css root", m ? m[0].length : 0);

// brand colors
for (const key of ["--primary", "--brand", "--background", "gradient-primary", "bg-brand"]) {
  const idx = css.indexOf(key);
  console.log(key, idx, idx >= 0 ? css.slice(idx, idx + 120) : "");
}
