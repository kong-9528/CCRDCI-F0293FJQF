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

  /**
   * Formal default apply-form seed per demo account (注册中心 / 技术服务中心共用基础信息).
   */
  function getApplySeed(u) {
    u = u || {};
    var name = String(u.username || u.userName || "").toLowerCase();
    var table = {
      yachang: {
        orgName: "深圳市雅昌艺术网股份有限公司",
        orgNamePy: "yachangyishuwang",
        creditCode: "91440300724726181Q",
        orgAddress: "广东省深圳市南山区深云路19号雅昌艺术中心",
        invitationCode: "DCI-YC-2026A",
        techInvitationCode: "TECH-YC-2026A",
        orgTypeCode: "NRPT",
        orgTypeName: "内容平台",
        cooperationField:
          "艺术品数字版权确权、展览及出版物内容核验、DCI码申领与同步",
        techCooperationField:
          "艺术品数字版权确权、展览内容核验与技术服务对接",
        contractStartDate: "2026-01-01",
        contractEndDate: "2027-12-31",
        linkName: "王敏",
        linkPhone: "13900001111",
        contractFileName: "雅昌艺术网-DCI注册中心服务合同.pdf",
        techContractFileName: "雅昌艺术网-技术服务中心开通申请合同.pdf",
      },
      mayi: {
        orgName: "蚂蚁科技集团股份有限公司",
        orgNamePy: "mayikeji",
        creditCode: "913301067046373179",
        orgAddress:
          "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
        invitationCode: "DCI-ANT-2026A",
        techInvitationCode: "TECH-ANT-2026A",
        orgTypeCode: "ZYFW",
        orgTypeName: "专业服务",
        cooperationField: "数字版权确权、DCI码申领与同步、作品监测服务",
        techCooperationField: "数字版权确权、DCI码申领与技术服务中心对接",
        contractStartDate: "2026-01-01",
        contractEndDate: "2027-12-31",
        linkName: "张伟",
        linkPhone: "13800008000",
        contractFileName: "蚂蚁科技-DCI注册中心服务合同.pdf",
        techContractFileName: "蚂蚁科技-技术服务中心开通申请合同.pdf",
      },
      mayi1: {
        orgName: "蚂蚁科技集团股份有限公司",
        orgNamePy: "mayikeji",
        creditCode: "913301067046373179",
        orgAddress:
          "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
        invitationCode: "DCI-ANT-2026B",
        techInvitationCode: "TECH-ANT-2026B",
        orgTypeCode: "ZYFW",
        orgTypeName: "专业服务",
        cooperationField: "数字版权确权、内容合规核验、DCI码申领与同步",
        techCooperationField: "内容合规核验、DCI码申领与技术服务中心对接",
        contractStartDate: "2026-03-01",
        contractEndDate: "2028-02-28",
        linkName: "李娜",
        linkPhone: "13800008001",
        contractFileName: "蚂蚁科技-DCI注册中心服务合同-mayi1.pdf",
        techContractFileName: "蚂蚁科技-技术服务中心开通申请合同-mayi1.pdf",
      },
      mayi2: {
        orgName: "蚂蚁科技集团股份有限公司",
        orgNamePy: "mayikeji",
        creditCode: "913301067046373179",
        orgAddress:
          "浙江省杭州市西湖区西溪路543号-569号（单号连续）1幢2号楼5层517室",
        invitationCode: "DCI-ANT-2026C",
        techInvitationCode: "TECH-ANT-2026C",
        orgTypeCode: "ZYFW",
        orgTypeName: "专业服务",
        cooperationField: "数字版权确权、DCI码申领与同步、登记数据接口对接",
        techCooperationField: "登记数据接口对接、DCI码申领与技术服务中心运维",
        contractStartDate: "2026-01-15",
        contractEndDate: "2027-12-31",
        linkName: "王强",
        linkPhone: "13800008002",
        contractFileName: "蚂蚁科技-DCI注册中心服务合同-mayi2.pdf",
        techContractFileName: "蚂蚁科技-技术服务中心开通申请合同-mayi2.pdf",
      },
    };
    var s = table[name] || table.mayi;
    return Object.assign({}, s, {
      orgName: s.orgName || u.orgName || "",
      orgNamePy: s.orgNamePy || u.orgNamePy || "",
      creditCode: s.creditCode || u.creditCode || "",
      orgAddress: s.orgAddress || u.orgAddress || "",
      orgTypeCode: s.orgTypeCode || u.orgTypeCode || "",
      orgTypeName: s.orgTypeName || u.orgTypeName || "",
      linkPhone: s.linkPhone || u.phonenumber || "",
    });
  }

  function applySeedAsOrgData(u, extras) {
    var seed = getApplySeed(u);
    var fileName = seed.contractFileName || "DCI注册中心服务合同.pdf";
    var fileUrl = "/demo/" + encodeURIComponent(fileName);
    return Object.assign(
      {
        id: u.userId,
        orgName: seed.orgName,
        regOrgName: seed.orgName,
        orgNamePy: seed.orgNamePy,
        regOrgNamePy: seed.orgNamePy,
        creditCode: seed.creditCode,
        orgAddress: seed.orgAddress,
        regOrgAddress: seed.orgAddress,
        invitationCode: seed.invitationCode,
        orgTypeCode: seed.orgTypeCode,
        regOrgType: seed.orgTypeCode,
        orgTypeName: seed.orgTypeName,
        cooperationField: seed.cooperationField,
        contractStartDate: seed.contractStartDate,
        contractEndDate: seed.contractEndDate,
        linkName: seed.linkName,
        linkPhone: seed.linkPhone,
        contractFileList: [
          { name: fileName, url: fileUrl, size: "1.12 MB" },
        ],
        contractFiles: fileUrl,
      },
      extras || {},
    );
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
      // 账号中心开通申请：未开通时也返回可编辑的正式 mock 草稿
      body = {
        code: 200,
        data: applySeedAsOrgData(u, { auditStatus: -1, changeStatus: "0" }),
      };
    } else {
      var code =
        u.username === "mayi" || u.username === "mayi2"
          ? "ANT"
          : "ORG-" + String(u.username || "demo").toUpperCase();
      var seed = getApplySeed(u);
      body = {
        code: 200,
        data: Object.assign(applySeedAsOrgData(u), {
          id: u.userId,
          auditStatus: u.auditStatus,
          orgCode: code,
          dciRegOrgCode: code,
          dciCodeType: "原始分配,授权分配,其他",
          dciDataInterface:
            "实名信息接口,实名信息修改接口,DCI申领数据同步接口,DCI撤销数据同步接口",
          accessKey: "AK" + String(u.username || "demo").toUpperCase() + "MOCK000000000001",
          accessSecret: "SK" + String(u.username || "demo").toUpperCase() + "MOCKSECRET00000001",
          dataEncrypKey: "DEK" + String(u.username || "demo").toUpperCase() + "MOCK000000001",
          invitationCode: seed.invitationCode,
        }),
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
    getApplySeed: getApplySeed,
    applySeedAsOrgData: applySeedAsOrgData,
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
