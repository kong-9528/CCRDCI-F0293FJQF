import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portal = path.join(root, "mirror/static/js/portal-CGcjgAeB.js");
const overrides = path.join(root, "mirror/overrides.css");
const indexHtml = path.join(root, "mirror/index.html");

let p = fs.readFileSync(portal, "utf8");
const from =
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-stack partner-more-stack-back"}),e("span",{class:"partner-more-stack partner-more-stack-mid"}),e("span",{class:"partner-more-stack partner-more-stack-front"}),e("span",{class:"partner-more-mark"})])';
const to =
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-stack partner-more-stack-back"}),e("span",{class:"partner-more-stack partner-more-stack-mid"}),e("span",{class:"partner-more-stack partner-more-stack-front"})])';

if (p.includes(to)) {
  console.log("mark already removed from markup");
} else if (!p.includes(from)) {
  throw new Error("stack visual with mark not found");
} else {
  p = p.replace(from, to);
  fs.writeFileSync(portal, p);
  console.log("removed mark from markup");
}

const check = spawnSync(process.execPath, ["--check", portal], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  process.exit(1);
}

let css = fs.readFileSync(overrides, "utf8");
css = css.replace(/\.partner-more-mark \{[\s\S]*?\.partner-more-mark::after \{ width: 1px; height: 7px; \}\n/, "");
css = css.replace(/\.partner-card-more:hover \.partner-more-mark \{[\s\S]*?\.partner-card-more:hover \.partner-more-mark::after \{\n  background: #fff;\n\}\n/, "");
fs.writeFileSync(overrides, css);

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /overrides\.css(\?v=[^"]*)?/,
  "overrides.css?v=portal-partners-more-v3b-20261118",
);
fs.writeFileSync(indexHtml, h);
console.log("OK");
