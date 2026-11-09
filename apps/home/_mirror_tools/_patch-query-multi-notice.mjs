/**
 * Patch home DCI query page:
 * - dynamic result fields by notice type
 * - registration-number head + notice type label
 * - validation copy for DCI/登记号
 */
import fs from "node:fs";

const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
const cssPath = "apps/home/mirror/static/css/index-DogJsFVJ.css";
const mockPath = "apps/home/mirror/static/js/dci-mock-api.js";
const htmlPath = "apps/home/mirror/index.html";

let page = fs.readFileSync(pagePath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");
let mock = fs.readFileSync(mockPath, "utf8");
let html = fs.readFileSync(htmlPath, "utf8");

// ---- 1) inject helper functions before `return pe(` in query component ----
const helperAnchor = "return pe(async()=>{if(m.token&&!m.id)";
if (!page.includes("function __resolveQueryFields(")) {
  if (!page.includes(helperAnchor)) {
    throw new Error("helper anchor not found");
  }
  const helpers = `function __resolveQueryFields(l){if(Array.isArray(l.fields)&&l.fields.length)return l.fields;return[{label:"作品名称",value:l.caseName||"-",full:!0},{label:"作品类型",value:B(l.caseCategoryCode)},{label:"DCI分配日期",value:V(l.dciApplyTime)},{label:"著作权人",value:l.registerName||l.ownerName||"-",link:!0},{label:"DCI注册中心",value:l.regOrgName||l.applyOrgName||"-"}]}
function __isDciResult(l){return l&&(l.kind==="dci"||(!l.noticeTypeLabel&&!!l.dciCode&&!l.titleNo))}
function __buildFieldRows(l){const fields=__resolveQueryFields(l),rows=[];let i=0;if(fields.length){const first=fields[0];rows.push(t("tr",null,[t("td",{class:"cell-label"},(first.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!first.link}]),colspan:"3"},k(first.value||"-"),2)]));i=1}while(i<fields.length){const a=fields[i],b=fields[i+1];if(a&&a.full){rows.push(t("tr",null,[t("td",{class:"cell-label"},(a.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!a.link}]),colspan:"3"},k(a.value||"-"),2)]));i+=1;continue}if(b){rows.push(t("tr",null,[t("td",{class:"cell-label"},(a.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!a.link}])},k(a.value||"-"),2),t("td",{class:"cell-label"},(b.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!b.link}])},k(b.value||"-"),2)]));i+=2}else{rows.push(t("tr",null,[t("td",{class:"cell-label"},(a.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!a.link}]),colspan:"3"},k(a.value||"-"),2)]));i+=1}}return rows}
function __renderResultHead(l){if(__isDciResult(l))return t("div",Ze,[t("img",{class:"result-logo",src:o(Le),alt:"DCI"},null,8,Fe),t("span",He,k(l.dciCode||l.titleNo||"-"),1),(Z(l.dciStatus).includes("撤销"))?(d(),g("span",{key:0,class:L(["result-status",Q(l.dciStatus)])},"撤销",3)):T("",!0)]);const titleLabel=l.titleLabel||"登记号",titleNo=l.titleNo||l.relatedRegNo||l.dciCode||"-";return t("div",Ze,[t("span",{class:"result-reg-title"},k(titleLabel+"："+titleNo),1),l.noticeTypeLabel?(d(),g("span",{key:0,class:"result-notice-type"},k(l.noticeTypeLabel),1)):T("",!0)])}
`;
  page = page.replace(helperAnchor, helpers + helperAnchor);
}

// ---- 2) replace result card body ----
const oldCard = `ye(o(r),l=>(d(),g("div",{key:l.dciCode||l.id,class:"result-card"},[t("div",Ze,[t("img",{class:"result-logo",src:o(Le),alt:"DCI"},null,8,Fe),t("span",He,k(l.dciCode),1),(Z(l.dciStatus).includes("撤销"))?(d(),g("span",{key:0,class:L(["result-status",Q(l.dciStatus)])},"撤销",3)):T("",!0)]),t("div",Oe,[t("div",Pe,[t("table",Re,[e[16]||(e[16]=t("colgroup",null,[t("col",{class:"col-label"}),t("col",{class:"col-value"}),t("col",{class:"col-label"}),t("col",{class:"col-value"})],-1)),t("tbody",null,[t("tr",null,[e[11]||(e[11]=t("td",{class:"cell-label"},"作品名称：",-1)),t("td",Ye,k(l.caseName||"-"),1)]),t("tr",null,[e[12]||(e[12]=t("td",{class:"cell-label"},"作品类型：",-1)),t("td",je,k(B(l.caseCategoryCode)),1),e[13]||(e[13]=t("td",{class:"cell-label"},"DCI分配日期：",-1)),t("td",ze,k(V(l.dciApplyTime)),1)]),t("tr",null,[e[14]||(e[14]=t("td",{class:"cell-label"},"著作权人：",-1)),t("td",Ge,k(l.registerName||l.ownerName||"-"),1),e[15]||(e[15]=t("td",{class:"cell-label"},"DCI注册中心：",-1)),t("td",We,k(l.regOrgName||l.applyOrgName||"-"),1)])])])])])]))),128)`;

const newCard = `ye(o(r),l=>(d(),g("div",{key:l.id||l.dciCode||l.titleNo,class:"result-card"},[__renderResultHead(l),t("div",Oe,[t("div",Pe,[t("table",Re,[e[16]||(e[16]=t("colgroup",null,[t("col",{class:"col-label"}),t("col",{class:"col-value"}),t("col",{class:"col-label"}),t("col",{class:"col-value"})],-1)),t("tbody",null,__buildFieldRows(l))])])])]))),128)`;

if (!page.includes("__renderResultHead(l)")) {
  if (!page.includes(oldCard)) {
    throw new Error("old result card block not found");
  }
  page = page.replace(oldCard, newCard);
}

// ---- 3) validation messages ----
page = page.replaceAll(
  "请输入 DCI 码和著作权人或作品名称",
  "请输入 DCI 码/登记证书编号 和著作权人或作品名称"
);
page = page.replaceAll('K.warning("请输入 DCI 码")', 'K.warning("请输入DCI码或登记证书编号")');

// ---- 4) example hint ----
page = page.replace(
  "例如：DCI:RQZ010ANT.156.202607012098976446　《数字版权保护技术规范》",
  "例如：DCI:RQZ010ANT.156.202607012098976446 / 国作登字-2022-F-10143281　《数字版权保护技术规范》"
);

fs.writeFileSync(pagePath, page, "utf8");
console.log("patched page", pagePath);

// ---- 5) CSS for notice label ----
if (!css.includes(".result-notice-type")) {
  const inject =
    ".result-reg-title[data-v-bc73a8d2]{color:#1345a5;font-size:15px;font-weight:700;font-family:Arial,Microsoft YaHei,sans-serif}" +
    ".result-notice-type[data-v-bc73a8d2]{display:inline-flex;align-items:center;height:24px;padding:0 10px;margin-left:12px;border:1px solid #d9d9d9;border-radius:2px;color:#595959;font-size:13px;font-weight:400;line-height:22px;background:#fff;flex-shrink:0}" +
    ".result-grid .cell-value.is-link[data-v-bc73a8d2]{color:#1345a5;font-weight:700}";
  const anchor = ".result-empty[data-v-bc73a8d2]";
  if (!css.includes(anchor)) throw new Error("css anchor missing");
  css = css.replace(anchor, inject + anchor);
  fs.writeFileSync(cssPath, css, "utf8");
  console.log("patched css");
} else {
  console.log("css already patched");
}

// ---- 6) index.html load catalog ----
if (!html.includes("dci-query-mock-catalog.js")) {
  html = html.replace(
    '<script src="/static/js/dci-mock-api.js"></script>',
    '<script src="/static/js/dci-query-mock-catalog.js"></script>\n  <script src="/static/js/dci-mock-api.js"></script>'
  );
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("patched index.html");
}

// ---- 7) mock API listByDciCodeAndKeyword ----
const mockOldStart = mock.indexOf('if (path === "/dci/applyDoc/listByDciCodeAndKeyword" && m === "GET")');
if (mockOldStart < 0) throw new Error("mock endpoint not found");
const mockOldEnd = mock.indexOf('if (path === "/businessInterface/listByIds"', mockOldStart);
if (mockOldEnd < 0) throw new Error("mock end not found");

const mockNew = `if (path === "/dci/applyDoc/listByDciCodeAndKeyword" && m === "GET") {
      // 第一框：DCI码或登记证书编号精准匹配；第二框：著作权人/作品(软件)名称
      function normQuery(s) {
        return String(s || "")
          .trim()
          .replace(/[\\s\\u3000]+/g, "")
          .toUpperCase();
      }
      function normKeyword(s) {
        return String(s || "")
          .trim()
          .replace(/[\\s\\u3000]+/g, "")
          .replace(/[《》]/g, "");
      }
      var codeOrReg = normQuery(q.dciCode);
      var kw = normKeyword(q.keyword);
      var catalog = (window.__DCI_QUERY_MOCK_CATALOG__ || []).slice();
      var hits = catalog.filter(function (row) {
        var codes = (row.matchCodes || []).map(normQuery);
        var keys = (row.matchKeywords || []).map(normKeyword);
        var hitCode = !!codeOrReg && codes.indexOf(codeOrReg) >= 0;
        var hitKw = !!kw && keys.indexOf(kw) >= 0;
        return hitCode && hitKw;
      });
      return ok(hits);
    }
    `;

mock = mock.slice(0, mockOldStart) + mockNew + mock.slice(mockOldEnd);
fs.writeFileSync(mockPath, mock, "utf8");
console.log("patched mock api");

console.log("done");
