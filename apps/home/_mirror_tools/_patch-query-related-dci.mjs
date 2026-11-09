/**
 * Notice (登记号) results: show related DCI code below head border, above table.
 * Blue, not bold. DCI-code queries unchanged.
 */
import fs from "node:fs";

const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
const cssPath = "apps/home/mirror/static/css/index-DogJsFVJ.css";
const catalogPath = "apps/home/mirror/static/js/dci-query-mock-catalog.js";
const docPath = "docsss/documents/DCI查询页-各业务类型mock样例.md";

let page = fs.readFileSync(pagePath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");
let catalog = fs.readFileSync(catalogPath, "utf8");

// ---- 1) helper __renderRelatedDci ----
if (!page.includes("function __renderRelatedDci(")) {
  const anchor = "function __renderResultHead(l){";
  if (!page.includes(anchor)) throw new Error("missing __renderResultHead");
  const helper = `function __renderRelatedDci(l){if(__isDciResult(l))return T("",!0);const code=String(l&&l.dciCode||"").trim();if(!code)return T("",!0);return t("div",{class:"result-related-dci"},k("DCI码："+code),1)}
`;
  page = page.replace(anchor, helper + anchor);
}

// ---- 2) inject into card body ----
const oldBody = `__renderResultHead(l),t("div",Oe,[t("div",Pe,[t("table",Re,`;
const newBody = `__renderResultHead(l),t("div",Oe,[__renderRelatedDci(l),t("div",Pe,[t("table",Re,`;
if (page.includes("__renderRelatedDci(l),t(\"div\",Pe")) {
  console.log("card body already has related dci");
} else if (!page.includes(oldBody)) {
  throw new Error("card body anchor missing");
} else {
  page = page.replace(oldBody, newBody);
  console.log("card body patched");
}

fs.writeFileSync(pagePath, page, "utf8");

// ---- 3) CSS ----
if (!css.includes(".result-related-dci")) {
  const inject =
    ".result-related-dci[data-v-bc73a8d2]{color:#1345a5;font-size:14px;font-weight:400;line-height:22px;margin:0 0 12px;font-family:Arial,Microsoft YaHei,sans-serif;word-break:break-all}";
  const anchor = ".result-notice-type[data-v-bc73a8d2]";
  if (!css.includes(anchor)) throw new Error("css notice-type missing");
  // append after notice-type rule block — find end of that rule
  const i = css.indexOf(anchor);
  const j = css.indexOf("}", i);
  css = css.slice(0, j + 1) + inject + css.slice(j + 1);
  fs.writeFileSync(cssPath, css, "utf8");
  console.log("css patched");
} else {
  console.log("css already present");
}

// ---- 4) catalog: invent DCI for notice rows; pin Z11 sample ----
if (!catalog.includes("function inventNoticeDci(")) {
  catalog = catalog.replace(
    "function noticeLabel(typeName) {",
    `function inventNoticeDci(seed) {
    var s = String(seed || "0").replace(/[^0-9A-Za-z\\u4e00-\\u9fff]/g, "");
    var n = "";
    for (var i = 0; i < s.length; i++) n += String(s.charCodeAt(i) % 10);
    while (n.length < 18) n += "0";
    return "DCI:RQZ010ANT.156." + n.slice(0, 18);
  }
  function noticeLabel(typeName) {`
  );
  catalog = catalog.replace(
    "dciCode: cfg.dciCode || \"\",",
    'dciCode: cfg.dciCode || (cfg.kind === "dci" ? "" : inventNoticeDci(cfg.titleNo || cfg.id)),'
  );
  console.log("catalog invent helper added");
}

// explicit Z11 DCI for demo
if (!catalog.includes('dciCode: "DCI:RQZ010ANT.156.2022071910143281"')) {
  catalog = catalog.replace(
    `id: "mock-z11-1",
      bizLine: "Z11",
      noticeType: "作品著作权登记",
      titleNo: "国作登字-2022-F-10143281",`,
    `id: "mock-z11-1",
      bizLine: "Z11",
      noticeType: "作品著作权登记",
      titleNo: "国作登字-2022-F-10143281",
      dciCode: "DCI:RQZ010ANT.156.2022071910143281",`
  );
  console.log("z11 dci pinned");
}

fs.writeFileSync(catalogPath, catalog, "utf8");

// ---- 5) doc note for Z11 ----
let doc = fs.readFileSync(docPath, "utf8");
if (!doc.includes("DCI:RQZ010ANT.156.2022071910143281")) {
  doc = doc.replace(
    "- 输出项：登记号、作品名称、登记日期、作品类别、著作权人",
    "- 输出项：登记号、作品名称、登记日期、作品类别、著作权人\n- 结果卡额外展示对应 DCI 码（表头横线下方）：`DCI:RQZ010ANT.156.2022071910143281`"
  );
  fs.writeFileSync(docPath, doc, "utf8");
  console.log("doc updated");
}

console.log("done");
