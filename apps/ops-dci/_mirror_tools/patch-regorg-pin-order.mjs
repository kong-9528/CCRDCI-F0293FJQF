/**
 * Pin demo accounts in ops-dci registrOrg mock lists:
 * - pending (auditStatus=0): yachang #1, mayi1 #2
 * - myList approved (auditStatus=1): yachang1 #1, mayi #2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "mirror/static/js/ops-mock-store.json");
const jsPath = path.join(root, "mirror/static/js/ops-mock-store.js");

const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function pinFront(rows, usernames, mutators) {
  const list = Array.isArray(rows) ? rows.slice() : [];
  const picked = [];
  for (let i = 0; i < usernames.length; i += 1) {
    const u = usernames[i];
    let idx = list.findIndex(
      (r) => String(r.loginUsername || "").toLowerCase() === u.toLowerCase(),
    );
    if (idx < 0 && mutators[u] && mutators[u].fallbackMatch) {
      idx = list.findIndex(mutators[u].fallbackMatch);
    }
    let row;
    if (idx >= 0) {
      row = list.splice(idx, 1)[0];
    } else {
      row = clone(list[0] || {});
      row.id = String(9000 + i);
    }
    if (mutators[u] && typeof mutators[u].apply === "function") {
      mutators[u].apply(row);
    }
    picked.push(row);
  }
  return picked.concat(list);
}

function patchBody(body, usernames, mutators) {
  if (!body || !Array.isArray(body.rows)) return body;
  const next = clone(body);
  next.rows = pinFront(next.rows, usernames, mutators);
  next.total = next.total != null ? next.total : next.rows.length;
  return next;
}

const pendingMutators = {
  yachang: {
    fallbackMatch: (r) =>
      String(r.loginUsername || "") === "AAAAA1" ||
      String(r.loginUsername || "") === "yachang01",
    apply(row) {
      row.loginUsername = "yachang";
      row.createBy = "yachang";
      row.updateBy = "yachang";
      row.contactPerson = "yachang";
      row.orgName = "深圳市雅昌艺术网股份有限公司";
      row.orgNamePy = "yachangyishuwang";
      row.creditCode = "91440300724726181Q";
      row.orgAddress = "广东省深圳市南山区深云路19号雅昌艺术中心";
      row.orgTypeCode = "NRPT";
      row.orgTypeName = "内容平台";
      row.auditStatus = "0";
      row.auditType = "1";
      row.status = "0";
      row.orgCode = null;
      row.linkName = "王敏";
      row.linkPhone = "13900001111";
      row.loginPhone = "13900001111";
      row.cooperationField =
        "艺术品数字版权确权、展览及出版物内容核验、DCI码申领与同步";
      row.createTime = "2026-11-18 09:20:00";
      row.createdAt = "2026-11-18 09:20:00";
      row.contractStartDate = "2026-01-01 00:00:00";
      row.contractEndDate = "2027-12-31 00:00:00";
      row.invitationCode = "DCI-YC-2026A";
    },
  },
  mayi1: {
    fallbackMatch: (r) =>
      String(r.loginUsername || "") === "yachang00" ||
      String(r.loginUsername || "") === "test3",
    apply(row) {
      row.loginUsername = "mayi1";
      row.createBy = "mayi1";
      row.updateBy = "mayi1";
      row.contactPerson = "mayi1";
      row.orgName = "蚂蚁科技集团股份有限公司";
      row.orgNamePy = "mayikeji";
      row.creditCode = "913301067046373179";
      row.orgAddress =
        "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室";
      row.orgTypeCode = "NRPT";
      row.orgTypeName = "内容平台";
      row.auditStatus = "0";
      row.auditType = "1";
      row.status = "0";
      row.orgCode = null;
      row.linkName = "李娜";
      row.linkPhone = "13800002222";
      row.loginPhone = "13800002222";
      row.cooperationField = "数字版权确权与DCI码申领";
      row.createTime = "2026-11-18 09:10:00";
      row.createdAt = "2026-11-18 09:10:00";
      row.contractStartDate = "2026-01-01 00:00:00";
      row.contractEndDate = "2027-12-31 00:00:00";
      row.invitationCode = "DCI-MY-2026A";
    },
  },
};

const approvedMutators = {
  yachang1: {
    fallbackMatch: (r) =>
      String(r.loginUsername || "") === "yanshi" ||
      String(r.orgCode || "") === "ART" ||
      String(r.orgName || "").includes("雅昌艺术网"),
    apply(row) {
      row.loginUsername = "yachang1";
      row.createBy = "yachang1";
      row.contactPerson = "yachang1";
      row.orgName = "深圳市雅昌艺术网股份有限公司";
      row.orgNamePy = "yachangyishuwang";
      row.creditCode = "91440300724726181Q";
      row.orgCode = "ART";
      row.orgTypeCode = "NRPT";
      row.orgTypeName = "内容平台";
      row.auditStatus = "1";
      row.status = "0";
      row.rcxType = row.rcxType || "原始分配";
      row.linkName = row.linkName || "王敏";
      row.linkPhone = row.linkPhone || "13900001112";
    },
  },
  mayi: {
    fallbackMatch: (r) =>
      String(r.loginUsername || "") === "mayi2" ||
      String(r.orgName || "").includes("蚂蚁科技"),
    apply(row) {
      row.loginUsername = "mayi";
      row.createBy = "mayi";
      row.contactPerson = "mayi";
      row.orgName = "蚂蚁科技集团股份有限公司";
      row.orgNamePy = "mayikeji";
      row.creditCode = "913301067046373179";
      row.orgCode = "ANT";
      row.orgTypeCode = "NRPT";
      row.orgTypeName = "内容平台";
      row.auditStatus = "1";
      row.status = "0";
      row.rcxType = row.rcxType || "原始分配,授权分配,其他";
      row.linkName = row.linkName || "姚立明";
    },
  },
};

const pendingKeys = [
  "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=0",
  "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=1&auditStatus=0",
];

const myKeys = [
  "GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1",
  "GET /api/v1/dciManage/dci/regorg/myList",
];

for (const key of pendingKeys) {
  if (store[key]) {
    store[key] = patchBody(store[key], ["yachang", "mayi1"], pendingMutators);
  }
}

for (const key of myKeys) {
  if (store[key]) {
    store[key] = patchBody(store[key], ["yachang1", "mayi"], approvedMutators);
  }
}

// Keep all-audit approved list usernames consistent when those rows appear
const allApprovedKey =
  "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=1";
if (store[allApprovedKey] && Array.isArray(store[allApprovedKey].rows)) {
  store[allApprovedKey] = patchBody(
    store[allApprovedKey],
    ["yachang1", "mayi"],
    approvedMutators,
  );
}
const allListKey = "GET /api/v1/dciManage/dci/regorg/list";
if (store[allListKey] && Array.isArray(store[allListKey].rows)) {
  // only rename if present; do not force to front of "all" dump
  for (const row of store[allListKey].rows) {
    if (
      String(row.loginUsername) === "yanshi" ||
      (String(row.orgCode) === "ART" &&
        String(row.orgName || "").includes("雅昌"))
    ) {
      approvedMutators.yachang1.apply(row);
    }
    if (
      String(row.loginUsername) === "mayi2" ||
      (String(row.orgName || "").includes("蚂蚁科技") &&
        String(row.auditStatus) === "1")
    ) {
      approvedMutators.mayi.apply(row);
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
  return rows.slice(0, 4).map((r, i) => ({
    n: i + 1,
    u: r.loginUsername,
    org: r.orgName,
    code: r.orgCode,
    a: r.auditStatus,
  }));
}

console.log(
  "pending:",
  preview(
    "GET /api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=0",
  ),
);
console.log(
  "my approved:",
  preview(
    "GET /api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1",
  ),
);
console.log("patched ok");
