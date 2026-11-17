/**
 * Verify DCI+keyword hits for scenarios 7/8/11/12 after code updates.
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
const indexHtml = path.join(root, "mirror/index.html");

const sandbox = { window: {}, globalThis: {} };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(catalogJs, sandbox);
const catalog = sandbox.__DCI_QUERY_MOCK_CATALOG__;

function normQuery(s) {
  return String(s || "")
    .trim()
    .replace(/[\s\u3000]+/g, "")
    .toUpperCase();
}
function normKeyword(s) {
  return String(s || "")
    .trim()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[《》]/g, "");
}
function hit(dciCode, keyword) {
  const codeOrReg = normQuery(dciCode);
  const kw = normKeyword(keyword);
  return catalog.filter((row) => {
    const codes = (row.matchCodes || []).map(normQuery);
    const keys = (row.matchKeywords || []).map(normKeyword);
    return codes.includes(codeOrReg) && keys.includes(kw);
  });
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const cases = [
  ["mock-soft-reg-ok", "DCI:RBQDJRCPC.156.20260201G7I9K1M3P5", "工业视觉检测软件", "中国版权保护中心"],
  ["mock-soft-reg-rev", "DCI:RBQDJRCPC.156.20250410H8J0L2N4Q6", "跨境电商库存同步软件", null],
  ["mock-data-reg-ok", "DCI:RBQDJSCPC.156.20260212K1M3P5R7T9", "非遗彩绘图样数据集", "中国版权保护中心"],
  ["mock-data-reg-rev", "DCI:RBQDJSCPC.156.20250715L2N4Q6S8U0", "近代海报图样汇编包", null],
];

for (const [id, code, kw, org] of cases) {
  const row = catalog.find((r) => r.id === id);
  assert(row, `missing ${id}`);
  assert(row.dciCode === code, `${id} dciCode want ${code} got ${row.dciCode}`);
  assert(row.matchCodes.includes(code), `${id} matchCodes missing dci`);
  const mid = code.replace(/^DCI:/i, "").split(".")[0];
  assert(/^[RCX][A-Z0-9]{8,11}$/.test(mid), `${id} bad mid ${mid}`);
  const found = hit(code, kw);
  assert(found.length === 1 && found[0].id === id, `${id} DCI+keyword miss`);
  // also hit by reg no when present
  if (row.relatedRegNo) {
    const byReg = hit(row.relatedRegNo, kw);
    assert(byReg.length === 1 && byReg[0].id === id, `${id} reg+keyword miss`);
  }
  if (org) {
    const f = (row.fields || []).find((x) => x.label === "DCI注册中心");
    assert(f && f.value === org, `${id} org want ${org} got ${f && f.value}`);
    assert(row.regOrgName === org, `${id} regOrgName`);
  }
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-rbq-fix-20261117",
);
fs.writeFileSync(indexHtml, h);

console.log("OK: 7/8/11/12 codes + query hits verified");
for (const [id, code] of cases) {
  console.log(`- ${id}: ${code}`);
}
