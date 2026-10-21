/**
 * Fix mock store: kill password-expired flags; replace failed live APIs with placeholders.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JS_DIR = path.join(__dirname, "..", "mirror", "static", "js");
const storePath = path.join(JS_DIR, "ops-mock-store.json");
const store = JSON.parse(fs.readFileSync(storePath, "utf8"));

function okData(data) {
  return {
    code: 1000000,
    msg: "成功",
    data,
    success: true,
  };
}

const months = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"];
const trend = okData({
  timeList: months,
  seriesList: [
    { name: "申领", data: [12, 18, 15, 22, 19, 25], color: "#0075c1" },
    { name: "撤销", data: [2, 1, 3, 2, 1, 2], color: "#e86452" },
  ],
});

const pieDemo = okData([
  { code: "A", name: "作品", count: 120 },
  { code: "B", name: "软件", count: 45 },
  { code: "C", name: "数据", count: 30 },
]);

const top10 = okData([
  { name: "演示平台甲", count: 86 },
  { name: "演示平台乙", count: 64 },
  { name: "演示平台丙", count: 41 },
  { name: "演示平台丁", count: 28 },
  { name: "演示平台戊", count: 15 },
]);

const nameCount = okData([
  { name: "个人", count: 56 },
  { name: "机构", count: 34 },
]);

const applyRevoke = okData([
  { name: "DCI编码申领总数", count: 1280 },
  { name: "DCI编码撤销总数", count: 36 },
]);

const related = okData({
  "2025-10": [
    { name: "DCI申领数", count: 18 },
    { name: "关联登记数", count: 7 },
  ],
  "2025-11": [
    { name: "DCI申领数", count: 22 },
    { name: "关联登记数", count: 9 },
  ],
  "2025-12": [
    { name: "DCI申领数", count: 19 },
    { name: "关联登记数", count: 8 },
  ],
  "2026-01": [
    { name: "DCI申领数", count: 28 },
    { name: "关联登记数", count: 12 },
  ],
  "2026-02": [
    { name: "DCI申领数", count: 24 },
    { name: "关联登记数", count: 10 },
  ],
  "2026-03": [
    { name: "DCI申领数", count: 31 },
    { name: "关联登记数", count: 14 },
  ],
});

const PLACEHOLDERS = {
  "/opusDwcrStat/queryStatByTimeType": trend,
  "/opusDwcrStat/queryApplyAndRevoke": applyRevoke,
  "/opusDwcrStat/queryContractFilingTrend": trend,
  "/opusDwcrStat/queryDciCodeType": pieDemo,
  "/opusDwcrStat/queryFileType": pieDemo,
  "/opusDwcrStat/queryArea": pieDemo,
  "/opusDwcrStat/queryBusinessType": pieDemo,
  "/opusDwcrStat/queryRightOwnerType": nameCount,
  "/opusDwcrStat/queryOwnerType": nameCount,
  "/opusDwcrStat/queryOwnerTypeGroup": nameCount,
  "/opusDwcrStat/queryRegisterOrgType": pieDemo,
  "/opusDwcrStat/queryApplyOrgTop10": top10,
  "/opusDwcrStat/queryRegisterOrgTop10": top10,
  "/opusDwcrStat/queryAppOrgCodeTop10": top10,
  "/opusDwcrStat/queryApplyAndRegisterCount": related,
};

function pathFromKey(key) {
  // "POST /api/v1/dciManage/opusDwcrStat/foo" or "POST /opusDwcrStat/foo"
  const parts = key.split(" ");
  let p = parts.slice(1).join(" ");
  const i = p.indexOf("/api/v1/dciManage");
  if (i >= 0) p = p.slice(i + "/api/v1/dciManage".length) || "/";
  return p.split("?")[0];
}

let fixedFail = 0;
let fixedPwd = 0;

for (const key of Object.keys(store)) {
  const body = store[key];
  if (!body || typeof body !== "object") continue;

  // getInfo password flags (redacted scrub turned booleans into "[redacted]")
  if (key.includes("/getInfo") && body.data) {
    if (body.data.isPasswordExpired !== false) {
      body.data.isPasswordExpired = false;
      fixedPwd++;
    }
    if (body.data.isDefaultModifyPwd !== false) {
      body.data.isDefaultModifyPwd = false;
      fixedPwd++;
    }
  }

  const failed =
    body.success === false ||
    (body.code !== 200 && body.code !== 1000000 && body.code !== 1e6);
  if (!failed) continue;

  const p = pathFromKey(key);
  const ph = PLACEHOLDERS[p];
  if (ph) {
    store[key] = JSON.parse(JSON.stringify(ph));
    fixedFail++;
  } else if (/list|page|query|Tree/i.test(p)) {
    store[key] = {
      code: 1000000,
      msg: "成功",
      rows: [],
      total: 0,
      data: [],
      success: true,
    };
    fixedFail++;
  } else {
    store[key] = okData(null);
    fixedFail++;
  }
}

// Always overwrite known placeholder endpoints with correct demo shapes
for (const [p, ph] of Object.entries(PLACEHOLDERS)) {
  const k1 = "POST /api/v1/dciManage" + p;
  const k2 = "POST " + p;
  store[k1] = JSON.parse(JSON.stringify(ph));
  store[k2] = JSON.parse(JSON.stringify(ph));
}

fs.writeFileSync(storePath, JSON.stringify(store));
fs.writeFileSync(
  path.join(JS_DIR, "ops-mock-store.js"),
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n",
);
console.log(JSON.stringify({ fixedFail, fixedPwd, entries: Object.keys(store).length }, null, 2));
