/**
 * Expand allocation list mock rows:
 * - opus: R / C / X
 * - soft: R / C
 * - dataset: X only
 * Also filter cursorList by caseType in ops-mock-api.js
 */
import fs from "node:fs";
import path from "node:path";

const jsonPath = "apps/ops-dci/mirror/static/js/ops-mock-store.json";
const jsPath = "apps/ops-dci/mirror/static/js/ops-mock-store.js";
const apiPath = "apps/ops-dci/mirror/static/js/ops-mock-api.js";

const KEY = "POST /api/v1/dciManage/dci/applyDoc/cursorList";

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
  // —— 作品 opus：R / C / X ——
  row({
    id: "1788328941895",
    dciCode: "DCI:RQZ010ANT.156.20260820A7K3M9P2Q1",
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
    dciCode: "DCI:RQZWK1ANT.156.20260818G1H3J5K7L9",
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
    dciCode: "DCI:RQZMUSANT.156.20260901B3C5D7E9F1",
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
    dciCode: "DCI:CQZ010ANT.156.20260910H2J4K6L8M0",
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
    dciCode: "DCI:CQZARTANT.156.20260915N1P3Q5R7S9",
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
    dciCode: "DCI:XQZVIDANT.156.20260920T2U4V6W8X0",
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
    dciCode: "DCI:XQZMAPANT.156.20260922Y1Z3A5B7C9",
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
    dciCode: "DCI:RQZPHOANT.156.20260925D2E4F6G8H0",
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

  // —— 软件 soft：R / C ——
  row({
    id: "1788328608723",
    dciCode: "DCI:RQZSW0ANT.156.20260815B2C4D6E8F0",
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
    dciCode: "DCI:RQZSW1ANT.156.20260903J1K3L5M7N9",
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
    dciCode: "DCI:RQZSW2ANT.156.20260908P0Q2R4S6T8",
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
    dciCode: "DCI:CQZSW0ANT.156.20260914U1V3W5X7Y9",
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
    dciCode: "DCI:CQZSW1ANT.156.20260918Z0A2B4C6D8",
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

  // —— 数据集 dataset：全部 X ——
  row({
    id: "1788403000001",
    dciCode: "DCI:XQZDS0ANT.156.20260902E1F3G5H7J9",
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
    dciCode: "DCI:XQZDS1ANT.156.20260907K2L4M6N8P0",
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
    dciCode: "DCI:XQZDS2ANT.156.20260911Q1R3S5T7U9",
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
    dciCode: "DCI:XQZDS3ANT.156.20260917V0W2X4Y6Z8",
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
    dciCode: "DCI:XQZDS4ANT.156.20260924A1B3C5D7E9",
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

const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const prev = store[KEY];
if (!prev || !prev.data) {
  console.error("missing cursorList payload");
  process.exit(1);
}

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
fs.writeFileSync(
  jsPath,
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n",
);

const summary = rows.reduce((acc, r) => {
  const k = `${r.caseType}:${r.dciCodeType}`;
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});
console.log("rows", rows.length, summary);

// Filter cursorList by caseType in mock API
let api = fs.readFileSync(apiPath, "utf8");
const marker = "function filterCursorListByCaseType";
if (!api.includes(marker)) {
  const helper = `
  function filterCursorListByCaseType(body, reqBody) {
    if (!body || !body.data || !Array.isArray(body.data.rows)) return body;
    var params = parseFormBody(reqBody);
    if (!params || typeof params !== "object") {
      try {
        params = typeof reqBody === "string" ? JSON.parse(reqBody || "{}") : reqBody || {};
      } catch (e) {
        params = {};
      }
    }
    var caseType = params.caseType || params.case_type;
    if (!caseType) return body;
    var rows = body.data.rows.filter(function (r) {
      return String(r.caseType || r.case_type || "") === String(caseType);
    });
    var out = JSON.parse(JSON.stringify(body));
    out.data.rows = rows;
    out.data.total = rows.length;
    out.data.hasMore = false;
    out.data.caseType = caseType;
    return out;
  }

`;
  api = api.replace(
    "  function handle(method, rawUrl, body) {",
    helper + "  function handle(method, rawUrl, body) {",
  );

  const inject = `
    // DCI码分配列表：按 tab caseType 过滤
    if ((m === "POST" || m === "GET") && /\\/dci\\/applyDoc\\/cursorList$/.test(path)) {
      var listHit = lookup(m, rawUrl);
      if (listHit) return filterCursorListByCaseType(listHit, body);
    }
`;
  if (!api.includes("按 tab caseType 过滤")) {
    api = api.replace(
      "    // DCI码分配列表导出：字段与列表列一致，返回可下载 blob",
      inject + "\n    // DCI码分配列表导出：字段与列表列一致，返回可下载 blob",
    );
  }

  // export: drop "fallback to all rows" now that dataset exists
  api = api.replace(
    `    // mock 库可能缺某 caseType 样例；列表页仍会展示 cursorList 全量，导出与可见列表对齐
    if (!rows.length) rows = allRows || [];
`,
    "",
  );

  fs.writeFileSync(apiPath, api, "utf8");
  console.log("api patched for caseType filter");
} else {
  console.log("api already has caseType filter");
}

console.log("done");
