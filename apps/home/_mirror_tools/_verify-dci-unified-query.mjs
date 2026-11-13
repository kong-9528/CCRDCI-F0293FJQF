/**
 * Verify unified DCI query mock catalog: 12 scenarios + required fields.
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
function has(row, label) {
  return labels(row).includes(label);
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(Array.isArray(catalog) && catalog.length === 12, `expect 12 rows, got ${catalog.length}`);
assert(pageJs.includes("function __isDciResult(l){return!!l}"), "page must force DCI result format");
assert(pageJs.includes('function __renderRelatedDci(l,idx){return T("",!0)}'), "related DCI under notice head disabled");
assert(!pageJs.includes("result-reg-title"), "notice-style reg title head should be gone");

const expected = [
  ["mock-work-dci-ok", "work", false, false, ["作品名称", "作品类型"]],
  ["mock-work-dci-rev", "work", false, true, ["作品名称", "作品类型", "DCI撤销日期"]],
  ["mock-work-reg-ok", "work", true, false, ["作品名称", "作品类型", "登记号", "登记日期"]],
  ["mock-work-reg-rev", "work", true, true, ["作品名称", "作品类型", "登记号", "登记日期", "DCI撤销日期", "登记撤销日期"]],
  ["mock-soft-dci-ok", "software", false, false, ["软件名称", "软件分类"]],
  ["mock-soft-dci-rev", "software", false, true, ["软件名称", "软件分类", "DCI撤销日期"]],
  ["mock-soft-reg-ok", "software", true, false, ["软件名称", "软件分类", "登记号", "登记日期"]],
  ["mock-soft-reg-rev", "software", true, true, ["软件名称", "软件分类", "登记号", "登记日期", "DCI撤销日期", "登记撤销日期"]],
  ["mock-data-dci-ok", "data", false, false, ["数据名称", "数据类型"]],
  ["mock-data-dci-rev", "data", false, true, ["数据名称", "数据类型", "DCI撤销日期"]],
  ["mock-data-reg-ok", "data", true, false, ["数据名称", "数据类型", "登记号", "登记日期"]],
  ["mock-data-reg-rev", "data", true, true, ["数据名称", "数据类型", "登记号", "登记日期", "DCI撤销日期", "登记撤销日期"]],
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
  if (assetType === "data") {
    assert(has(row, "数据类型"), `${id} 数据类型`);
    const f = row.fields.find((x) => x.label === "数据类型");
    assert(f && f.value === "美术作品汇编", `${id} 数据类型示例`);
  }
  // match by dci and by reg if present
  assert(row.matchCodes.includes(row.dciCode), `${id} matchCodes includes dci`);
  if (hasReg) assert(row.matchCodes.includes(row.relatedRegNo), `${id} matchCodes includes reg`);
  assert((row.matchKeywords || []).length >= 1, `${id} keywords`);
}

console.log("OK: 12 unified DCI query scenarios verified");
for (const row of catalog) {
  console.log(
    `- ${row.id}: ${row.dciCode}${row.relatedRegNo ? " / " + row.relatedRegNo : ""} | ${row.dciStatus === "2" ? "撤销" : "正常"} | ${labels(row).join("、")}`,
  );
}
