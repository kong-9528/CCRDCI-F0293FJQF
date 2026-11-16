import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const indexHtml = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../mirror/index.html",
);
let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-soft7-20261116",
);
fs.writeFileSync(indexHtml, h);
console.log("cache ok");
