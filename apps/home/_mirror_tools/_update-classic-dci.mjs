import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const indexHtml = path.join(root, "mirror/index.html");
const verify = path.join(root, "_mirror_tools/_verify-dci-unified-query.mjs");
const syncHint = path.join(root, "_mirror_tools/_sync-hint-from-md.mjs");

const NEW = "DCI:RQZ010ANT.156.202607012098976446";
const OLD_HINTS = [
  "DCI:RBQDJZCPC.156.202607012098976446",
  "DCI:RBQ010ANT.156.202607012098976446",
];

let s = fs.readFileSync(page, "utf8");
let changed = false;
if (s.includes(`例如：${NEW}　《数字版权保护技术规范》`)) {
  console.log("page hint already correct");
} else {
  for (const old of OLD_HINTS) {
    const from = `例如：${old}　《数字版权保护技术规范》`;
    const to = `例如：${NEW}　《数字版权保护技术规范》`;
    if (s.includes(from)) {
      s = s.replace(from, to);
      changed = true;
      console.log("replaced hint from", old);
      break;
    }
  }
  if (!changed) {
    const i = s.indexOf("例如：DCI:");
    throw new Error("unexpected hint: " + s.slice(i, i + 90));
  }
  fs.writeFileSync(page, s);
}

const check = spawnSync(process.execPath, ["--check", page], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  process.exit(1);
}

for (const file of [verify, syncHint]) {
  if (!fs.existsSync(file)) continue;
  let t = fs.readFileSync(file, "utf8");
  let u = t;
  for (const old of OLD_HINTS) u = u.replaceAll(old, NEW);
  // also ensure classic assertion uses NEW
  u = u.replace(
    /classic\.dciCode === "[^"]+"/,
    `classic.dciCode === "${NEW}"`,
  );
  u = u.replace(
    /pageJs\.includes\("DCI:[^"]+"\)/,
    `pageJs.includes("${NEW}")`,
  );
  if (u !== t) {
    fs.writeFileSync(file, u);
    console.log("updated", path.basename(file));
  }
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-classic-rqz2-20261116",
);
fs.writeFileSync(indexHtml, h);
console.log("done");
