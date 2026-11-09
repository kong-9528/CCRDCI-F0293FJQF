import fs from "node:fs";
import vm from "node:vm";

const page = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
const css = fs.readFileSync("apps/home/mirror/static/css/index-DogJsFVJ.css", "utf8");
const html = fs.readFileSync("apps/home/mirror/index.html", "utf8");
const mock = fs.readFileSync("apps/home/mirror/static/js/dci-mock-api.js", "utf8");
const catalogSrc = fs.readFileSync("apps/home/mirror/static/js/dci-query-mock-catalog.js", "utf8");

const checks = {
  helper: page.includes("function __resolveQueryFields("),
  head: page.includes("__renderResultHead(l)"),
  rows: page.includes("__buildFieldRows(l)"),
  placeholder: page.includes("请输入DCI码或登记证书编号"),
  warn: page.includes("请输入DCI码或登记证书编号"),
  cssNotice: css.includes(".result-notice-type"),
  htmlCatalog: html.includes("dci-query-mock-catalog.js"),
  mockCatalog: mock.includes("__DCI_QUERY_MOCK_CATALOG__"),
};
console.log(checks);
if (Object.values(checks).some((v) => !v)) {
  throw new Error("verification failed");
}

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(catalogSrc, sandbox);
const catalog = sandbox.window.__DCI_QUERY_MOCK_CATALOG__;
console.log("catalog size", catalog.length);
console.log(
  catalog.map((r) => ({
    id: r.id,
    biz: r.bizLine,
    type: r.noticeTypeLabel,
    no: r.titleNo,
    kw: r.matchKeywords[0],
  }))
);

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
  return catalog.filter((row) => {
    const codes = (row.matchCodes || []).map(normQuery);
    const keys = (row.matchKeywords || []).map(normKeyword);
    return codes.includes(c) && keys.includes(k);
  });
}

const samples = [
  ["国作登字-2022-F-10143281", "浙江海森药业股份有限公司"],
  ["2021SR1109203", "南京沁恒微电子股份有限公司"],
  ["DCI:RQZ010ANT.156.202607012098976446", "数字版权保护技术规范"],
  ["国作登字-2026-F-00012345", "中国版权保护中心"],
  ["浙作登字-2024-F-0009988", "西湖印象摄影作品"],
];
for (const [a, b] of samples) {
  const h = hit(a, b);
  console.log("hit", a, "=>", h.map((x) => x.id).join(",") || "NONE");
}
