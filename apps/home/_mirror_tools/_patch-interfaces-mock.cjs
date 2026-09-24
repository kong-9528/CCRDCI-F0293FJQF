/**
 * Patch interfaces mock: 4 APIs + empty/configured demo gate + names/descs.
 */
const fs = require("fs");

const PERMS =
  '[{"interfaceId":"2080587923100037121","startDate":"2026-09-09"},{"interfaceId":"2080588010370920449","startDate":"2026-09-09"},{"interfaceId":"2070330053367017473","startDate":"2026-09-09"},{"interfaceId":"2055556104074723330","startDate":"2026-09-09"}]';

const INTERFACES = [
  {
    id: "2080587923100037121",
    interfaceName: "实名信息接口",
    interfaceAddr: "/api/v1/dciManage/realName/verify",
    interfaceDesc: "该接口用于同步著作权人的实名信息数据。",
    method: "POST",
  },
  {
    id: "2080588010370920449",
    interfaceName: "实名信息修改接口",
    interfaceAddr: "/api/v1/dciManage/realName/modify",
    interfaceDesc:
      "该接口用于修改著作权人的实名认证信息，包含著作权人ID、著作权人名称、证件有效起始期、证件有效终止期、联系人、手机号、证件名称、证件格式、证件正面照文件路径、证件反面照文件路径。",
    method: "PUT",
  },
  {
    id: "2070330053367017473",
    interfaceName: "DCI申领数据同步接口",
    interfaceAddr: "/api/v1/dciManage/apply/applyInfo",
    interfaceDesc:
      "该接口用于向DCI管理中心提交DCI申领业务数据信息，包括：DCI码基本信息、作品基本信息、作品样本信息、著作权人信息、关联登记信息、数字版权链信息。",
    method: "POST",
  },
  {
    id: "2055556104074723330",
    interfaceName: "DCI撤销数据同步接口",
    interfaceAddr: "/api/v1/dciManage/apply/revokeInfo2",
    interfaceDesc: "该接口用于向DCI管理中心同步DCI撤销的信息。",
    method: "POST",
  },
];

// —— 1) dci-mock-api.js BUSINESS_INTERFACES ——
{
  const p = "apps/home/mirror/static/js/dci-mock-api.js";
  let s = fs.readFileSync(p, "utf8");
  const rows = INTERFACES.map((row) => ({
    id: row.id,
    interfaceName: row.interfaceName,
    interfaceAddr: row.interfaceAddr,
    requestParams: "详见接口文档",
    responseParams: "详见接口文档",
    docFileName: "",
    docFileUrl: "",
    status: "1",
    remark: "",
    interfaceDesc: row.interfaceDesc,
  }));
  const next =
    "var BUSINESS_INTERFACES = " + JSON.stringify(rows) + ";\n";
  const re = /var BUSINESS_INTERFACES = \[[\s\S]*?\];\n/;
  if (!re.test(s)) {
    console.error("BUSINESS_INTERFACES not found");
    process.exit(1);
  }
  s = s.replace(re, next);
  fs.writeFileSync(p, s);
  console.log("1) mock-api BUSINESS_INTERFACES updated");
}

