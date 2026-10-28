/**
 * 1) List DCI codes: mid segment (between ":" and ".156.") length 9–12, plain alnum
 * 2) Detail mock uses the same dciCode / name / org fields as the list row (by id)
 */
import fs from "node:fs";

const jsonPath = "apps/ops-dci/mirror/static/js/ops-mock-store.json";
const jsPath = "apps/ops-dci/mirror/static/js/ops-mock-store.js";
const apiPath = "apps/ops-dci/mirror/static/js/ops-mock-api.js";
const KEY = "POST /api/v1/dciManage/dci/applyDoc/cursorList";

/** mid: 9–12 chars after type letter is included in length */
function dci(type, mid, dateTail) {
  if (mid.length < 9 || mid.length > 12) {
    throw new Error(`mid length ${mid.length}: ${mid}`);
  }
  if (!/^[RCX][A-Z0-9]{8,11}$/.test(mid)) {
    throw new Error(`bad mid ${mid}`);
  }
  if (mid[0] !== type) throw new Error(`type mismatch ${type} vs ${mid}`);
  return `DCI:${mid}.156.${dateTail}`;
}

function row(p) {
  return {
    id: String(p.id),
    docId: String(p.id),
    dciCode: p.dciCode,
    caseName: p.caseName,
    caseCategoryCode: p.caseCategoryCode,
    caseType: p.caseType,
    ownerName: p.ownerName,
    registerName: p.registerName,
    applyOrgName: p.applyOrgName,
    relatedRegNo: p.relatedRegNo,
    dciStatus: p.dciStatus,
    dciCodeType: p.dciCodeType,
    dciApplyTime: p.dciApplyTime,
  };
}

