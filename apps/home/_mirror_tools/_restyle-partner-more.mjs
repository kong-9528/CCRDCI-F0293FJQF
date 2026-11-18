import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portal = path.join(root, "mirror/static/js/portal-CGcjgAeB.js");
const overrides = path.join(root, "mirror/overrides.css");
const indexHtml = path.join(root, "mirror/index.html");

let p = fs.readFileSync(portal, "utf8");

const oldVisual =
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-orb partner-more-orb-a"}),e("span",{class:"partner-more-orb partner-more-orb-b"}),e("span",{class:"partner-more-orb partner-more-orb-c"}),e("span",{class:"partner-more-plus"})])';

const newVisual =
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-rail"}),e("span",{class:"partner-more-node partner-more-node-a"}),e("span",{class:"partner-more-node partner-more-node-b"}),e("span",{class:"partner-more-node partner-more-node-c"}),e("span",{class:"partner-more-node partner-more-node-open"})])';

if (p.includes("partner-more-node-open")) {
  console.log("visual already replaced");
} else if (!p.includes(oldVisual)) {
  const i = p.indexOf("partner-more-visual");
  throw new Error("old visual missing: " + p.slice(i, i + 260));
} else {
  p = p.replace(oldVisual, newVisual);
  fs.writeFileSync(portal, p);
  console.log("portal visual markup updated");
}

const check = spawnSync(process.execPath, ["--check", portal], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  process.exit(1);
}

let css = fs.readFileSync(overrides, "utf8");
const start = css.indexOf("/* portal partner more card */");
if (start < 0) throw new Error("style block missing");
const nextComment = css.indexOf("\n/* ", start + 10);
const end = nextComment === -1 ? css.length : nextComment;

const styleBlock = `/* portal partner more card */
.partner-card-more[data-v-58bb0b90],
.partner-card.partner-card-more {
  position: relative;
  overflow: hidden;
  border: 1px solid #e8eaed !important;
  background: #fff !important;
  cursor: default;
}
.partner-card-more[data-v-58bb0b90]:hover,
.partner-card.partner-card-more:hover {
  background: #1345a5 !important;
  border-color: #1345a5 !important;
}
.partner-more-visual {
  position: relative;
  width: 78px;
  height: 28px;
  margin-bottom: 12px;
}
.partner-more-rail {
  position: absolute;
  left: 10px;
  right: 12px;
  top: 13px;
  height: 1px;
  background: #c9d0da;
}
.partner-more-node {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  box-sizing: border-box;
}
.partner-more-node-a,
.partner-more-node-b,
.partner-more-node-c {
  border-radius: 3px;
  background: #9aa3af;
}
.partner-more-node-a {
  left: 0;
  width: 14px;
  height: 14px;
}
.partner-more-node-b {
  left: 24px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #b4bcc8;
}
.partner-more-node-c {
  left: 44px;
  width: 12px;
  height: 12px;
}
.partner-more-node-open {
  left: 64px;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px dashed #9aa3af;
  background: transparent;
}
.partner-more-node-open::before,
.partner-more-node-open::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  background: #9aa3af;
  transform: translate(-50%, -50%);
}
.partner-more-node-open::before { width: 7px; height: 1px; }
.partner-more-node-open::after { width: 1px; height: 7px; }
.partner-more-label {
  display: block !important;
  color: #5a6575;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: .04em;
  font-weight: 500;
}
.partner-card-more:hover .partner-more-label {
  color: #fff;
}
.partner-card-more:hover .partner-more-rail {
  background: #ffffff80;
}
.partner-card-more:hover .partner-more-node-a,
.partner-card-more:hover .partner-more-node-b,
.partner-card-more:hover .partner-more-node-c {
  background: #fff;
}
.partner-card-more:hover .partner-more-node-open {
  border-color: #fff;
}
.partner-card-more:hover .partner-more-node-open::before,
.partner-card-more:hover .partner-more-node-open::after {
  background: #fff;
}

`;

css = css.slice(0, start) + styleBlock + css.slice(end);
fs.writeFileSync(overrides, css);

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /overrides\.css(\?v=[^"]*)?/,
  "overrides.css?v=portal-partners-more-v2-20261118",
);
fs.writeFileSync(indexHtml, h);
console.log("OK");
