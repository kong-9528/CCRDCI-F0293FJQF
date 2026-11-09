import fs from "node:fs";
import vm from "node:vm";

const page = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
console.log({
  relatedIdx: page.includes("__renderRelatedDci(l,idx)"),
  showTitleNo: page.includes("showTitleNo"),
  statusCancelled: page.includes("is-cancelled"),
  countTip: page.includes("result-count-tip"),
  // rough bracket balance in file
});

// check helper region parses as function body snippets via Function
const hs = page.indexOf("function __resolveQueryFields");
const he = page.indexOf("return pe(async()");
const helpers = page.slice(hs, he);
try {
  // wrap with fake deps
  new Function(
    "t",
    "g",
    "d",
    "T",
    "L",
    "k",
    "o",
    "Le",
    "Ze",
    "Fe",
    "He",
    "B",
    "V",
    "Z",
    "Q",
    helpers + "; return {__renderResultHead,__renderRelatedDci};"
  );
  console.log("helpers parse ok");
} catch (e) {
  console.error("helpers parse fail", e.message);
  process.exit(1);
}

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("apps/home/mirror/static/js/dci-query-mock-catalog.js", "utf8"), sandbox);
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
function hit(code, kw) {
  const c = normQuery(code);
  const k = normKeyword(kw);
  const rows = catalog
    .filter((row) => {
      const codes = (row.matchCodes || []).map(normQuery);
      const keys = (row.matchKeywords || []).map(normKeyword);
      return codes.includes(c) && keys.includes(k);
    })
    .sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
  return rows;
}

const a = hit("国作登字-2026-G-00000004", "鲍朵朵");
console.log(
  "multi A",
  a.map((x) => ({
    id: x.id,
    showTitleNo: x.showTitleNo,
    titleNo: x.titleNo,
    label: x.noticeTypeLabel,
    status: x.statusLabel,
    dci: x.dciCode,
    date: x.eventDate,
  }))
);

const b = hit("国作登字-2022-F-10143281", "海森药业标志设计");
console.log(
  "multi B",
  b.map((x) => ({ id: x.id, showTitleNo: x.showTitleNo, label: x.noticeTypeLabel, dci: x.dciCode, date: x.eventDate }))
);

if (a.length !== 2 || a[0].showTitleNo !== true || a[1].showTitleNo !== false) {
  console.error("multi A assertion failed");
  process.exit(1);
}
if (b.length !== 2) {
  console.error("multi B expected 2 got", b.length);
  process.exit(1);
}
console.log("ok");