const rows = [
  // opus R/C/X — mid 9–12
  row({
    id: "1788328941895",
    dciCode: dci("R", "RQZ010ANT", "20260820A7K3M9P2"),
    caseName: "智能版权监测系统",
    caseCategoryCode: 100,
    caseType: "opus",
    ownerName: "吴十 郑一",
    registerName: "雅昌文化集团",
    applyOrgName: "上海映文数字科技有限公司",
    relatedRegNo: "2026-S-000010",
    dciStatus: 0,
    dciCodeType: "R",
    dciApplyTime: "2026-09-01 14:02:21",
  }),
  row({
    id: "1788328710207",
    dciCode: dci("R", "RQZ18G1H3J", "20260818G1H3J5K7"),
    caseName: "数字版权保护技术规范",
    caseCategoryCode: 100,
    caseType: "opus",
    ownerName: "王五",
    registerName: "蚂蚁科技集团股份有限公司",
    applyOrgName: "杭州云启版权服务有限公司",
    relatedRegNo: "2026-S-000018",
    dciStatus: 1,
    dciCodeType: "R",
    dciApplyTime: "2026-09-01 13:58:30",
  }),
  row({
    id: "1788401000001",
    dciCode: dci("R", "R9B3C5D7E1F", "20260901B3C5D7E9"),
    caseName: "江南烟雨曲",
    caseCategoryCode: 110,
    caseType: "opus",
    ownerName: "李明",
    registerName: "中国版权保护中心",
    applyOrgName: "北京音著协数字平台",
    relatedRegNo: "2026-M-000101",
    dciStatus: 0,
    dciCodeType: "R",
    dciApplyTime: "2026-09-05 09:12:08",
  }),
  row({
    id: "1788401000002",
    dciCode: dci("C", "CQZ010ANT2", "20260910H2J4K6L8"),
    caseName: "授权改编·智能版权监测系统",
    caseCategoryCode: 100,
    caseType: "opus",
    ownerName: "吴十 郑一",
    registerName: "雅昌文化集团",
    applyOrgName: "上海映文数字科技有限公司",
    relatedRegNo: "2026-S-000210",
    dciStatus: 0,
    dciCodeType: "C",
    dciApplyTime: "2026-09-12 11:20:45",
  }),
  row({
    id: "1788401000003",
    dciCode: dci("C", "C15N1P3Q5R7", "20260915N1P3Q5R7"),
    caseName: "水墨山水图（授权发行）",
    caseCategoryCode: 150,
    caseType: "opus",
    ownerName: "陈墨轩",
    registerName: "雅昌文化集团",
    applyOrgName: "广州艺数版权服务有限公司",
    relatedRegNo: "2026-A-000088",
    dciStatus: 0,
    dciCodeType: "C",
    dciApplyTime: "2026-09-16 16:40:12",
  }),
  row({
    id: "1788401000004",
    dciCode: dci("X", "X20T2U4V6W8", "20260920T2U4V6W8"),
    caseName: "短视频合集·城市印象",
    caseCategoryCode: 180,
    caseType: "opus",
    ownerName: "城市影像工作室",
    registerName: "腾讯云计算（北京）有限责任公司",
    applyOrgName: "深圳市星河内容科技有限公司",
    relatedRegNo: "2026-V-000056",
    dciStatus: 0,
    dciCodeType: "X",
    dciApplyTime: "2026-09-21 08:05:33",
  }),
  row({
    id: "1788401000005",
    dciCode: dci("X", "XQZ22Y1Z3A", "20260922Y1Z3A5B7"),
    caseName: "园区导览示意图包",
    caseCategoryCode: 200,
    caseType: "opus",
    ownerName: "园区运营中心",
    registerName: "中国版权保护中心",
    applyOrgName: "杭州云启版权服务有限公司",
    relatedRegNo: "2026-X-000033",
    dciStatus: 1,
    dciCodeType: "X",
    dciApplyTime: "2026-09-22 19:18:01",
  }),
  row({
    id: "1788401000006",
    dciCode: dci("R", "R25D2E4F6G8H", "20260925D2E4F6G8"),
    caseName: "春日花海摄影集",
    caseCategoryCode: 160,
    caseType: "opus",
    ownerName: "赵清影",
    registerName: "雅昌文化集团",
    applyOrgName: "上海映文数字科技有限公司",
    relatedRegNo: "2026-P-000077",
    dciStatus: 0,
    dciCodeType: "R",
    dciApplyTime: "2026-09-26 10:01:55",
  }),

  // soft R/C
  row({
    id: "1788328608723",
    dciCode: dci("R", "RQZ15B2C4D", "20260815B2C4D6E8"),
    caseName: "版权链存证客户端",
    caseCategoryCode: 280,
    caseType: "soft",
    ownerName: "蚂蚁数科",
    registerName: "腾讯云计算（北京）有限责任公司",
    applyOrgName: "深圳市星河内容科技有限公司",
    relatedRegNo: "2026-R-SOFT-001",
    dciStatus: 0,
    dciCodeType: "R",
    dciApplyTime: "2026-09-01 13:56:48",
  }),
  row({
    id: "1788402000001",
    dciCode: dci("R", "R03J1K3L5M7", "20260903J1K3L5M7"),
    caseName: "DCI码核验助手",
    caseCategoryCode: 280,
    caseType: "soft",
    ownerName: "杭州云启版权服务有限公司",
    registerName: "中国版权保护中心",
    applyOrgName: "杭州云启版权服务有限公司",
    relatedRegNo: "2026-R-SOFT-014",
    dciStatus: 0,
    dciCodeType: "R",
    dciApplyTime: "2026-09-04 15:22:10",
  }),
  row({
    id: "1788402000002",
    dciCode: dci("R", "RQZ08P0Q2R4", "20260908P0Q2R4S6"),
    caseName: "作品样本批量上传工具",
    caseCategoryCode: 280,
    caseType: "soft",
    ownerName: "上海映文数字科技有限公司",
    registerName: "雅昌文化集团",
    applyOrgName: "上海映文数字科技有限公司",
    relatedRegNo: "2026-R-SOFT-028",
    dciStatus: 1,
    dciCodeType: "R",
    dciApplyTime: "2026-09-09 09:47:26",
  }),
  row({
    id: "1788402000003",
    dciCode: dci("C", "CQZ14U1V3W5", "20260914U1V3W5X7"),
    caseName: "版权链存证客户端（授权版）",
    caseCategoryCode: 280,
    caseType: "soft",
    ownerName: "蚂蚁数科",
    registerName: "腾讯云计算（北京）有限责任公司",
    applyOrgName: "深圳市星河内容科技有限公司",
    relatedRegNo: "2026-C-SOFT-003",
    dciStatus: 0,
    dciCodeType: "C",
    dciApplyTime: "2026-09-15 13:11:40",
  }),
  row({
    id: "1788402000004",
    dciCode: dci("C", "C18Z0A2B4C6", "20260918Z0A2B4C6"),
    caseName: "企业版权资产管理台",
    caseCategoryCode: 280,
    caseType: "soft",
    ownerName: "华数传媒网络有限公司",
    registerName: "中国版权保护中心",
    applyOrgName: "杭州云启版权服务有限公司",
    relatedRegNo: "2026-C-SOFT-019",
    dciStatus: 0,
    dciCodeType: "C",
    dciApplyTime: "2026-09-19 17:33:09",
  }),

  // dataset X only
  row({
    id: "1788403000001",
    dciCode: dci("X", "XQZ02E1F3G5", "20260902E1F3G5H7"),
    caseName: "开源图像标注数据集 V1",
    caseCategoryCode: 290,
    caseType: "dataset",
    ownerName: "智图数据实验室",
    registerName: "中国版权保护中心",
    applyOrgName: "杭州云启版权服务有限公司",
    relatedRegNo: "2026-X-DS-001",
    dciStatus: 0,
    dciCodeType: "X",
    dciApplyTime: "2026-09-03 10:25:17",
  }),
  row({
    id: "1788403000002",
    dciCode: dci("X", "X07K2L4M6N8", "20260907K2L4M6N8"),
    caseName: "中文多轮对话语料库",
    caseCategoryCode: 290,
    caseType: "dataset",
    ownerName: "语言智能研究院",
    registerName: "蚂蚁科技集团股份有限公司",
    applyOrgName: "上海映文数字科技有限公司",
    relatedRegNo: "2026-X-DS-012",
    dciStatus: 0,
    dciCodeType: "X",
    dciApplyTime: "2026-09-08 14:08:52",
  }),
  row({
    id: "1788403000003",
    dciCode: dci("X", "XQZ11Q1R3S5", "20260911Q1R3S5T7"),
    caseName: "城市交通轨迹脱敏集",
    caseCategoryCode: 290,
    caseType: "dataset",
    ownerName: "市政大数据中心",
    registerName: "腾讯云计算（北京）有限责任公司",
    applyOrgName: "深圳市星河内容科技有限公司",
    relatedRegNo: "2026-X-DS-025",
    dciStatus: 1,
    dciCodeType: "X",
    dciApplyTime: "2026-09-12 08:41:03",
  }),
  row({
    id: "1788403000004",
    dciCode: dci("X", "X17V0W2X4Y6", "20260917V0W2X4Y6"),
    caseName: "工业质检缺陷样本库",
    caseCategoryCode: 290,
    caseType: "dataset",
    ownerName: "智造视觉科技有限公司",
    registerName: "雅昌文化集团",
    applyOrgName: "广州艺数版权服务有限公司",
    relatedRegNo: "2026-X-DS-031",
    dciStatus: 0,
    dciCodeType: "X",
    dciApplyTime: "2026-09-18 11:56:28",
  }),
  row({
    id: "1788403000005",
    dciCode: dci("X", "XQZ24A1B3C5D", "20260924A1B3C5D7"),
    caseName: "多模态商品图文配对集",
    caseCategoryCode: 290,
    caseType: "dataset",
    ownerName: "电商内容研究所",
    registerName: "中国版权保护中心",
    applyOrgName: "杭州云启版权服务有限公司",
    relatedRegNo: "2026-X-DS-044",
    dciStatus: 0,
    dciCodeType: "X",
    dciApplyTime: "2026-09-25 16:02:44",
  }),
];

