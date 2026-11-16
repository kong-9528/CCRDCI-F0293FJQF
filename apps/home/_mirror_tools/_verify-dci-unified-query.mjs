/**
 * Verify unified DCI query mock catalog against 样例_新.md.
 */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogJs = fs.readFileSync(
  path.join(root, "mirror/static/js/dci-query-mock-catalog.js"),
  "utf8",
);
const pageJs = fs.readFileSync(
  path.join(root, "mirror/static/js/index-BZ7-YeMc.js"),
  "utf8",
);

const sandbox = { window: {}, globalThis: {} };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(catalogJs, sandbox);
const catalog = sandbox.__DCI_QUERY_MOCK_CATALOG__;

function labels(row) {
  return (row.fields || []).map((f) => f.label);
}
function val(row, label) {
  const f = (row.fields || []).find((x) => x.label === label);
  return f ? f.value : undefined;
}
function has(row, label) {
  return labels(row).includes(label);
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(Array.isArray(catalog) && catalog.length >= 12, `expect >=12 rows, got ${catalog.length}`);
assert(pageJs.includes("function __isDciResult(l){return!!l}"), "page must force DCI result format");
assert(pageJs.includes('function __renderRelatedDci(l,idx){return T("",!0)}'), "related DCI under notice head disabled");
assert(!pageJs.includes("result-reg-title"), "notice-style reg title head should be gone");

const classic = catalog.find((r) => r.id === "mock-dci11-1");
assert(classic, "missing classic mock-dci11-1");
assert(classic.dciCode === "DCI:RBQDJZCPC.156.202607012098976446", "classic dciCode");
assert(classic.relatedRegNo === "国作登字-2026-F-10000123", "classic reg");
assert(val(classic, "作品名称") === "《数字版权保护技术规范》", "classic name");
assert(val(classic, "作品类型") === "文字", "classic type");
assert(val(classic, "DCI分配日期") === "2026-07-01", "classic apply");
assert(val(classic, "著作权人") === "中国版权保护中心", "classic owner");
assert(val(classic, "DCI注册中心") === "中国版权保护中心", "classic org");
assert(val(classic, "登记号") === "国作登字-2026-F-10000123", "classic reg field");
assert(val(classic, "登记日期") === "2026-01-15", "classic reg date");
assert(pageJs.includes("DCI:RBQDJZCPC.156.202607012098976446"), "page hint classic DCI");

const expected = [
  ["mock-work-dci-ok", "work", false, false, ["作品名称", "作品类型", "DCI分配日期", "著作权人", "DCI注册中心"]],
  ["mock-work-dci-rev", "work", false, true, ["作品名称", "DCI撤销日期"]],
  ["mock-work-reg-ok", "work", true, false, ["作品名称", "作品类型", "登记号", "登记日期"]],
  ["mock-work-reg-rev", "work", true, true, ["作品名称", "DCI撤销日期", "登记号", "登记撤销日期"]],
  ["mock-soft-dci-ok", "software", false, false, ["软件名称", "DCI分配日期", "DCI注册中心"]],
  ["mock-soft-dci-rev", "software", false, true, ["软件名称", "DCI撤销日期"]],
  ["mock-soft-reg-ok", "software", true, false, ["软件名称", "DCI分配日期", "登记号", "登记日期"]],
  ["mock-soft-reg-rev", "software", true, true, ["软件名称", "DCI撤销日期", "登记号", "登记撤销日期"]],
  ["mock-data-dci-ok", "data", false, false, ["数据名称", "作品类别", "权利人", "DCI注册中心"]],
  ["mock-data-dci-rev", "data", false, true, ["数据名称", "DCI撤销日期"]],
  ["mock-data-reg-ok", "data", true, false, ["数据名称", "作品类别", "权利人", "登记号", "登记日期"]],
  ["mock-data-reg-rev", "data", true, true, ["数据名称", "DCI撤销日期", "登记号", "登记撤销日期"]],
];

const byId = Object.fromEntries(catalog.map((r) => [r.id, r]));
for (const [id, assetType, hasReg, revoked, needLabels] of expected) {
  const row = byId[id];
  assert(row, `missing ${id}`);
  assert(row.kind === "dci", `${id} kind`);
  assert(!!row.dciCode, `${id} must have dciCode`);
  assert(row.assetType === assetType, `${id} assetType`);
  assert(!!(row.relatedRegNo || "").trim() === hasReg, `${id} relatedRegNo`);
  assert((row.dciStatus === "2") === revoked, `${id} dciStatus`);
  for (const lab of needLabels) {
    assert(has(row, lab), `${id} missing field ${lab}; got ${labels(row).join(",")}`);
  }
  assert(row.matchCodes.includes(row.dciCode), `${id} matchCodes includes dci`);
  if (hasReg) assert(row.matchCodes.includes(row.relatedRegNo), `${id} matchCodes includes reg`);
  assert((row.matchKeywords || []).length >= 1, `${id} keywords`);
}

assert(byId["mock-data-dci-ok"].dciCode === "DCI:RTDK11TJI.156.20260118I9K1M3P5R7", "data ok dci");
assert(val(byId["mock-data-dci-ok"], "数据名称") === "2025年全国媒体行业用户情感分析数据", "data ok name");
assert(val(byId["mock-data-reg-ok"], "登记号") === "HBD-2026-2000023", "data reg ok no");
assert(val(byId["mock-data-reg-rev"], "登记号") === "HBD-2026-2000024", "data reg rev no");
assert(val(byId["mock-work-reg-ok"], "登记日期") === "2026-01-25", "work reg date");

console.log(`OK: ${catalog.length} unified DCI query scenarios verified`);
for (const row of catalog) {
  console.log(
    `- ${row.id}: ${row.dciCode}${row.relatedRegNo ? " / " + row.relatedRegNo : ""} | ${row.dciStatus === "2" ? "撤销" : "正常"} | ${labels(row).join("、")}`,
  );
}
