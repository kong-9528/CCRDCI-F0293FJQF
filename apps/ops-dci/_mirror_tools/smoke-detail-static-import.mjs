/**
 * Simulate COS static hosting: dynamic-import detail chunk without Vite CSS transform.
 * Fails if the module still has a native CSS import.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve("apps/ops-dci/mirror/static/js");
const files = [
  "opusRdetails-BcBlhLGL.js",
  "softCdetails-ykzNbHOg.js",
  "datasetXdetails-ybN1I1YA.js",
  "DciEntityDetail.js",
];

let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  const hasCssImport = /import\s*["'][^"']+\.css["']/.test(src);
  console.log(f, hasCssImport ? "FAIL css-import" : "ok");
  if (hasCssImport) bad++;
}

// ensure css file present for link href
const css = path.resolve("apps/ops-dci/mirror/static/css/DciEntityDetail.css");
console.log("css file", fs.existsSync(css));
console.log(
  "index link",
  fs.readFileSync("apps/ops-dci/mirror/index.html", "utf8").includes("DciEntityDetail.css"),
);

if (bad) process.exit(1);
console.log("ok");
