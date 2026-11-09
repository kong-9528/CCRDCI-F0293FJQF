import fs from "node:fs";

const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");

// Find the main query component ($e)
const marker = '查询结果';
const i = s.indexOf(marker);
console.log("around 查询结果 title const defs:");
// Find $e=G({
const idx = s.lastIndexOf("$e=G({", i);
console.log("component start", idx);
console.log(s.slice(idx, idx + 500));

// Find function B and V (category / date formatters)
for (const key of ["function B(", "function V(", "function Z(", "function Q(", "const Ye=", "const Ze=", "const He=", "const Oe=", "const Pe=", "const Re="]) {
  const p = s.indexOf(key);
  console.log("\n==", key, p);
  if (p >= 0) console.log(s.slice(p, p + 280));
}

// CSS result-card
const css = fs.readFileSync("apps/home/mirror/static/css/index-DogJsFVJ.css", "utf8");
const c = css.indexOf(".result-card");
console.log("\n==== css result-card ====");
console.log(css.slice(c, c + 1500));
