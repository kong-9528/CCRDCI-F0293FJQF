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
      orgName: "",
    },
    mayi: {
      userId: "mock-mayi",
      username: "mayi",
      nickName: "mayi",
      phonenumber: "13800008000",
      auditStatus: 1,
      techStatus: null,
      orgName: "太极计算机股份有限公司",
    },
    mayi1: {
      userId: "mock-mayi1",
      username: "mayi1",
      nickName: "mayi1",
      phonenumber: "13800008001",
      auditStatus: null,
      techStatus: 1,
      orgName: "太极计算机股份有限公司",
    },
    mayi2: {
      userId: "mock-mayi2",
      username: "mayi2",
      nickName: "mayi2",
      phonenumber: "13800008002",
      auditStatus: 1,
      techStatus: 1,
      orgName: "太极计算机股份有限公司",
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
    return key && USERS[key] ? USERS[key] : null;
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
  function openedLabel(u) {
    var r = u.auditStatus === 1;
    var t = u.techStatus === 1;
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
    if (u.auditStatus === null || u.auditStatus === undefined) {
      return { code: 200, data: null };
    }
    return {
      code: 200,
      data: {
        auditStatus: u.auditStatus,
        orgName: u.orgName,
        regOrgName: u.orgName,
      },
    };
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