// validate mids
for (const r of rows) {
  const m = r.dciCode.match(/^DCI:([A-Z0-9]+)\.156\./);
  if (!m || m[1].length < 9 || m[1].length > 12) {
    throw new Error(`bad code ${r.dciCode}`);
  }
}

const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const prev = store[KEY];
store[KEY] = {
  ...prev,
  data: {
    ...prev.data,
    rows,
    total: rows.length,
    totalApproximate: false,
    hasMore: false,
    pageSize: Math.max(prev.data.pageSize || 10, rows.length),
    caseType: null,
    nextSearchAfter: null,
  },
};
fs.writeFileSync(jsonPath, JSON.stringify(store));
fs.writeFileSync(jsPath, "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n");
console.log(
  "store rows",
  rows.length,
  rows.map((r) => {
    const mid = r.dciCode.match(/^DCI:(.+?)\.156\./)[1];
    return `${r.caseType}:${r.dciCodeType}:${mid}(${mid.length})`;
  }),
);

// --- patch mockApplyDocDetail to align with list ---
let api = fs.readFileSync(apiPath, "utf8");

const findListRowFn = `
  function findAllocListRow(id) {
    var store = window.__OPS_MOCK_STORE__ || {};
    var listBody = store["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
    var all =
      (listBody && listBody.data && listBody.data.rows) ||
      (listBody && listBody.rows) ||
      [];
    var sid = String(id);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === sid || String(all[i].docId) === sid) return all[i];
    }
    return null;
  }

  function findOriginRCode(listRow) {
    if (!listRow || listRow.dciCodeType !== "C") return "";
    var store = window.__OPS_MOCK_STORE__ || {};
    var listBody = store["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
    var all =
      (listBody && listBody.data && listBody.data.rows) ||
      (listBody && listBody.rows) ||
      [];
    for (var i = 0; i < all.length; i++) {
      var r = all[i];
      if (
        r.caseType === listRow.caseType &&
        r.dciCodeType === "R" &&
        r.ownerName === listRow.ownerName
      ) {
        return r.dciCode;
      }
    }
    for (var j = 0; j < all.length; j++) {
      if (all[j].caseType === listRow.caseType && all[j].dciCodeType === "R") {
        return all[j].dciCode;
      }
    }
    return "";
  }

`;

