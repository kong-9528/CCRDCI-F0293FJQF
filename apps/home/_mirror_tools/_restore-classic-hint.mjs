import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageJs = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const indexHtml = path.join(root, "mirror/index.html");

let s = fs.readFileSync(pageJs, "utf8");
const old =
  "例如：DCI:RQZ010ANT.156.20260108A1C3E5G7I9　春日写生　/　国作登字-2026-F-10000001　海风摄影集";
const neu =
  "例如：DCI:RQZ010ANT.156.202607012098976446　《数字版权保护技术规范》";
if (!s.includes(old)) {
  if (s.includes(neu)) {
    console.log("hint already restored");
  } else {
    throw new Error("hint text not found");
  }
} else {
  s = s.replace(old, neu);
  fs.writeFileSync(pageJs, s);
  console.log("hint updated");
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-classic-20261113",
);
h = h.replace(
  /index-BZ7-YeMc\.js\?v=[^"]+/,
  "index-BZ7-YeMc.js?v=dci-classic-20261113",
);
fs.writeFileSync(indexHtml, h);
console.log("cache busted");
