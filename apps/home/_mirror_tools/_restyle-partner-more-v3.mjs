import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portal = path.join(root, "mirror/static/js/portal-CGcjgAeB.js");
const overrides = path.join(root, "mirror/overrides.css");
const indexHtml = path.join(root, "mirror/index.html");

let p = fs.readFileSync(portal, "utf8");

const candidates = [
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-rail"}),e("span",{class:"partner-more-node partner-more-node-a"}),e("span",{class:"partner-more-node partner-more-node-b"}),e("span",{class:"partner-more-node partner-more-node-c"}),e("span",{class:"partner-more-node partner-more-node-open"})])',
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-orb partner-more-orb-a"}),e("span",{class:"partner-more-orb partner-more-orb-b"}),e("span",{class:"partner-more-orb partner-more-orb-c"}),e("span",{class:"partner-more-plus"})])',
];

const newVisual =
  'e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-stack partner-more-stack-back"}),e("span",{class:"partner-more-stack partner-more-stack-mid"}),e("span",{class:"partner-more-stack partner-more-stack-front"}),e("span",{class:"partner-more-mark"})])';

if (p.includes("partner-more-stack-front")) {
  console.log("stack visual already present");
} else {
  let replaced = false;
  for (const old of candidates) {
    if (p.includes(old)) {
      p = p.replace(old, newVisual);
      replaced = true;
      break;
    }
  }
  if (!replaced) {
    const i = p.indexOf("partner-more-visual");
    throw new Error("visual anchor missing: " + p.slice(i, i + 280));
  }
  fs.writeFileSync(portal, p);
  console.log("portal visual updated to stack");
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
  width: 56px;
  height: 36px;
  margin-bottom: 10px;
}
.partner-more-stack {
  position: absolute;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #9aa3af;
  background: #fff;
}
.partner-more-stack-back {
  width: 34px;
  height: 22px;
  left: 14px;
  top: 0;
  opacity: .45;
}
.partner-more-stack-mid {
  width: 34px;
  height: 22px;
  left: 8px;
  top: 6px;
  opacity: .7;
}
.partner-more-stack-front {
  width: 34px;
  height: 22px;
  left: 2px;
  top: 12px;
  opacity: 1;
  background: #f3f5f8;
}
.partner-more-mark {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #9aa3af;
  background: #fff;
  box-sizing: border-box;
}
.partner-more-mark::before,
.partner-more-mark::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  background: #9aa3af;
  transform: translate(-50%, -50%);
}
.partner-more-mark::before { width: 7px; height: 1px; }
.partner-more-mark::after { width: 1px; height: 7px; }
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
.partner-card-more:hover .partner-more-stack {
  border-color: #ffffffd9;
  background: transparent;
}
.partner-card-more:hover .partner-more-stack-front {
  background: #ffffff24;
}
.partner-card-more:hover .partner-more-mark {
  border-color: #fff;
  background: transparent;
}
.partner-card-more:hover .partner-more-mark::before,
.partner-card-more:hover .partner-more-mark::after {
  background: #fff;
}

`;

css = css.slice(0, start) + styleBlock + css.slice(end);
fs.writeFileSync(overrides, css);

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /overrides\.css(\?v=[^"]*)?/,
  "overrides.css?v=portal-partners-more-v3-20261118",
);
fs.writeFileSync(indexHtml, h);
console.log("OK");