if (!api.includes("function findAllocListRow")) {
  api = api.replace(
    "  function mockApplyDocDetail(path) {",
    findListRowFn + "  function mockApplyDocDetail(path) {",
  );
}

// Replace generated dciCode / base fields block
const oldBlock = `    var prefix = code === "C" ? "C" : code === "X" ? "X" : "R";
    var entLetter = entity === "soft" ? "S" : entity === "dataset" ? "D" : "O";
    var dciCode =
      "DCI:" +
      prefix +
      String(n).padStart(3, "0") +
      entLetter +
      n +
      ".156.202610010000DEMO" +
      String(n).padStart(2, "0");

    var base = {
      dciCode: dciCode,
      originDciCode: code === "C" ? "DCI:R" + String(n).padStart(3, "0") + "ABC.156.20250101000000174" : "",
      dciApplyTime: "2026-09-22 10:50:03",
      dciCodeType: code,
      dciCodeTypeName: typeName,
      registerName: "中国版权保护中心",
      applyOrgName: "DCI申领平台" + ((n % 3) + 1),
      dciRegisterSyncTime: "2026-09-27 09:00:00",
    };`;

const newBlock = `    var prefix = code === "C" ? "C" : code === "X" ? "X" : "R";
    var listRow = findAllocListRow(id);
    var mid =
      prefix +
      String(Math.abs(n % 100000000)).padStart(8, "0").slice(0, 8 + (n % 3));
    if (mid.length < 9) mid = (mid + "0ANT").slice(0, 9);
    if (mid.length > 12) mid = mid.slice(0, 12);
    var dciCode = listRow && listRow.dciCode
      ? listRow.dciCode
      : "DCI:" + mid + ".156.20261001" + String(n).padStart(6, "0");
    var originDciCode = code === "C" ? findOriginRCode(listRow) || "" : "";
    if (code === "C" && !originDciCode) {
      originDciCode = "DCI:R" + String(n).padStart(8, "0").slice(0, 8) + "A.156.20250101000017";
    }

    var base = {
      dciCode: dciCode,
      originDciCode: originDciCode,
      dciApplyTime: (listRow && listRow.dciApplyTime) || "2026-09-22 10:50:03",
      dciCodeType: code,
      dciCodeTypeName: typeName,
      registerName: (listRow && listRow.registerName) || "中国版权保护中心",
      applyOrgName: (listRow && listRow.applyOrgName) || "DCI申领平台" + ((n % 3) + 1),
      dciRegisterSyncTime: "2026-09-27 09:00:00",
    };
    var listName = (listRow && listRow.caseName) || "";
    var listOwner = (listRow && listRow.ownerName) || "";
    var catLabel =
      (typeof CATEGORY_LABEL !== "undefined" &&
        listRow &&
        CATEGORY_LABEL[listRow.caseCategoryCode]) ||
      "";`;

