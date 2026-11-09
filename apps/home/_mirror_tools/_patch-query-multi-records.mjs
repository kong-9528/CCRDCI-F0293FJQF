/**
 * 登记号查询：多结果列表 / 仅首条 DCI / 无登记号只展示业务类型 label
 */
import fs from "node:fs";

const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
const cssPath = "apps/home/mirror/static/css/index-DogJsFVJ.css";
const catalogPath = "apps/home/mirror/static/js/dci-query-mock-catalog.js";
const mockPath = "apps/home/mirror/static/js/dci-mock-api.js";
const docPath = "docsss/documents/DCI查询页-各业务类型mock样例.md";

let page = fs.readFileSync(pagePath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");
let catalog = fs.readFileSync(catalogPath, "utf8");
let mock = fs.readFileSync(mockPath, "utf8");

// ========== 1) Replace helpers for head / related DCI / field empty ==========
const oldHelpersStart = "function __resolveQueryFields(l){";
const oldHelpersEnd = "return pe(async()=>{if(m.token&&!m.id)";
const hs = page.indexOf(oldHelpersStart);
const he = page.indexOf(oldHelpersEnd);
if (hs < 0 || he < 0) throw new Error("helpers range not found");

const newHelpers = `function __resolveQueryFields(l){if(Array.isArray(l.fields)&&l.fields.length)return l.fields;return[{label:"作品名称",value:l.caseName||"-",full:!0},{label:"作品类型",value:B(l.caseCategoryCode)},{label:"DCI分配日期",value:V(l.dciApplyTime)},{label:"著作权人",value:l.registerName||l.ownerName||"-",link:!0},{label:"DCI注册中心",value:l.regOrgName||l.applyOrgName||"-"}]}
function __isDciResult(l){return l&&(l.kind==="dci"||(!l.noticeTypeLabel&&!!l.dciCode&&!l.titleNo))}
function __fieldText(v){return v==null?"-":String(v)}
function __buildFieldRows(l){const fields=__resolveQueryFields(l),rows=[];let i=0;if(fields.length){const first=fields[0];rows.push(t("tr",null,[t("td",{class:"cell-label"},(first.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!first.link}]),colspan:"3"},k(__fieldText(first.value)),2)]));i=1}while(i<fields.length){const a=fields[i],b=fields[i+1];if(a&&a.full){rows.push(t("tr",null,[t("td",{class:"cell-label"},(a.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!a.link}]),colspan:"3"},k(__fieldText(a.value)),2)]));i+=1;continue}if(b){rows.push(t("tr",null,[t("td",{class:"cell-label"},(a.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!a.link}])},k(__fieldText(a.value)),2),t("td",{class:"cell-label"},(b.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!b.link}])},k(__fieldText(b.value)),2)]));i+=2}else{rows.push(t("tr",null,[t("td",{class:"cell-label"},(a.label||"")+"："),t("td",{class:L(["cell-value",{"is-link":!!a.link}]),colspan:"3"},k(__fieldText(a.value)),2)]));i+=1}}return rows}
function __renderRelatedDci(l,idx){if(__isDciResult(l))return T("",!0);if(idx!==0)return T("",!0);const code=String(l&&l.dciCode||"").trim();if(!code)return T("",!0);return t("div",{class:"result-related-dci"},k("DCI码："+code),1)}
function __renderResultHead(l){if(__isDciResult(l))return t("div",Ze,[t("img",{class:"result-logo",src:o(Le),alt:"DCI"},null,8,Fe),t("span",He,k(l.dciCode||l.titleNo||"-"),1),(Z(l.dciStatus).includes("撤销"))?(d(),g("span",{key:0,class:L(["result-status",Q(l.dciStatus)])},"撤销",3)):T("",!0)]);const showNo=l.showTitleNo!==!1&&!!String(l.titleNo||"").trim();const kids=[];if(showNo)kids.push(t("span",{class:"result-reg-title"},k((l.titleLabel||"登记号")+"："+String(l.titleNo).trim()),1));if(l.noticeTypeLabel)kids.push(t("span",{class:"result-notice-type"},k(l.noticeTypeLabel),1));if(l.statusLabel)kids.push(t("span",{class:L(["result-status","is-cancelled"])},k(l.statusLabel),1));return t("div",Ze,kids)}
`;

page = page.slice(0, hs) + newHelpers + page.slice(he);

// ========== 2) Card: pass index to related DCI ==========
const oldCard = `ye(o(r),l=>(d(),g("div",{key:l.id||l.dciCode||l.titleNo,class:"result-card"},[__renderResultHead(l),t("div",Oe,[__renderRelatedDci(l),t("div",Pe,[t("table",Re,`;
const newCard = `ye(o(r),(l,idx)=>(d(),g("div",{key:l.id||l.dciCode||l.titleNo||idx,class:"result-card"},[__renderResultHead(l),t("div",Oe,[__renderRelatedDci(l,idx),t("div",Pe,[t("table",Re,`;
if (!page.includes(oldCard) && !page.includes("__renderRelatedDci(l,idx)")) {
  throw new Error("card anchor missing");
}
if (page.includes(oldCard)) {
  page = page.replace(oldCard, newCard);
  console.log("card indexed");
} else {
  console.log("card already indexed");
}

// result count under 查询结果 title
if (!page.includes("result-count-tip")) {
  const tipOld = `e[17]||(e[17]=t("span",{class:"result-title"},"查询结果",-1)),o(r).length?(d(),g("div",Be,`;
  const tipNew = `e[17]||(e[17]=t("span",{class:"result-title"},"查询结果",-1)),o(r).length?(d(),g(me,null,[t("div",{class:"result-count-tip"},"为您找到 "+k(o(r).length)+" 条符合条件的结果",1),t("div",Be,`;
  if (!page.includes(tipOld)) throw new Error("result title anchor missing");
  page = page.replace(
    tipOld,
    tipNew
  );
  // close the extra wrapper: after result list div Be closes, before empty branch
  // Original: ...128))])):(d(),g("div",Je,...
  // After adding t("div",Be,... we need ])] before empty — find the list close
  const closeOld = `]))),128))])):(d(),g("div",Je,"未找到匹配的记录，请调整查询条件后重试"))`;
  const closeNew = `]))),128))]))])):(d(),g("div",Je,"未找到匹配的记录，请调整查询条件后重试"))`;
  if (!page.includes(closeOld)) throw new Error("list close anchor missing");
  page = page.replace(closeOld, closeNew);
  console.log("result count tip added");
}

fs.writeFileSync(pagePath, page, "utf8");

// ========== 3) CSS ==========
if (!css.includes(".result-status.is-cancelled")) {
  css = css.replace(
    ".result-related-dci[data-v-bc73a8d2]",
    ".result-count-tip[data-v-bc73a8d2]{margin:0 0 12px;color:#606266;font-size:14px;line-height:22px}.result-status.is-cancelled[data-v-bc73a8d2]{color:#fff;background:#f56c6c;border:none;margin-left:8px;font-weight:400}.result-related-dci[data-v-bc73a8d2]"
  );
  fs.writeFileSync(cssPath, css, "utf8");
  console.log("css patched");
}

// ========== 4) Catalog item() enrich + multi records ==========
if (!catalog.includes("showTitleNo:")) {
  catalog = catalog.replace(
    `return {
      id: cfg.id,
      kind: cfg.kind || "notice",
      bizLine: cfg.bizLine,
      noticeType: cfg.noticeType,
      noticeTypeLabel: noticeLabel(cfg.noticeType),
      titleLabel: cfg.titleLabel || "登记号",
      titleNo: cfg.titleNo,
      dciCode: cfg.dciCode || (cfg.kind === "dci" ? "" : inventNoticeDci(cfg.titleNo || cfg.id)),
      dciStatus: cfg.dciStatus || "",
      relatedRegNo: cfg.relatedRegNo || (cfg.kind === "dci" ? "" : cfg.titleNo),
      caseName: cfg.caseName || "",
      caseCategoryCode: cfg.caseCategoryCode || "",
      dciApplyTime: cfg.dciApplyTime || "",
      registerName: cfg.registerName || "",
      ownerName: cfg.ownerName || "",
      regOrgName: cfg.regOrgName || "",
      applyOrgName: cfg.applyOrgName || "",
      fields: fields,
      matchCodes: cfg.matchCodes || [cfg.titleNo, cfg.dciCode].filter(Boolean),
      matchKeywords: keywords,
    };`,
    `var relatedRegNo = cfg.relatedRegNo || (cfg.kind === "dci" ? "" : cfg.titleNo || "");
    var titleNo = cfg.titleNo == null ? "" : cfg.titleNo;
    var showTitleNo = Object.prototype.hasOwnProperty.call(cfg, "showTitleNo")
      ? !!cfg.showTitleNo
      : !!String(titleNo).trim();
    var dciCode =
      cfg.dciCode ||
      (cfg.kind === "dci"
        ? ""
        : inventNoticeDci(titleNo || relatedRegNo || cfg.id));
    return {
      id: cfg.id,
      kind: cfg.kind || "notice",
      bizLine: cfg.bizLine,
      noticeType: cfg.noticeType,
      noticeTypeLabel: cfg.noticeTypeLabel || noticeLabel(cfg.noticeType),
      titleLabel: cfg.titleLabel || "登记号",
      titleNo: titleNo,
      showTitleNo: showTitleNo,
      statusLabel: cfg.statusLabel || "",
      eventDate: cfg.eventDate || "",
      dciCode: dciCode,
      dciStatus: cfg.dciStatus || "",
      relatedRegNo: relatedRegNo,
      caseName: cfg.caseName || "",
      caseCategoryCode: cfg.caseCategoryCode || "",
      dciApplyTime: cfg.dciApplyTime || "",
      registerName: cfg.registerName || "",
      ownerName: cfg.ownerName || "",
      regOrgName: cfg.regOrgName || "",
      applyOrgName: cfg.applyOrgName || "",
      fields: fields,
      matchCodes: cfg.matchCodes || [titleNo, relatedRegNo, dciCode].filter(Boolean),
      matchKeywords: keywords,
    };`
  );
  console.log("item() enriched");
}

// Pin eventDate on Z11 and add revoke sibling; add screenshot multi group
if (!catalog.includes("mock-multi-reg-1")) {
  // update Z11 with eventDate + status optional
  catalog = catalog.replace(
    `id: "mock-z11-1",
      bizLine: "Z11",
      noticeType: "作品著作权登记",
      titleNo: "国作登字-2022-F-10143281",
      dciCode: "DCI:RQZ010ANT.156.2022071910143281",
      caseName: "海森药业标志设计",
      registerName: "浙江海森药业股份有限公司",
      keywords: ["海森药业标志设计", "浙江海森药业股份有限公司"],
      fields: [
        { label: "作品名称", value: "海森药业标志设计", full: true },
        { label: "作品类别", value: "美术" },
        { label: "著作权人", value: "浙江海森药业股份有限公司", link: true },
        { label: "登记日期", value: "2022年07月19日" },
      ],
    }),`,
    `id: "mock-z11-1",
      bizLine: "Z11",
      noticeType: "作品著作权登记",
      titleNo: "国作登字-2022-F-10143281",
      dciCode: "DCI:RQZ010ANT.156.2022071910143281",
      eventDate: "2022-07-19",
      caseName: "海森药业标志设计",
      registerName: "浙江海森药业股份有限公司",
      keywords: ["海森药业标志设计", "浙江海森药业股份有限公司"],
      fields: [
        { label: "作品名称", value: "海森药业标志设计", full: true, link: true },
        { label: "作品类别", value: "美术" },
        { label: "著作权人", value: "浙江海森药业股份有限公司", link: true },
        { label: "登记日期", value: "2022年07月19日" },
      ],
    }),
    item({
      id: "mock-z11-revoke-1",
      bizLine: "Z62",
      noticeType: "撤销作品著作权和合同登记",
      titleNo: "",
      showTitleNo: false,
      relatedRegNo: "国作登字-2022-F-10143281",
      matchCodes: ["国作登字-2022-F-10143281"],
      dciCode: "",
      eventDate: "2023-02-01",
      caseName: "海森药业标志设计",
      registerName: "浙江海森药业股份有限公司",
      keywords: ["海森药业标志设计", "浙江海森药业股份有限公司"],
      fields: [
        { label: "作品名称", value: "海森药业标志设计", full: true, link: true },
        { label: "撤销登记申请人", value: "浙江海森药业股份有限公司", link: true },
        { label: "原登记类型", value: "作品著作权登记" },
        { label: "撤销日期", value: "2023年02月01日" },
      ],
    }),`
  );

  // insert screenshot multi-group before DCI section
  const dciMark = "    // —— DCI ——";
  if (!catalog.includes(dciMark)) throw new Error("DCI section mark missing");
  const multiBlock = `    // —— 同登记号多业务记录（登记 + 撤销） ——
    item({
      id: "mock-multi-reg-1",
      bizLine: "Z11",
      noticeType: "作品著作权登记",
      titleNo: "国作登字-2026-G-00000004",
      dciCode: "DCI:RQZ010ANT.156.2026010800000004",
      statusLabel: "已撤销",
      eventDate: "2026-01-08",
      caseName: "汇编之美",
      registerName: "鲍朵朵",
      keywords: ["汇编之美", "鲍朵朵"],
      fields: [
        { label: "作品名称", value: "汇编之美", full: true, link: true },
        { label: "作品类别", value: "摄影" },
        { label: "著作权人", value: "鲍朵朵", link: true },
        { label: "登记日期", value: "2026年01月08日" },
      ],
    }),
    item({
      id: "mock-multi-revoke-1",
      bizLine: "Z62",
      noticeType: "撤销作品著作权和合同登记",
      titleNo: "",
      showTitleNo: false,
      relatedRegNo: "国作登字-2026-G-00000004",
      matchCodes: ["国作登字-2026-G-00000004"],
      dciCode: "",
      eventDate: "2026-02-05",
      caseName: "汇编之美",
      registerName: "鲍朵朵",
      keywords: ["汇编之美", "鲍朵朵"],
      fields: [
        { label: "作品名称", value: "汇编之美", full: true, link: true },
        { label: "撤销登记申请人", value: "鲍朵朵", link: true },
        { label: "原登记类型", value: "" },
        { label: "撤销日期", value: "2026年02月05日" },
      ],
    }),

`;
  catalog = catalog.replace(dciMark, multiBlock + dciMark);
  console.log("multi records added");
}

fs.writeFileSync(catalogPath, catalog, "utf8");

// ========== 5) Mock API sort by eventDate asc ==========
const sortNeedle = `var hits = catalog.filter(function (row) {
        var codes = (row.matchCodes || []).map(normQuery);
        var keys = (row.matchKeywords || []).map(normKeyword);
        var hitCode = !!codeOrReg && codes.indexOf(codeOrReg) >= 0;
        var hitKw = !!kw && keys.indexOf(kw) >= 0;
        return hitCode && hitKw;
      });
      return ok(hits);`;

const sortRepl = `var hits = catalog.filter(function (row) {
        var codes = (row.matchCodes || []).map(normQuery);
        var keys = (row.matchKeywords || []).map(normKeyword);
        var hitCode = !!codeOrReg && codes.indexOf(codeOrReg) >= 0;
        var hitKw = !!kw && keys.indexOf(kw) >= 0;
        return hitCode && hitKw;
      });
      hits.sort(function (a, b) {
        var da = String((a && a.eventDate) || "");
        var db = String((b && b.eventDate) || "");
        if (da && db && da !== db) return da < db ? -1 : 1;
        if (da && !db) return -1;
        if (!da && db) return 1;
        return String((a && a.id) || "").localeCompare(String((b && b.id) || ""));
      });
      return ok(hits);`;

if (!mock.includes("hits.sort(function (a, b)")) {
  if (!mock.includes(sortNeedle)) throw new Error("mock filter block missing");
  mock = mock.replace(sortNeedle, sortRepl);
  fs.writeFileSync(mockPath, mock, "utf8");
  console.log("mock sort added");
} else {
  console.log("mock sort already present");
}

// ========== 6) Doc ==========
let doc = fs.readFileSync(docPath, "utf8");
if (!doc.includes("国作登字-2026-G-00000004")) {
  const insert = `

---

## 同登记号多条记录（重点验证）

一个登记号可命中多条业务记录（时间正序）。仅**第一条**展示 DCI 码；后续记录若无独立登记号，表头只显示业务类型 label。

### 示例 A：\`国作登字-2026-G-00000004\` + \`鲍朵朵\`（或 \`汇编之美\`）

1. 作品著作权登记公告（有登记号，状态「已撤销」）+ DCI 码  
2. 撤销作品著作权和合同登记公告（无登记号，仅 label）

### 示例 B：\`国作登字-2022-F-10143281\` + \`海森药业标志设计\`

1. 作品著作权登记公告 + DCI 码  
2. 撤销作品著作权和合同登记公告（无登记号）

`;
  doc = doc.replace("## 快速对照表", insert + "## 快速对照表");
  doc = doc.replace(
    "| 1 | Z11 | `国作登字-2022-F-10143281` | `浙江海森药业股份有限公司` |",
    "| 1 | Z11（现为2条） | `国作登字-2022-F-10143281` | `海森药业标志设计` |\n| multi | Z11+Z62 | `国作登字-2026-G-00000004` | `鲍朵朵` |"
  );
  fs.writeFileSync(docPath, doc, "utf8");
  console.log("doc updated");
}

console.log("done");
