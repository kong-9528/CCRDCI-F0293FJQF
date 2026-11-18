/**
 * 1) portal partners: keep 原2/5/1/10 + a designed "更多合作伙伴" card
 * 2) query placeholder: 请输入DCI码或登记号
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portal = path.join(root, "mirror/static/js/portal-CGcjgAeB.js");
const query = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const overrides = path.join(root, "mirror/overrides.css");
const indexHtml = path.join(root, "mirror/index.html");

let p = fs.readFileSync(portal, "utf8");
const oldH =
  'H=[{name:"中国标准化研究院",logo:ue},{name:"雅昌",logo:ge},{name:"中文在线",logo:pe},{name:"保利文化",logo:fe},{name:"蚂蚁集团",logo:ye},{name:"中央广播电视总台",logo:he},{name:"南方文交所",logo:Re},{name:"华为云",logo:Ce},{name:"花瓣美素",logo:me},{name:"淘天集团",logo:Be}]';
const newH =
  'H=[{name:"雅昌",logo:ge},{name:"蚂蚁集团",logo:ye},{name:"中国标准化研究院",logo:ue},{name:"淘天集团",logo:Be},{name:"更多合作伙伴",more:!0}]';

if (p.includes(newH)) {
  console.log("partners list already updated");
} else if (!p.includes(oldH)) {
  const i = p.indexOf("H=[{name:");
  throw new Error("partner list anchor missing: " + p.slice(i, i + 180));
} else {
  p = p.replace(oldH, newH);
  console.log("partners reordered to 2/5/1/10 + more");
}

const oldRender =
  'C(H,n=>e("div",{key:n.name,class:"partner-card flex-col align-center justify-center"},[e("img",{class:"partner-mark",referrerpolicy:"no-referrer",src:n.logo,alt:""},null,8,Le),e("span",Ne,f(n.name),1)]))';
const newRender =
  'C(H,n=>n.more?(e("div",{key:n.name,class:"partner-card partner-card-more flex-col align-center justify-center","aria-label":"更多合作伙伴"},[e("div",{class:"partner-more-visual","aria-hidden":"true"},[e("span",{class:"partner-more-orb partner-more-orb-a"}),e("span",{class:"partner-more-orb partner-more-orb-b"}),e("span",{class:"partner-more-orb partner-more-orb-c"}),e("span",{class:"partner-more-plus"})]),e("span",{class:"partner-more-label"},"更多合作伙伴")])):e("div",{key:n.name,class:"partner-card flex-col align-center justify-center"},[e("img",{class:"partner-mark",referrerpolicy:"no-referrer",src:n.logo,alt:""},null,8,Le),e("span",Ne,f(n.name),1)]))';

if (p.includes("partner-card-more")) {
  console.log("more-card render already present");
} else if (!p.includes(oldRender)) {
  const i = p.indexOf("C(H,n=>");
  throw new Error("partner render anchor missing: " + p.slice(i, i + 220));
} else {
  p = p.replace(oldRender, newRender);
  console.log("more-card render patched");
}

fs.writeFileSync(portal, p);
const checkPortal = spawnSync(process.execPath, ["--check", portal], {
  encoding: "utf8",
});
if (checkPortal.status !== 0) {
  console.error(checkPortal.stderr);
  process.exit(1);
}

// Query placeholder
let q = fs.readFileSync(query, "utf8");
const oldPh = 'placeholder:"请输入DCI码或登记证书编号"';
const newPh = 'placeholder:"请输入DCI码或登记号"';
if (q.includes(newPh)) {
  console.log("query placeholder already updated");
} else if (!q.includes(oldPh)) {
  throw new Error("query placeholder missing");
} else {
  q = q.replaceAll(oldPh, newPh);
  fs.writeFileSync(query, q);
  console.log("query placeholder updated");
}
const checkQuery = spawnSync(process.execPath, ["--check", query], {
  encoding: "utf8",
});
if (checkQuery.status !== 0) {
  console.error(checkQuery.stderr);
  process.exit(1);
}

// Styles for more card
let css = fs.readFileSync(overrides, "utf8");
const styleMark = "/* portal partner more card */";
const styleBlock = `${styleMark}
.partner-card-more[data-v-58bb0b90],
.partner-card.partner-card-more {
  position: relative;
  overflow: hidden;
  border: 1px solid transparent !important;
  background:
    linear-gradient(180deg, #ffffff 0%, #f4f8fd 100%) padding-box,
    linear-gradient(135deg, #5b9cf6 0%, #1345a5 55%, #7eb6ff 100%) border-box !important;
  cursor: default;
}
.partner-card-more[data-v-58bb0b90]:hover,
.partner-card.partner-card-more:hover {
  background:
    linear-gradient(180deg, #123f96 0%, #0d2f73 100%) padding-box,
    linear-gradient(135deg, #8ec2ff 0%, #1345a5 50%, #5b9cf6 100%) border-box !important;
  border-color: transparent !important;
}
.partner-more-visual {
  position: relative;
  width: 72px;
  height: 42px;
  margin-bottom: 10px;
}
.partner-more-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #9ec5ff, #1345a5 70%);
  box-shadow: 0 0 0 1px #ffffff80;
}
.partner-more-orb-a { width: 18px; height: 18px; left: 8px; top: 12px; opacity: .95; }
.partner-more-orb-b { width: 14px; height: 14px; left: 30px; top: 6px; opacity: .8; }
.partner-more-orb-c { width: 12px; height: 12px; left: 48px; top: 16px; opacity: .7; }
.partner-more-plus {
  position: absolute;
  right: 0;
  top: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1345a5;
  color: #fff;
}
.partner-more-plus::before,
.partner-more-plus::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
}
.partner-more-plus::before { width: 10px; height: 2px; }
.partner-more-plus::after { width: 2px; height: 10px; }
.partner-more-label {
  display: block !important;
  color: #1345a5;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: .04em;
  font-weight: 600;
}
.partner-card-more:hover .partner-more-label {
  color: #fff;
}
.partner-card-more:hover .partner-more-orb {
  background: radial-gradient(circle at 30% 30%, #d7e8ff, #7eb6ff 70%);
}
.partner-card-more:hover .partner-more-plus {
  background: #fff;
}
.partner-card-more:hover .partner-more-plus::before,
.partner-card-more:hover .partner-more-plus::after {
  background: #1345a5;
}
`;

if (css.includes(styleMark)) {
  css = css.replace(/\/\* portal partner more card \*\/[\s\S]*?(?=\n\/\*|\n*$)/, styleBlock + "\n");
} else {
  css += "\n" + styleBlock + "\n";
}
fs.writeFileSync(overrides, css);

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /href="\/overrides\.css(\?v=[^"]*)?"/,
  'href="/overrides.css?v=portal-partners-5-20261118"',
);
fs.writeFileSync(indexHtml, h);

// sanity
if (!p.includes('name:"雅昌"') || !p.includes('name:"蚂蚁集团"')) throw new Error("order missing");
if (!p.includes("更多合作伙伴")) throw new Error("more card missing");
if (!q.includes('placeholder:"请输入DCI码或登记号"')) throw new Error("placeholder missing");
console.log("OK");
