/**
 * Wire home 「技术服务中心工作台」 → @ctp/customer,
 * plus demo session bridge helpers on window.__DCI_MOCK__.
 */
import fs from "fs";

const ROOT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror";
const MOCK = `${ROOT}/static/js/dci-mock-auth.js`;
const HEADER = `${ROOT}/static/js/index-_fJendd7.js`;
const PROFILE = `${ROOT}/static/js/index-CsmZrPeY.js`;

// ——— 1) Extend dci-mock-auth.js ———
let mock = fs.readFileSync(MOCK, "utf8");

if (!mock.includes("openTechWorkbench")) {
  mock = mock.replace(
    `  window.__DCI_MOCK__ = {
    PASS: PASS,
    SMS: SMS,
    USERS: USERS,
    keyFromToken: keyFromToken,
    getUser: getUser,
    resolveLogin: resolveLogin,
    resolveSms: resolveSms,
    openedLabel: openedLabel,
    profilePayload: profilePayload,
    orgPayload: orgPayload,
    tokenFor: tokenFor,
    setSession: setSession,
    clearSession: clearSession,
    currentKey: currentKey,
    currentUser: currentUser,
  };
})();`,
    `  if (typeof window.__DCI_CUSTOMER_URL__ === "undefined") {
    window.__DCI_CUSTOMER_URL__ = "http://localhost:3002";
  }

  function customerBase() {
    return String(window.__DCI_CUSTOMER_URL__ || "http://localhost:3002").replace(/\\/$/, "");
  }

  /** Open tech workbench (customer /desk) with demo user bridge query */
  function openTechWorkbench() {
    var key = currentKey();
    var url = customerBase() + "/desk";
    if (key) {
      url += "?from=home&user=" + encodeURIComponent(key);
    }
    window.open(url, "_blank");
  }

  window.__DCI_MOCK__ = {
    PASS: PASS,
    SMS: SMS,
    USERS: USERS,
    keyFromToken: keyFromToken,
    getUser: getUser,
    resolveLogin: resolveLogin,
    resolveSms: resolveSms,
    openedLabel: openedLabel,
    profilePayload: profilePayload,
    orgPayload: orgPayload,
    tokenFor: tokenFor,
    setSession: setSession,
    clearSession: clearSession,
    currentKey: currentKey,
    currentUser: currentUser,
    customerBase: customerBase,
    openTechWorkbench: openTechWorkbench,
  };
})();`,
  );
  fs.writeFileSync(MOCK, mock, "utf8");
  console.log("OK dci-mock-auth openTechWorkbench");
} else {
  console.log("OK dci-mock-auth already has openTechWorkbench");
}

// ——— 2) Header: techWorkbench + applyTech ———
let header = fs.readFileSync(HEADER, "utf8");
const headerFrom =
  'case"applyTech":window.open("https://www.ccopyright.com.cn/","_blank");break;case"techWorkbench":window.open("https://www.ccopyright.com.cn/","_blank");break;case"logout":_();break}';
const headerTo =
  'case"applyTech":s.push("/user/profile?tab=open");break;case"techWorkbench":window.__DCI_MOCK__&&window.__DCI_MOCK__.openTechWorkbench?window.__DCI_MOCK__.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\/$/,"")+"/desk","_blank");break;case"logout":_();break}';

if (!header.includes(headerFrom)) {
  if (header.includes("openTechWorkbench")) {
    console.log("OK header already patched");
  } else {
    throw new Error("header command block not found");
  }
} else {
  header = header.split(headerFrom).join(headerTo);
  fs.writeFileSync(HEADER, header, "utf8");
  console.log("OK header techWorkbench→customer");
}

// ——— 3) Profile tech card CTA ———
let profile = fs.readFileSync(PROFILE, "utf8");
const profileFrom =
  'onClick:e[52]||(e[52]=s=>window.open("https://www.ccopyright.com.cn/","_blank"))';
const profileTo =
  'onClick:e[52]||(e[52]=s=>{var M=window.__DCI_MOCK__;M&&M.openTechWorkbench?M.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\/$/,"")+"/desk","_blank")})';

if (!profile.includes(profileFrom)) {
  if (profile.includes("openTechWorkbench")) {
    console.log("OK profile already patched");
  } else {
    throw new Error("profile tech CTA not found");
  }
} else {
  profile = profile.split(profileFrom).join(profileTo);
  fs.writeFileSync(PROFILE, profile, "utf8");
  console.log("OK profile tech CTA→customer");
}

console.log("DONE home customer URL wiring");