if (!api.includes("findAllocListRow(id)")) {
  if (!api.includes(oldBlock)) {
    console.error("OLD BLOCK NOT FOUND — detail base may already be patched");
  } else {
    api = api.replace(oldBlock, newBlock);
  }
}

// Align entity names with list
api = api.replace(
  `opusName: "作品名称" + n,
        opusCategoryName: code === "C" ? "曲艺作品" : code === "X" ? "音乐作品" : "戏剧作品",`,
  `opusName: listName || ("作品名称" + n),
        opusCategoryName: catLabel || (code === "C" ? "曲艺作品" : code === "X" ? "音乐作品" : "戏剧作品"),`,
);

api = api.replace(
  `attachmentName: "作品样本 - 作品名称" + n + ".pdf",
          sampleSummary:
            "作品样本摘要：由著作权人" + n + "创作完成，内容涉及 DCI 数字版权相关主题。",`,
  `attachmentName: "作品样本 - " + (listName || ("作品名称" + n)) + ".pdf",
          sampleSummary:
            "作品样本摘要：由" + (listOwner || ("著作权人" + n)) + "创作完成，内容涉及 DCI 数字版权相关主题。",`,
);

api = api.replace(
  `attachmentName: "作品样本附图 - 作品名称" + n + ".zip",`,
  `attachmentName: "作品样本附图 - " + (listName || ("作品名称" + n)) + ".zip",`,
);

api = api.replace(
  `softFullName: "软件全称" + n,
        softShortName: "简称" + n,`,
  `softFullName: listName || ("软件全称" + n),
        softShortName: listName ? listName.slice(0, 6) : ("简称" + n),`,
);

api = api.replace(
  `datasetName: "数据集名称" + n,`,
  `datasetName: listName || ("数据集名称" + n),`,
);

// owner from list when present
api = api.replace(
  `var owners = [mockOwner(1, id)];`,
  `var owners = [mockOwner(1, id)];
    if (listOwner) owners[0].ownerName = listOwner;`,
);

// mockLinks: 9–12 mid segment
api = api.replace(
  `function mockLinks(n, prefix) {
    return [1, 2, 3].map(function (i) {
      return {
        dciCode: "DCI:" + prefix + String(n).padStart(3, "0") + "0" + i + ".156.2025010" + i + "00000157" + i,`,
  `function mockLinks(n, prefix) {
    return [1, 2, 3].map(function (i) {
      var linkMid = (prefix + String(n % 100000).padStart(5, "0") + "0" + i + "A").slice(0, 10);
      if (linkMid.length < 9) linkMid = (linkMid + "0ANT").slice(0, 9);
      return {
        dciCode: "DCI:" + linkMid + ".156.2025010" + i + "00000157" + i,`,
);

fs.writeFileSync(apiPath, api, "utf8");
console.log("api detail align patched");
