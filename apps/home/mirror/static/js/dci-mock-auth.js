/** DCI home mirror — demo auth users (offline) */
(function () {
  var PASS = "Abcd1234";
  var SMS = "123456";
  var USERS = {
    yachang: {
      userId: "mock-yachang",
      username: "yachang",
      nickName: "yachang",
      phonenumber: "13900001111",
      auditStatus: null,
      techStatus: null,
      orgName: "深圳市雅昌艺术网股份有限公司",
      orgNamePy: "yachangyishu",
      creditCode: "91440300724726181Q",
      orgAddress: "深圳市南山区深云路19号",
      orgTypeCode: "NRPT",
      orgTypeName: "内容平台",
    },
    mayi: {
      userId: "mock-mayi",
      username: "mayi",
      nickName: "mayi",
      phonenumber: "13800008000",
      auditStatus: 1,
      techStatus: null,
      orgName: "蚂蚁科技集团股份有限公司",
      orgNamePy: "mayikeji",
      creditCode: "913301067046373179",
      orgAddress: "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
      orgTypeCode: "ZYFW",
      orgTypeName: "专业服务",
    },
    mayi1: {
      userId: "mock-mayi1",
      username: "mayi1",
      nickName: "mayi1",
      phonenumber: "13800008001",
      auditStatus: null,
      techStatus: 1,
      orgName: "蚂蚁科技集团股份有限公司",
      orgNamePy: "mayikeji",
      creditCode: "913301067046373179",
      orgAddress: "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
      orgTypeCode: "ZYFW",
      orgTypeName: "专业服务",
    },
    mayi2: {
      userId: "mock-mayi2",
      username: "mayi2",
      nickName: "mayi2",
      phonenumber: "13800008002",
      auditStatus: 1,
      techStatus: 1,
      orgName: "蚂蚁科技集团股份有限公司",
      orgNamePy: "mayikeji",
      creditCode: "913301067046373179",
      orgAddress: "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
      orgTypeCode: "ZYFW",
      orgTypeName: "专业服务",
    },
  };
  var PHONE_MAP = {};
  Object.keys(USERS).forEach(function (k) {
    PHONE_MAP[USERS[k].phonenumber] = k;
  });

  function keyFromToken(token) {
    if (!token || String(token).indexOf("mock-") !== 0) return null;
    return String(token).slice(5);
  }
  function getUser(key) {
    var u = key && USERS[key] ? USERS[key] : null;
    if (u) {
      // Only hydrate from sessionStorage — never call __DCI_TECH_STORE__
      // (currentTechStatus → ensureBucket → getUser would recurse forever).
      try {
        var raw = JSON.parse(sessionStorage.getItem("dci-tech-apply-store") || "{}");
        if (raw && raw[key] && raw[key].techStatus !== undefined && raw[key].techStatus !== null) {
          u.techStatus = Number(raw[key].techStatus);
        }
      } catch (e) {}
    }
    return u;
  }
  function resolveLogin(username, password) {
    var k = String(username || "").trim().toLowerCase();
    if (!USERS[k]) return null;
    if (password !== PASS) return null;
    return k;
  }
  function resolveSms(phone, code) {
    var k = PHONE_MAP[String(phone || "").trim()];
    if (!k) return null;
    if (String(code) !== SMS) return null;
    return k;
  }
  function resolveTechStatus(u) {
    // Prefer session bucket for *this* user; avoid currentTechStatus() here
    // when u may already come from getUser (would recurse).
    try {
      var key = u && u.username ? String(u.username).toLowerCase() : null;
      if (!key) {
        try {
          key = sessionStorage.getItem("dci-mock-key");
        } catch (e0) {}
      }
      if (key) {
        var raw = JSON.parse(sessionStorage.getItem("dci-tech-apply-store") || "{}");
        if (raw && raw[key] && raw[key].techStatus !== undefined && raw[key].techStatus !== null) {
          return Number(raw[key].techStatus);
        }
      }
    } catch (e) {}
    if (!u) return null;
    if (u.techStatus === null || u.techStatus === undefined) return null;
    return Number(u.techStatus);
  }

  function openedLabel(u) {
    var r = u.auditStatus === 1;
    var t = resolveTechStatus(u) === 1;
    if (r && t) return "DCI注册中心、DCI®技术服务中心";
    if (r) return "DCI注册中心";
    if (t) return "DCI®技术服务中心";
    return "暂无";
  }
  function profilePayload(u) {
    return {
      code: 200,
      data: {
        user: {
          userId: u.userId,
          username: u.username,
          userName: u.username,
          nickName: u.nickName,
          phonenumber: u.phonenumber,
          avatar: "",
          userType: "01",
          regOrgName: u.orgName || "",
          orgName: u.orgName || "",
        },
        roleGroup: "普通角色",
        postGroup: "",
        roles: ["ROLE_DEFAULT"],
        permissions: ["*:*:*"],
        pwdChrtype: "",
      },
    };
  }
  function orgPayload(u) {
    var body;
    if (u.auditStatus === null || u.auditStatus === undefined) {
      body = { code: 200, data: null };
    } else {
      var code =
        u.username === "mayi" || u.username === "mayi2"
          ? "ANT"
          : "ORG-" + String(u.username || "demo").toUpperCase();
      body = {
        code: 200,
        data: {
          id: u.userId,
          auditStatus: u.auditStatus,
          orgName: u.orgName,
          regOrgName: u.orgName,
          orgNamePy: u.orgNamePy || "",
          regOrgNamePy: u.orgNamePy || "",
          creditCode: u.creditCode || "",
          orgAddress: u.orgAddress || "",
          regOrgAddress: u.orgAddress || "",
          orgTypeCode: u.orgTypeCode || "",
          regOrgType: u.orgTypeCode || "",
          orgTypeName: u.orgTypeName || "",
          orgCode: code,
          dciRegOrgCode: code,
          dciCodeType: "原始分配,授权分配,其他",
          dciDataInterface:
            "实名信息接口,实名信息修改接口,DCI申领数据同步接口,DCI撤销数据同步接口",
          accessKey: "AK" + String(u.username || "demo").toUpperCase() + "MOCK000000000001",
          accessSecret: "SK" + String(u.username || "demo").toUpperCase() + "MOCKSECRET00000001",
          dataEncrypKey: "DEK" + String(u.username || "demo").toUpperCase() + "MOCK000000001",
        },
      };
    }
    // DCI码权限演示只应改写标识管理页的机构字段，不能污染账号开通状态
    // （默认 mode=none 会把 auditStatus 打成 0，导致 mayi2 菜单丢掉注册中心入口）
    if (
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
      /\/dci\/dciapi/.test(location.pathname) &&
      typeof window.__DCI_RCX_DEMO__.apiPermissionsJson === "function"
    ) {
      body.data.apiPermissions = window.__DCI_RCX_DEMO__.apiPermissionsJson();
    }
    // 机构信息页：按演示开关注入 changeStatus / 补齐字段
    if (
      body &&
      window.__DCI_ORGINFO_DEMO__ &&
      typeof window.__DCI_ORGINFO_DEMO__.shapePayload === "function" &&
      typeof window.__DCI_ORGINFO_DEMO__.isOrgInfoPage === "function" &&
      window.__DCI_ORGINFO_DEMO__.isOrgInfoPage()
    ) {
      return window.__DCI_ORGINFO_DEMO__.shapePayload(body);
    }
    return body;
  }

  function tokenFor(k) {
    return "mock-" + k;
  }
  function setSession(k) {
    try {
      sessionStorage.setItem("dci-mock-key", k || "");
    } catch (e) {}
  }
  function clearSession() {
    try {
      sessionStorage.removeItem("dci-mock-key");
    } catch (e) {}
  }
  function currentKey() {
    try {
      var k = sessionStorage.getItem("dci-mock-key");
      if (k && USERS[k]) return k;
    } catch (e) {}
    return null;
  }
  function currentUser() {
    return getUser(currentKey());
  }

  if (typeof window.__DCI_CUSTOMER_URL__ === "undefined") {
    window.__DCI_CUSTOMER_URL__ = "http://localhost:3002";
  }

  function customerBase() {
    return String(window.__DCI_CUSTOMER_URL__ || "http://localhost:3002").replace(/\/$/, "");
  }

  /** Open tech workbench in the current tab, carrying the demo user */
  function openTechWorkbench() {
    var key = currentKey();
    var url = customerBase() + "/desk";
    if (key) {
      url += "?from=home&user=" + encodeURIComponent(key);
    }
    window.location.href = url;
  }

  /** Returning from customer: restore mock session, or log out, before the SPA boots */
  try {
    var inbound = new URLSearchParams(location.search);
    if (inbound.get("logout") === "1") {
      clearSession();
      document.cookie = "Admin-Token=; path=/; max-age=0";
      inbound.delete("logout");
      var logoutQs = inbound.toString();
      history.replaceState(
        null,
        "",
        location.pathname + (logoutQs ? "?" + logoutQs : "") + location.hash,
      );
    } else if (inbound.get("from") === "customer") {
      var inboundUser = String(inbound.get("user") || "").trim().toLowerCase();
      if (USERS[inboundUser]) {
        setSession(inboundUser);
        document.cookie =
          "Admin-Token=" + encodeURIComponent(tokenFor(inboundUser)) + "; path=/";
        inbound.delete("from");
        inbound.delete("user");
        var inboundQs = inbound.toString();
        history.replaceState(
          null,
          "",
          location.pathname + (inboundQs ? "?" + inboundQs : "") + location.hash,
        );
      }
    }
  } catch (err) {}

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
})();
