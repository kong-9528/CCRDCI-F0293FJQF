/**
 * Patch ops-dci mock store: align 雅昌 / 蚂蚁(原太极) org fields with home demo accounts.
 */
const fs = require("fs");
const path = require("path");

const jsonPath = path.join(
  __dirname,
  "../mirror/static/js/ops-mock-store.json",
);
const jsPath = path.join(__dirname, "../mirror/static/js/ops-mock-store.js");

const YACHANG = {
  orgName: "深圳市雅昌艺术网股份有限公司",
  orgNamePy: "yachangyishu",
  creditCode: "91440300724726181Q",
  orgAddress: "深圳市南山区深云路19号",
  orgTypeCode: "NRPT",
  orgTypeName: "内容平台",
};

const MAYI = {
  orgName: "蚂蚁科技集团股份有限公司",
  orgNamePy: "mayikeji",
  creditCode: "913301067046373179",
  orgAddress:
    "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
  orgTypeCode: "ZYFW",
  orgTypeName: "专业服务",
};

function patchOrg(o, profile, renameFrom) {
  if (!o || typeof o !== "object") return false;
  const name = o.orgName || o.regOrgName || "";
  if (renameFrom && name === renameFrom) {
    if ("orgName" in o) o.orgName = profile.orgName;
    if ("regOrgName" in o) o.regOrgName = profile.orgName;
    if ("applyOrgName" in o) o.applyOrgName = profile.orgName;
  } else if (name !== profile.orgName && name !== renameFrom) {
    return false;
  }
  if ("orgNamePy" in o || name === profile.orgName || name === renameFrom)
    o.orgNamePy = profile.orgNamePy;
  if ("regOrgNamePy" in o) o.regOrgNamePy = profile.orgNamePy;
  if ("creditCode" in o || name === profile.orgName || name === renameFrom)
    o.creditCode = profile.creditCode;
  if ("orgAddress" in o || "regOrgAddress" in o) {
    if ("orgAddress" in o) o.orgAddress = profile.orgAddress;
    if ("regOrgAddress" in o) o.regOrgAddress = profile.orgAddress;
  } else if (name === profile.orgName || name === renameFrom) {
    o.orgAddress = profile.orgAddress;
  }
  if ("orgTypeCode" in o) o.orgTypeCode = profile.orgTypeCode;
  if ("orgTypeName" in o || "regOrgType" in o) {
    if ("orgTypeName" in o) o.orgTypeName = profile.orgTypeName;
    if ("regOrgType" in o && typeof o.regOrgType === "string") {
      // keep code-like values as code
      if (o.regOrgType === "DJJG" || o.regOrgType === "NRPT" || o.regOrgType === "ZYFW") {
        o.regOrgType = profile.orgTypeCode;
      }
    }
  }
  return true;
}

function walk(node, stats) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((x) => walk(x, stats));
    return;
  }
  const name = node.orgName || node.regOrgName || "";
  if (name === "深圳市雅昌艺术网股份有限公司") {
    if (patchOrg(node, YACHANG)) stats.yachang++;
  } else if (name === "太极计算机股份有限公司" || name === "蚂蚁科技集团股份有限公司") {
    if (patchOrg(node, MAYI, "太极计算机股份有限公司")) stats.mayi++;
  }
  // invitation / display-only rows that only have orgName string field
  if (node.dciRegOrgName === "太极计算机股份有限公司") {
    node.dciRegOrgName = MAYI.orgName;
    stats.mayi++;
  }
  if (node.dciRegOrgName === "深圳市雅昌艺术网股份有限公司") {
    // keep name; ensure type label if present
    stats.yachangLabel++;
  }
  for (const k of Object.keys(node)) walk(node[k], stats);
}

const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const stats = { yachang: 0, mayi: 0, yachangLabel: 0 };

// Also global string replace for leftover name mentions in nested JSON blobs
let raw = JSON.stringify(store);
raw = raw.split("太极计算机股份有限公司").join(MAYI.orgName);
const store2 = JSON.parse(raw);
walk(store2, stats);

fs.writeFileSync(jsonPath, JSON.stringify(store2));
fs.writeFileSync(
  jsPath,
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store2) + ";\n",
);

console.log("ops-dci mock store patched", stats);
console.log(
  "tai ji leftovers",
  JSON.stringify(store2).includes("太极计算机") ? "STILL HAS" : "cleared",
);