// —— 2) dci-rcx-demo.js: demo on dciapi + apiPermissions only when configured ——
{
  const p = "apps/home/mirror/static/js/dci-rcx-demo.js";
  let s = fs.readFileSync(p, "utf8");

  // Fix shapeOrg apiPermissions gate
  const oldPerms = `        apiPermissions:
          '[{"interfaceId":"2080588010370920449","startDate":"2026-09-09"},{"interfaceId":"2080587923100037121","startDate":"2026-09-09"},{"interfaceId":"2070330053367017473","startDate":"2026-09-09"},{"interfaceId":"2055556104074723330","startDate":"2026-09-09"}]',`;
  const newPerms = `        apiPermissions: configured
          ? '${PERMS}'
          : "",`;
  if (!s.includes(oldPerms)) {
    // try single-line
    const idx = s.indexOf("apiPermissions:");
    console.log("apiPermissions ctx:", JSON.stringify(s.slice(idx, idx + 280)));
    if (idx < 0) process.exit(1);
    // replace from apiPermissions to next field
    s = s.replace(
      /apiPermissions:\s*'\[\{[\s\S]*?\}\]',/,
      `apiPermissions: configured ? '${PERMS}' : "",`,
    );
  } else {
    s = s.replace(oldPerms, newPerms);
  }

  s = s.replace(
    `function isInfoPage() {
    return /\\/dci\\/info-management/.test(location.pathname);
  }`,
    `function isInfoPage() {
    return /\\/dci\\/info-management/.test(location.pathname);
  }

  function isDemoPage() {
    return (
      /\\/dci\\/info-management/.test(location.pathname) ||
      /\\/dci\\/dciapi/.test(location.pathname)
    );
  }

  function wantsApiPermissions() {
    var id = getModeId();
    return id === "configured" || id === "coded" || id === "basic" || id === "full";
  }

  function apiPermissionsJson() {
    return wantsApiPermissions() ? '${PERMS}' : "";
  }`,
  );

  // Use isDemoPage for panel mount
  s = s.replace(
    /if \(isInfoPage\(\) && !document\.getElementById\(PANEL_ID\)\) renderPanel\(\);\s*if \(!isInfoPage\(\) && document\.getElementById\(PANEL_ID\)\) renderPanel\(\);/,
    `if (isDemoPage() && !document.getElementById(PANEL_ID)) renderPanel();
    if (!isDemoPage() && document.getElementById(PANEL_ID)) renderPanel();`,
  );

  // renderPanel should early-return when not demo page
  if (s.includes("function renderPanel()")) {
    s = s.replace(
      "function renderPanel() {",
      `function renderPanel() {
    if (!isDemoPage()) {
      var dead = document.getElementById(PANEL_ID);
      if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
      return;
    }`,
    );
  }

  // export new helpers
  s = s.replace(
    `window.__DCI_RCX_DEMO__ = {
    MODES: MODES,
    ALL_CODE_TYPES: ALL_CODE_TYPES,
    ALL_DATA_APIS: ALL_DATA_APIS,
    getModeId: getModeId,
    setModeId: setModeId,
    shapeOrg: shapeOrg,
    isInfoPage: isInfoPage,
    allowAppOrg: allowAppOrg,
    dict: dict,
    subscribe: subscribe,
    EVENT: EVENT,
  };`,
    `window.__DCI_RCX_DEMO__ = {
    MODES: MODES,
    ALL_CODE_TYPES: ALL_CODE_TYPES,
    ALL_DATA_APIS: ALL_DATA_APIS,
    getModeId: getModeId,
    setModeId: setModeId,
    shapeOrg: shapeOrg,
    isInfoPage: isInfoPage,
    isDemoPage: isDemoPage,
    wantsApiPermissions: wantsApiPermissions,
    apiPermissionsJson: apiPermissionsJson,
    allowAppOrg: allowAppOrg,
    dict: dict,
    subscribe: subscribe,
    EVENT: EVENT,
  };`,
  );

  fs.writeFileSync(p, s);
  console.log("2) dci-rcx-demo updated");
}

// —— 3) dci-mock-auth.js: apply apiPermissions on dciapi without touching auditStatus ——
{
  const p = "apps/home/mirror/static/js/dci-mock-auth.js";
  let s = fs.readFileSync(p, "utf8");
  const marker = `    if (
      window.__DCI_RCX_DEMO__ &&
      typeof window.__DCI_RCX_DEMO__.shapeOrg === "function" &&
      typeof window.__DCI_RCX_DEMO__.isInfoPage === "function" &&
      window.__DCI_RCX_DEMO__.isInfoPage()
    ) {
      return window.__DCI_RCX_DEMO__.shapeOrg(body);
    }
    return body;`;

  const neu = `    if (
      window.__DCI_RCX_DEMO__ &&
      typeof window.__DCI_RCX_DEMO__.shapeOrg === "function" &&
      typeof window.__DCI_RCX_DEMO__.isInfoPage === "function" &&
      window.__DCI_RCX_DEMO__.isInfoPage()
    ) {
      return window.__DCI_RCX_DEMO__.shapeOrg(body);
    }
    // 文档页：仅按演示开关注入/清空接口权限，不改写开通状态
    if (
      body &&
      body.data &&
      window.__DCI_RCX_DEMO__ &&
      typeof window.__DCI_RCX_DEMO__.isDemoPage === "function" &&
      window.__DCI_RCX_DEMO__.isDemoPage() &&
      /\\/dci\\/dciapi/.test(location.pathname) &&
      typeof window.__DCI_RCX_DEMO__.apiPermissionsJson === "function"
    ) {
      body.data.apiPermissions = window.__DCI_RCX_DEMO__.apiPermissionsJson();
    }
    return body;`;

  if (!s.includes(marker)) {
    console.error("orgPayload shapeOrg block not found");
    process.exit(1);
  }
  s = s.replace(marker, neu);
  fs.writeFileSync(p, s);
  console.log("3) mock-auth orgPayload dciapi perms");
}

console.log("base mock wiring done");
