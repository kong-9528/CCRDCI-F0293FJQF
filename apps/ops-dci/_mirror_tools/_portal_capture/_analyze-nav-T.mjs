import fs from "node:fs";
const nav = fs.readFileSync(
  new URL("./nav-DJE1X9l6.js", import.meta.url),
  "utf8",
);
const start = nav.indexOf('from"./index-iqoS587T.js"');
console.log("import context", nav.slice(start - 80, start + 40));
// Find identifier T usages after imports - it's aliased as T from c
// Pattern: ,c as T, or {c as T}
const body = nav.slice(nav.indexOf("setup("));
const hits = [];
for (let i = 0; i < body.length; i++) {
  if (body[i] !== "T") continue;
  const prev = body[i - 1] || "";
  const next = body[i + 1] || "";
  if (/[A-Za-z0-9_$]/.test(prev) || /[A-Za-z0-9_$]/.test(next)) continue;
  hits.push(body.slice(i, i + 40));
  if (hits.length >= 25) break;
}
console.log(hits);
