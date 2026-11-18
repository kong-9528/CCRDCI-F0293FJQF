/**
 * Fix ops-dci registrOrg review mock data:
 * 1) mayi / mayi1 → 专业服务 (ZYFW) across pending / my / all
 * 2) fill empty orgCode on my approved
 * 3) add my/all rejected rows with valid rejection reasons
 * 4) normalize apiPermissions to the 4 known business interfaces
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "mirror/static/js/ops-mock-store.json");
const jsPath = path.join(root, "mirror/static/js/ops-mock-store.js");

const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const VALID_IFACES = [
  { id: "2080587923100037121", name: "实名信息接口" },
  { id: "2080588010370920449", name: "实名信息修改接口" },
  { id: "2080588682629771266", name: "DCI申领数据同步接口" },
  { id: "2080588786392657922", name: "DCI撤销数据同步接口" },
];
const VALID_IDS = new Set(VALID_IFACES.map((x) => x.id));
const LEGACY_MAP = {
  "2070330053367017473": "2080588682629771266",
  "2055556104074723330": "2080588786392657922",
  "2082016982640128002": "2080588682629771266",
  "2059188753364221953": "2080587923100037121",
  "2059948230564302850": "2080588010370920449",
};

const REJECT_REASONS = [
  "营业执照扫描件不清晰，请重新上传可辨认的证件材料",
  "合同起止日期与盖章合同文本不一致，请核对后重新提交",
  "合作领域描述过于笼统，请补充具体业务场景与对接范围",
  "联系人手机号无法核实，请提供有效的业务对接联系方式",
  "组织机构代码与国家企业信用信息公示内容不符",
];

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function isMayiLike(row) {
  const u = String(row.loginUsername || "").toLowerCase();
  return u === "mayi" || u === "mayi1" || u === "mayi2";
}

function setProfessional(row) {
  row.orgTypeCode = "ZYFW";
  row.orgTypeName = "专业服务";
}

function normalizeApiPermissions(raw, seed) {
  let items = [];
  if (raw == null || raw === "" || raw === "[]") {
    items = [];
  } else if (typeof raw === "string" && raw.trim().startsWith("[")) {
    try {
      items = JSON.parse(raw);
    } catch (e) {
      items = [];
    }
  } else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
    items = [{ interfaceId: raw.trim() }];
  } else if (Array.isArray(raw)) {
    items = raw;
  }

  const seen = new Set();
  const out = [];
  for (const it of items) {
    let id =
      typeof it === "object" && it
        ? String(it.interfaceId || it.id || "")
        : String(it || "");
    if (LEGACY_MAP[id]) id = LEGACY_MAP[id];
    if (!VALID_IDS.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({
      interfaceId: id,
      startDate: (it && it.startDate) || "2026-01-01",
      ...(it && it.endDate ? { endDate: it.endDate } : {}),
    });
  }
  if (!out.length) {
    const n = 1 + (Math.abs(Number(seed) || 0) % 4);
    for (let i = 0; i < n; i += 1) {
      out.push({
        interfaceId: VALID_IFACES[i].id,
        startDate: "2026-01-01",
      });
    }
  }
  return JSON.stringify(out);
}

function fillOrgCode(row, fallback) {
  const code = row.orgCode;
  if (code == null || String(code).trim() === "" || String(code) === "-") {
    row.orgCode = fallback;
  }
}

function touchApprovedRow(row, idx) {
  if (isMayiLike(row)) setProfessional(row);
  if (String(row.auditStatus) === "1") {
    fillOrgCode(
      row,
      ({
        demoorg_a: "HDB",
        demoorg_b: "NFD",
        demoorg_c: "BFB",
        cjiu1122: "SSC",
        "14299998888": "ZBM",
        "13911189963": "ZXH",
      })[String(row.loginUsername || "")] ||
        (row.orgNamePy
          ? String(row.orgNamePy).replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() ||
            "ORG"
          : "ORG") + String((idx % 9) + 1),
    );
    row.apiPermissions = normalizeApiPermissions(
      row.apiPermissions,
      row.id || idx,
    );
  }
}

function makeRejectRows(templateRows) {
  const base = templateRows && templateRows[0] ? clone(templateRows[0]) : {};
  const seeds = [
    {
      id: "811",
      loginUsername: "reject_hz",
      orgName: "杭州云启版权服务有限公司",
      orgNamePy: "hangzhouyunqi",
      creditCode: "91330100MA2H0001X1",
      linkName: "陈思",
      linkPhone: "13700001101",
    },
    {
      id: "812",
      loginUsername: "reject_sz",
      orgName: "苏州文枢数字科技有限公司",
      orgNamePy: "suzhouwenshu",
      creditCode: "91320500MA2H0002Y2",
      linkName: "周强",
      linkPhone: "13700001102",
    },
    {
      id: "813",
      loginUsername: "reject_cd",
      orgName: "成都锦江内容平台有限公司",
      orgNamePy: "chengdujinjiang",
      creditCode: "91510100MA2H0003Z3",
      linkName: "何敏",
      linkPhone: "13700001103",
    },
    {
      id: "814",
      loginUsername: "reject_wh",
      orgName: "武汉光谷版权中心有限公司",
      orgNamePy: "wuhanguanggu",
      creditCode: "91420100MA2H0004A4",
      linkName: "刘洋",
      linkPhone: "13700001104",
    },
  ];
  return seeds.map((s, i) => {
    const row = clone(base);
    Object.assign(row, s, {
      createBy: s.loginUsername,
      contactPerson: s.loginUsername,
      orgTypeCode: i % 2 === 0 ? "NRPT" : "ZYFW",
      orgTypeName: i % 2 === 0 ? "内容平台" : "专业服务",
      orgCode: null,
      auditStatus: "2",
      status: "1",
      auditType: "1",
      changeStatus: "0",
      auditRemark: REJECT_REASONS[i],
      auditTime: `2026-11-${String(10 + i).padStart(2, "0")} 15:20:0${i}`,
      updateBy: "root",
      updateTime: `2026-11-${String(10 + i).padStart(2, "0")} 15:20:0${i}`,
      createTime: `2026-11-${String(1 + i).padStart(2, "0")} 10:00:00`,
      createdAt: `2026-11-${String(1 + i).padStart(2, "0")} 10:00:00`,
      contractStartDate: "2026-01-01 00:00:00",
      contractEndDate: "2027-12-31 00:00:00",
      apiPermissions: null,
      rcxType: null,
      invitationCode: `RJ${1000 + i}`,
      orgAddress: "演示地址（审核不通过样例）",
      cooperationField: "版权服务",
    });
    return row;
  });
}

function pageBody(rows) {
  return {
    code: 200,
    msg: "查询成功",
    rows,
    total: rows.length,
  };
}

const PENDING_KEYS = [
  "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=0",
  "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=1&auditStatus=0",
];
const MY_PASS_KEYS = [
  "GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1",
  "GET /api/v1/dciManage/dci/regorg/myList",
];
const ALL_PASS_KEYS = [
  "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=1",
  "GET /api/v1/dciManage/dci/regorg/list",
];

for (const key of PENDING_KEYS) {
  const body = store[key];
  if (!body || !Array.isArray(body.rows)) continue;
  for (const row of body.rows) {
    if (isMayiLike(row) || String(row.loginUsername).toLowerCase() === "mayi1") {
      setProfessional(row);
    }
  }
}

for (const key of [...MY_PASS_KEYS, ...ALL_PASS_KEYS]) {
  const body = store[key];
  if (!body || !Array.isArray(body.rows)) continue;
  body.rows.forEach((row, idx) => touchApprovedRow(row, idx));
  // keep mayi first-tier type even if username already mayi
  for (const row of body.rows) {
    if (String(row.loginUsername || "").toLowerCase() === "mayi") {
      setProfessional(row);
    }
  }
}

const myPass =
  store["GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1"];
const rejectRows = makeRejectRows(myPass && myPass.rows);

store["GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=2"] =
  pageBody(rejectRows);
store["GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=2"] =
  pageBody(rejectRows.map((r, i) => ({ ...clone(r), id: String(821 + i) })));

// Ensure mayi1 pending remains 专业服务 after any prior pin script
for (const key of PENDING_KEYS) {
  const body = store[key];
  if (!body || !Array.isArray(body.rows)) continue;
  for (const row of body.rows) {
    if (String(row.loginUsername || "").toLowerCase() === "mayi1") {
      setProfessional(row);
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(store));
fs.writeFileSync(
  jsPath,
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n",
);

function preview(key) {
  const rows = (store[key] && store[key].rows) || [];
  return rows.slice(0, 6).map((r, i) => ({
    n: i + 1,
    u: r.loginUsername,
    type: r.orgTypeName || r.orgTypeCode,
    code: r.orgCode,
    api: String(r.apiPermissions || "").slice(0, 60),
    remark: r.auditRemark,
    a: r.auditStatus,
  }));
}

console.log(
  "pending",
  preview(
    "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=0",
  ),
);
console.log(
  "my pass",
  preview(
    "GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1",
  ),
);
console.log(
  "my reject",
  preview(
    "GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=2",
  ),
);
console.log(
  "all pass sample",
  preview(
    "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=1",
  ),
);
console.log("patched ok");
