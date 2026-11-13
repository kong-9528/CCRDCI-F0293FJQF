/**
 * Minimal safe patch on clean index-BZ7-YeMc.js
 * - Hide "为您找到 N 条..."
 * - Insert disclaimer as last child of Ve (below result card)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const indexHtml = path.join(root, "mirror/index.html");
const overrides = path.join(root, "mirror/overrides.css");
const DISCLAIMER = "本系统的数据信息并非实时更新，有一定滞后性，仅供参考。";

const original = fs.readFileSync(page, "utf8");
let s = original;

function restoreAndFail(msg) {
  fs.writeFileSync(page, original);
  throw new Error(msg);
}

if (s.includes(DISCLAIMER) || s.includes("query-disclaimer")) {
  restoreAndFail("expected clean rollback");
}

const classFrom =
  'Ke={key:0,class:"query-limit"},Ve={key:0,class:"result-section flex-col"}';
const classTo =
  'Ke={key:0,class:"query-limit"},qt={class:"query-disclaimer"},Ve={key:0,class:"result-section flex-col"}';
if (!s.includes(classFrom)) restoreAndFail("class map anchor missing");
s = s.replace(classFrom, classTo);

const tipFrom =
  't("div",{class:"result-count-tip"},"为您找到 "+k(o(r).length)+" 条符合条件的结果",1)';
const tipTo = 'T("",!0)/* result-count-tip temporarily hidden */';
if (!s.includes(tipFrom)) restoreAndFail("result-count-tip missing");
s = s.replace(tipFrom, tipTo);

// FROM after empty text:
//   "))])),[[a...
//   " )close-g )close-(d,g) ]close-Ve )close-gVe )close-Harg ,[[a
// TO:
//   ")),DISC])),[[a...
//   " )close-g )close-(d,g) ,DISC ]close-Ve )close-gVe )close-Harg ,[[a
const endFrom =
  '未找到匹配的记录，请调整查询条件后重试"))])),[[a,o(c)]]):T("",!0)';
const endTo =
  '未找到匹配的记录，请调整查询条件后重试")),e[19]||(e[19]=t("div",qt,"' +
  DISCLAIMER +
  '",-1))])),[[a,o(c)]]):T("",!0)';

if (!s.includes(endFrom)) restoreAndFail("Ve close anchor missing");
s = s.replace(endFrom, endTo);

// Bracket balance sanity around insert
const expected =
  '未找到匹配的记录，请调整查询条件后重试")),e[19]||(e[19]=t("div",qt,"' +
  DISCLAIMER +
  '",-1))])),[[a,o(c)]]):T("",!0)';
if (!s.includes(expected)) restoreAndFail("insert pattern mismatch");

fs.writeFileSync(page, s);
const check = spawnSync(process.execPath, ["--check", page], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  restoreAndFail("syntax error");
}

if ((s.split(DISCLAIMER).length - 1) !== 1) restoreAndFail("disclaimer count");
if (s.includes("为您找到")) restoreAndFail("count tip still visible");

let css = fs.readFileSync(overrides, "utf8");
css = css.replace(/\n?\/\* DCI 查询页[\s\S]*?\.query-disclaimer \{[\s\S]*?\}\n?/g, "\n");
if (!css.includes(".query-disclaimer")) {
  css += `
/* DCI 查询页声明：结果卡片下方 */
.query-disclaimer {
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  text-align: left;
}
`;
}
fs.writeFileSync(overrides, css);

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /href="\/overrides\.css(\?v=[^"]*)?"/,
  'href="/overrides.css?v=dci-disclaimer-min3-20261113"',
);
fs.writeFileSync(indexHtml, h);

console.log("OK");
const i = s.indexOf(DISCLAIMER);
console.log(s.slice(i - 60, i + DISCLAIMER.length + 35));
