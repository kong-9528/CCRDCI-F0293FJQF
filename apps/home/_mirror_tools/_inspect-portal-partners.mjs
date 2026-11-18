import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../mirror");
const js = fs.readFileSync(path.join(dir, "static/js/portal-CGcjgAeB.js"), "utf8");
const css = fs.readFileSync(path.join(dir, "static/css/portal-BQh_66u9.css"), "utf8");

const markers = [
  "合作伙伴",
  "partner",
  "partners",
  "regorg-partner",
  "partner-grid",
  "partner-list",
  "partner-card",
  "logoList",
  "orgList",
];
for (const m of markers) {
  let i = 0,
    n = 0;
  while ((i = js.indexOf(m, i)) !== -1 && n < 5) {
    console.log("\nJS", m, i);
    console.log(js.slice(Math.max(0, i - 80), Math.min(js.length, i + 200)));
    i += m.length;
    n++;
  }
  i = 0;
  n = 0;
  while ((i = css.indexOf(m, i)) !== -1 && n < 3) {
    console.log("\nCSS", m, i);
    console.log(css.slice(Math.max(0, i - 40), Math.min(css.length, i + 180)));
    i += m.length;
    n++;
  }
}

// Find arrays that look like 10 partner entries
const arrHits = [...js.matchAll(/\[[^\]]{200,2500}\]/g)].slice(0, 20);
for (const h of arrHits) {
  if (/png|logo|name|title|src/.test(h[0]) && (h[0].match(/\{/g) || []).length >= 5) {
    console.log("\nARRAY CANDIDATE len", h[0].length, "at", h.index);
    console.log(h[0].slice(0, 400));
  }
}
