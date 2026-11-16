import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const catalog = path.join(root, "mirror/static/js/dci-query-mock-catalog.js");
const indexHtml = path.join(root, "mirror/index.html");

// 1) Catalog: remove full:true on name for revoked scenarios 2/4/8/12
let c = fs.readFileSync(catalog, "utf8");
const replacements = [
  [
    'id: "mock-work-dci-rev"',
    '{ label: "作品名称", value: "旧海报设计", full: true }',
    '{ label: "作品名称", value: "旧海报设计" }',
  ],
  [
    'id: "mock-work-reg-rev"',
    '{ label: "作品名称", value: "城市速写本", full: true }',
    '{ label: "作品名称", value: "城市速写本" }',
  ],
  [
    'id: "mock-soft-reg-rev"',
    '{ label: "软件名称", value: "跨境电商库存同步软件", full: true }',
    '{ label: "软件名称", value: "跨境电商库存同步软件" }',
  ],
  [
    'id: "mock-data-reg-rev"',
    '{ label: "数据名称", value: "近代海报图样汇编包", full: true }',
    '{ label: "数据名称", value: "近代海报图样汇编包" }',
  ],
];

for (const [idMarker, from, to] of replacements) {
  const idPos = c.indexOf(idMarker);
  if (idPos < 0) throw new Error("missing " + idMarker);
  const sliceStart = idPos;
  const sliceEnd = c.indexOf("}),", idPos) + 3;
  const block = c.slice(sliceStart, sliceEnd);
  if (!block.includes(from)) {
    if (block.includes(to)) {
      console.log(idMarker, "already without full");
      continue;
    }
    throw new Error("name field not found in " + idMarker);
  }
  c = c.slice(0, sliceStart) + block.replace(from, to) + c.slice(sliceEnd);
  console.log("catalog:", idMarker, "name no longer full-row");
}
fs.writeFileSync(catalog, c);

// 2) Page: first field only full-row when full===true; otherwise pair 2 per row from start
let s = fs.readFileSync(page, "utf8");
const oldFnStart = "function __buildFieldRows(l){const fields=__resolveQueryFields(l),rows=[];let i=0;if(fields.length){const first=fields[0];rows.push(t(\"tr\",null,[t(\"td\",{class:\"cell-label\"},(first.label||\"\")+\"：\"),t(\"td\",{class:L([\"cell-value\",{\"is-link\":!!first.link}]),colspan:\"3\"},k(__fieldText(first.value)),2)]));i=1}while(i<fields.length){";

if (!s.includes(oldFnStart) && s.includes("function __buildFieldRows(l){const fields=__resolveQueryFields(l),rows=[];let i=0;while(i<fields.length){")) {
  console.log("page layout already updated");
} else if (!s.includes(oldFnStart)) {
  const i = s.indexOf("function __buildFieldRows");
  console.error(s.slice(i, i + 280));
  throw new Error("__buildFieldRows anchor missing");
} else {
  const newStart =
    'function __buildFieldRows(l){const fields=__resolveQueryFields(l),rows=[];let i=0;while(i<fields.length){';
  s = s.replace(oldFnStart, newStart);
  fs.writeFileSync(page, s);
  console.log("page: first field respects full flag");
}

const check = spawnSync(process.execPath, ["--check", page], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  process.exit(1);
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-revoked-layout-20261116",
);
fs.writeFileSync(indexHtml, h);
console.log("OK");
