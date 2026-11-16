/**
 * Verify DCI query mock catalog after field/scenario updates.
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

assert(Array.isArray(catalog) && catalog.length === 9, `expect 9 rows, got ${catalog.length}`);
assert(!catalog.some((r) => ["mock-soft-dci-ok", "mock-soft-dci-rev", "mock-data-dci-ok", "mock-data-dci-rev"].includes(r.id)), "removed scenarios still present");
assert(!catalog.some((r) => has(r, "作品类型")), "作品类型 should be renamed");
assert(!catalog.some((r) => has(r, "DCI分配日期")), "DCI分配日期 should be renamed");

const classic = catalog.find((r) => r.id === "mock-dci11-1");
assert(classic, "missing classic");
assert(val(classic, "著作权人") === "华章版权文化有限公司", "classic owner");
assert(val(classic, "DCI注册中心") === "蚂蚁科技集团股份有限公司", "classic org");
assert(val(classic, "作品类别") === "文字", "classic category");
assert(val(classic, "DCI申领时间") === "2026-07-01 09:30:00", "classic apply datetime");

const data11 = catalog.find((r) => r.id === "mock-data-reg-ok");
assert(data11, "missing scenario 11");
assert(val(data11, "DCI注册中心") === "中国版权保护中心", "scenario 11 org");
assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val(data11, "DCI申领时间")), "scenario 11 datetime");

const soft7 = catalog.find((r) => r.id === "mock-soft-reg-ok");
assert(soft7, "missing scenario 7");
assert(val(soft7, "软件全称") === "工业视觉检测软件", "soft7 full name");
assert(!has(soft7, "软件名称"), "soft7 should use 软件全称");
assert(!(soft7.fields[0] || {}).full, "soft7 name should share row");
assert(val(soft7, "DCI申领时间") === "2026-02-01 16:40:00", "soft7 apply");
assert(val(soft7, "著作权人") === "智造联科技股份有限公司", "soft7 owner");
assert(val(soft7, "软件简称") === "智造视检", "soft7 short name");
assert(val(soft7, "版本号") === "V3.2.1", "soft7 version");
assert(
  labels(soft7).join("|") ===
    "软件全称|DCI申领时间|著作权人|DCI注册中心|软件简称|版本号|登记号|登记日期",
  "soft7 field order",
);

assert(pageJs.includes('typeLabel:"作品类别"'), "page typeLabel");
assert(pageJs.includes('label:"DCI申领时间"'), "page apply label");
assert(pageJs.includes("function __formatDateTime("), "page datetime formatter");
assert(!pageJs.includes('typeLabel:"作品类型"'), "page should not keep 作品类型");

for (const row of catalog) {
  assert(row.kind === "dci", `${row.id} kind`);
  assert(!!row.dciCode, `${row.id} dciCode`);
  assert(row.matchCodes.includes(row.dciCode), `${row.id} matchCodes`);
  assert((row.matchKeywords || []).length >= 1, `${row.id} keywords`);
  const apply = val(row, "DCI申领时间");
  if (apply) assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(apply), `${row.id} apply format`);
}

console.log(`OK: ${catalog.length} scenarios verified`);
for (const row of catalog) {
  console.log(
    `- ${row.id}: ${row.dciCode}${row.relatedRegNo ? " / " + row.relatedRegNo : ""} | ${row.dciStatus === "2" ? "撤销" : "正常"} | ${labels(row).join("、")}`,
  );
}
