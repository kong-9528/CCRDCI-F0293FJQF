/**
 * Fix: previous patch injected helpers but skipped card replace because
 * `function __renderResultHead(l)` already matched includes("__renderResultHead(l)").
 */
import fs from "node:fs";

const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
let page = fs.readFileSync(pagePath, "utf8");

const oldCard = `ye(o(r),l=>(d(),g("div",{key:l.dciCode||l.id,class:"result-card"},[t("div",Ze,[t("img",{class:"result-logo",src:o(Le),alt:"DCI"},null,8,Fe),t("span",He,k(l.dciCode),1),(Z(l.dciStatus).includes("撤销"))?(d(),g("span",{key:0,class:L(["result-status",Q(l.dciStatus)])},"撤销",3)):T("",!0)]),t("div",Oe,[t("div",Pe,[t("table",Re,[e[16]||(e[16]=t("colgroup",null,[t("col",{class:"col-label"}),t("col",{class:"col-value"}),t("col",{class:"col-label"}),t("col",{class:"col-value"})],-1)),t("tbody",null,[t("tr",null,[e[11]||(e[11]=t("td",{class:"cell-label"},"作品名称：",-1)),t("td",Ye,k(l.caseName||"-"),1)]),t("tr",null,[e[12]||(e[12]=t("td",{class:"cell-label"},"作品类型：",-1)),t("td",je,k(B(l.caseCategoryCode)),1),e[13]||(e[13]=t("td",{class:"cell-label"},"DCI分配日期：",-1)),t("td",ze,k(V(l.dciApplyTime)),1)]),t("tr",null,[e[14]||(e[14]=t("td",{class:"cell-label"},"著作权人：",-1)),t("td",Ge,k(l.registerName||l.ownerName||"-"),1),e[15]||(e[15]=t("td",{class:"cell-label"},"DCI注册中心：",-1)),t("td",We,k(l.regOrgName||l.applyOrgName||"-"),1)])])])])])]))),128)`;

const newCard = `ye(o(r),l=>(d(),g("div",{key:l.id||l.dciCode||l.titleNo,class:"result-card"},[__renderResultHead(l),t("div",Oe,[t("div",Pe,[t("table",Re,[e[16]||(e[16]=t("colgroup",null,[t("col",{class:"col-label"}),t("col",{class:"col-value"}),t("col",{class:"col-label"}),t("col",{class:"col-value"})],-1)),t("tbody",null,__buildFieldRows(l))])])])]))),128)`;

if (page.includes("t(\"tbody\",null,__buildFieldRows(l))")) {
  console.log("card already dynamic");
} else if (!page.includes(oldCard)) {
  // fuzzy locate
  const marker = 'key:l.dciCode||l.id,class:"result-card"';
  const i = page.indexOf(marker);
  console.log("exact oldCard missing, marker at", i);
  if (i < 0) throw new Error("cannot find result-card");
  console.log(page.slice(i - 40, i + 900));
  throw new Error("oldCard mismatch");
} else {
  page = page.replace(oldCard, newCard);
  fs.writeFileSync(pagePath, page, "utf8");
  console.log("card replaced ok");
}

// verify
page = fs.readFileSync(pagePath, "utf8");
console.log({
  dynamicRows: page.includes("__buildFieldRows(l)"),
  dynamicHeadCall: (page.match(/__renderResultHead\(l\)/g) || []).length,
  oldHardHead: page.includes('alt:"DCI"},null,8,Fe),t("span",He,k(l.dciCode)'),
  placeholder: page.includes("请输入DCI码或登记证书编号"),
});
