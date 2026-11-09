import fs from "node:fs";
import vm from "node:vm";

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync("apps/home/mirror/static/js/dci-query-mock-catalog.js", "utf8"),
  sandbox
);
const catalog = sandbox.window.__DCI_QUERY_MOCK_CATALOG__;

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
function fieldVal(row, label) {
  for (const f of row.fields || []) if (f.label === label) return String(f.value || "");
  return "";
}
function deriveFinalStatus(rows) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i] || {};
    if (row.kind === "dci") continue;
    const biz = String(row.bizLine || "");
    const notice = String(row.noticeType || "") + String(row.noticeTypeLabel || "");
    const typeVal = fieldVal(row, "类型");
    if (biz.includes("ZQC") || /冻结|解冻/.test(notice) || /冻结|解冻|轮候/.test(typeVal)) {
      if (/解冻/.test(typeVal) || (/解冻/.test(notice) && !/冻结/.test(typeVal))) return "已解冻";
      if (/冻结|轮候/.test(typeVal) || /冻结/.test(notice)) return "已冻结";
    }
    if (biz === "Z62" || biz === "ZQC（4）" || biz === "R42R44" || /撤销/.test(notice)) return "已撤销";
  }
  return "";
}
function hit(code, kw) {
  const C = normQuery(code);
  const K = normKeyword(kw);
  let hits = catalog
    .filter((row) => {
      const codes = (row.matchCodes || []).map(normQuery);
      const keys = (row.matchKeywords || []).map(normKeyword);
      return codes.includes(C) && keys.includes(K);
    })
    .sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")))
    .map((row) => ({ ...row, fields: (row.fields || []).slice() }));
  const finalStatus = deriveFinalStatus(hits);
  hits.forEach((row, idx) => {
    row.statusLabel = row.kind === "dci" ? "" : idx === 0 ? finalStatus : "";
  });
  return hits;
}

const z = hit("国作登字-2026-G-00000004", "鲍朵朵");
const r = hit("2021SR1109203", "南京沁恒微电子股份有限公司");
console.log(
  "Z",
  z.length,
  "final",
  z[0].statusLabel,
  z.map((x) => x.id + "@" + x.eventDate + (fieldVal(x, "类型") ? "(" + fieldVal(x, "类型") + ")" : ""))
);
console.log(
  "R",
  r.length,
  "final",
  r[0].statusLabel,
  r.map((x) => x.id)
);

if (z[0].statusLabel !== "已解冻") throw new Error("Z expect 已解冻");
if (r[0].statusLabel !== "已撤销") throw new Error("R expect 已撤销");
if (z.slice(1).some((x) => x.statusLabel)) throw new Error("only first should mark");
console.log("ok");

const page = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
const css = fs.readFileSync("apps/home/mirror/static/css/index-DogJsFVJ.css", "utf8");
const mock = fs.readFileSync("apps/home/mirror/static/js/dci-mock-api.js", "utf8");
console.log({
  pageUnfrozen: page.includes("is-unfrozen"),
  cssUnfrozen: css.includes("is-unfrozen"),
  mockDerive: mock.includes("deriveFinalStatus"),
});
