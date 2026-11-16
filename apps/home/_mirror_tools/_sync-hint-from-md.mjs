import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const indexHtml = path.join(root, "mirror/index.html");

const OLD =
  "例如：DCI:RQZ010ANT.156.202607012098976446　《数字版权保护技术规范》";
const NEW =
  "例如：DCI:RQZ010ANT.156.202607012098976446　《数字版权保护技术规范》";

let s = fs.readFileSync(page, "utf8");
if (s.includes(NEW)) {
  console.log("hint already updated");
} else if (s.includes(OLD)) {
  s = s.replace(OLD, NEW);
  fs.writeFileSync(page, s);
  console.log("hint updated");
} else if (s.includes("例如：DCI:")) {
  const i = s.indexOf("例如：DCI:");
  throw new Error("unexpected hint: " + s.slice(i, i + 80));
} else {
  throw new Error("hint not found");
}

const check = spawnSync(process.execPath, ["--check", page], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  process.exit(1);
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-md-sync-20261116",
);
fs.writeFileSync(indexHtml, h);
console.log("cache busted");
