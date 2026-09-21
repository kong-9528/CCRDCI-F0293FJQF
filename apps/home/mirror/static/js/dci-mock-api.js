/**
 * Offline mock for ALL /api/v1/dciManage requests (XHR + fetch).
 * Loaded after dci-mock-auth.js; never falls through to the network.
 */
(function () {
  var API_PREFIX = "/api/v1/dciManage";
  var BUSINESS_INTERFACES = [{"id":"2080588010370920449","interfaceName":"实名同步修改接口","interfaceAddr":"/api/v1/dciManage/realName/modify","requestParams":"详见接口文档","responseParams":"详见接口文档","docFileName":"","docFileUrl":"","status":"1","remark":"","interfaceDesc":"用于修改权利人（含著作权人）的实名认证信息，包含权利人ID、权利人名称、证件有效起始期、证件有效终止期、手机号、联系人、证件图名称、证件图格式、身份证正面照文件路径、身份证反面照文件路径、手持身份证文件路径、证件图下载权限。"},{"id":"2080587923100037121","interfaceName":"实名信息接口","interfaceAddr":"/api/v1/dciManage/realName/verify","requestParams":"详见接口文档","responseParams":"详见接口文档","docFileName":"","docFileUrl":"","status":"1","remark":"","interfaceDesc":"权利人（含著作权人）的实名信息接口。"},{"id":"2070330053367017473","interfaceName":"数据同步接口","interfaceAddr":"/upload/api/v1","requestParams":"详见接口文档","responseParams":"详见接口文档","docFileName":"平台系统架构与功能设计-1.pdf","docFileUrl":"https://ccpc-tj-test-81c4927da51f1137b1cf0409ff4600791a-ossalias.oss-cn-wulanchabu.aliyuncs.com/dciManage%2FinterfaceDoc%2F20260626%2F2070330053367017473%2F2070330282266857472%2F%E5%B9%B3%E5%8F%B0%E7%B3%BB%E7%BB%9F%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%8A%9F%E8%83%BD%E8%AE%BE%E8%AE%A1-1.pdf","status":"1","remark":"","interfaceDesc":"向DCI管理中心同步DCI业务数据。"},{"id":"2055556104074723330","interfaceName":"DCI撤销接口","interfaceAddr":"/api/v1/dciManage/apply/revokeInfo2","requestParams":"详见接口文档","responseParams":"详见接口文档","docFileName":"DCI注册管理中心 - 接口调用手册V1.0 (5).pdf","docFileUrl":"https://ccpc-tj-test-81c4927da51f1137b1cf0409ff4600791a-ossalias.oss-cn-wulanchabu.aliyuncs.com/dciManage%2FinterfaceDoc%2F20260520%2F2055556104074723330%2F2056909982733754368%2FDCI%E6%B3%A8%E5%86%8C%E7%AE%A1%E7%90%86%E4%B8%AD%E5%BF%83%20-%20%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8%E6%89%8B%E5%86%8CV1.0%20%285%29.pdf","status":"1","remark":"","interfaceDesc":"申请撤销DCI码接口，完成DCI码撤销。"}];


  function ok(data, extra) {
    var body = { code: 200, msg: "操作成功", data: data === undefined ? null : data };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
      }
    }
    return body;
  }

  function fail(msg, code) {
    return { code: code || 500, msg: msg || "操作失败", data: null };
  }

  function page(rows, total) {
    return { code: 200, msg: "查询成功", rows: rows || [], total: total != null ? total : (rows || []).length };
  }

  function parseUrl(raw) {
    var s = String(raw || "");
    try {
      if (/^https?:\/\//i.test(s)) {
        var u = new URL(s);
        return { path: u.pathname, search: u.search, href: s };
      }
    } catch (e) {}
    var q = s.indexOf("?");
    return {
      path: q >= 0 ? s.slice(0, q) : s,
      search: q >= 0 ? s.slice(q) : "",
      href: s,
    };
  }

  function isDciApi(raw) {
    var p = parseUrl(raw).path;
    return p.indexOf(API_PREFIX) === 0 || p === API_PREFIX;
  }

  function apiPath(raw) {
    var p = parseUrl(raw).path;
    var i = p.indexOf(API_PREFIX);
    if (i < 0) return p;
    var rest = p.slice(i + API_PREFIX.length);
    if (!rest) return "/";
    return rest.charAt(0) === "/" ? rest : "/" + rest;
  }

  function queryObject(raw, bodyUrl) {
    var search = parseUrl(raw).search || "";
    // axios may fold params into url; also GET may pass "?" only on open url
    if ((!search || search === "?") && bodyUrl) {
      var q = String(bodyUrl).indexOf("?");
      if (q >= 0) search = String(bodyUrl).slice(q);
    }
    var out = {};
    if (search && search.charAt(0) === "?") {
      try {
        var sp = new URLSearchParams(search);
        sp.forEach(function (v, k) {
          out[k] = v;
        });
      } catch (e) {}
    }
    return out;
  }

  function parseBody(body) {
    if (body == null || body === "") return {};
    if (typeof body === "object" && !(body instanceof ArrayBuffer) && !(typeof FormData !== "undefined" && body instanceof FormData)) {
      return body;
    }
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      var o = {};
      try {
        body.forEach(function (v, k) {
          o[k] = v;
        });
      } catch (e) {}
      return o;
    }
    try {
      return JSON.parse(String(body));
    } catch (e) {
      return { _raw: String(body) };
    }
  }

  function mock() {
    return window.__DCI_MOCK__ || null;
  }

  function currentUser() {
    var M = mock();
    return M && M.currentUser ? M.currentUser() : null;
  }

  var APPORG_ROWS = [
    { id: 1, appOrgName: "版权云创作平台", appOrgCode: "APPLY-CCY-0001", appOrgStatus: "正常", createTime: "2025-11-08 09:20:11" },
    { id: 2, appOrgName: "华数数字版权中心", appOrgCode: "APPLY-WASU-0002", appOrgStatus: "正常", createTime: "2025-12-02 14:35:46" },
    { id: 3, appOrgName: "星图内容确权系统", appOrgCode: "APPLY-XT-0003", appOrgStatus: "停用", createTime: "2026-01-18 10:05:22" },
    { id: 4, appOrgName: "映像媒资管理平台", appOrgCode: "APPLY-YX-0004", appOrgStatus: "正常", createTime: "2026-02-26 16:48:03" },
  ];
  var APPORG_RECORDS = {
    1: [
      { appOrgName: "版权云创作平台", appOrgCode: "APPLY-CCY-0001", appOrgStatus: "正常", createBy: "mayi2", createTime: "2026-03-01 11:12:08" },
      { appOrgName: "版权云创作平台", appOrgCode: "APPLY-CCY-0001", appOrgStatus: "停用", createBy: "mayi", createTime: "2026-02-12 09:40:21" },
      { appOrgName: "版权云创作平台", appOrgCode: "APPLY-CCY-0001", appOrgStatus: "正常", createBy: "mayi", createTime: "2025-11-08 09:20:11" },
    ],
    2: [
      { appOrgName: "华数数字版权中心", appOrgCode: "APPLY-WASU-0002", appOrgStatus: "正常", createBy: "mayi2", createTime: "2025-12-02 14:35:46" },
    ],
    3: [
      { appOrgName: "星图内容确权系统", appOrgCode: "APPLY-XT-0003", appOrgStatus: "停用", createBy: "mayi2", createTime: "2026-03-10 15:22:40" },
      { appOrgName: "星图内容确权系统", appOrgCode: "APPLY-XT-0003", appOrgStatus: "正常", createBy: "mayi1", createTime: "2026-01-18 10:05:22" },
    ],
    4: [
      { appOrgName: "映像媒资管理平台", appOrgCode: "APPLY-YX-0004", appOrgStatus: "正常", createBy: "mayi2", createTime: "2026-02-26 16:48:03" },
    ],
  };
  var apporgSeq = 5;

  function nowStamp() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  function findAppOrg(id) {
    id = Number(id);
    for (var i = 0; i < APPORG_ROWS.length; i++) {
      if (Number(APPORG_ROWS[i].id) === id) return APPORG_ROWS[i];
    }
    return null;
  }

  function pushAppOrgRecord(row, status) {
    var key = String(row.id);
    if (!APPORG_RECORDS[key]) APPORG_RECORDS[key] = [];
    var u = currentUser();
    APPORG_RECORDS[key].unshift({
      appOrgName: row.appOrgName,
      appOrgCode: row.appOrgCode,
      appOrgStatus: status,
      createBy: (u && u.username) || "demo",
      createTime: nowStamp(),
    });
  }

  function statsPayload() {
    var dates = [];
    var now = new Date();
    for (var i = 29; i >= 0; i--) {
      var d = new Date(now.getTime() - i * 86400000);
      dates.push(
        String(d.getMonth() + 1).padStart(2, "0") +
          "/" +
          String(d.getDate()).padStart(2, "0"),
      );
    }
    function series(name, color, base) {
      var data = [];
      for (var i = 0; i < 30; i++) data.push(base + Math.floor(Math.random() * 8));
      return { name: name, color: color, data: data };
    }
    return {
      todayCount: 42,
      todayTrendRate: "12%",
      todayTrendType: "up",
      monthCount: 1280,
      monthTrendRate: "8%",
      monthTrendType: "up",
      totalCount: 15600,
      dates: dates,
      seriesList: [
        series("实名认证数据接口", "#165dff", 10),
        series("实名认证变更数据接口", "#d97706", 6),
        series("作品原始分配数据接口", "#1e40af", 8),
        series("撤销业务数据接口", "#38bdf8", 4),
      ],
    };
  }

  function handle(method, rawUrl, body) {
    var m = String(method || "GET").toUpperCase();
    var path = apiPath(rawUrl);
    var q = queryObject(rawUrl);
    // axios folds get params into url before send
    if (path.indexOf("?") >= 0) {
      var parts = path.split("?");
      path = parts[0];
      q = queryObject("?" + parts.slice(1).join("?"));
    }
    var data = parseBody(body);
    var M = mock();
    var user = currentUser();

    // —— auth ——
    if (path === "/login" && m === "POST") {
      var userName = data.username || data.userName || q.username;
      var password = data.password || q.password;
      var k = M && M.resolveLogin(userName, password);
      if (!k) return fail("账号或密码错误", 500);
      M.setSession(k);
      return ok({ token: M.tokenFor(k) });
    }
    if (path === "/smsLogin" && m === "POST") {
      var phone = data.phonenumber || data.phoneNumber || data.phone || q.phoneNumber;
      var code = data.smsCode || data.code || q.smsCode;
      var sk = M && M.resolveSms(phone, code);
      if (!sk) return fail("短信验证码不正确！", 500);
      M.setSession(sk);
      return ok({ token: M.tokenFor(sk) });
    }
    if (path === "/sendLoginSmsCode" && m === "POST") {
      return ok(true, { msg: "验证码已发送（演示码 123456）" });
    }
    if (path === "/logout" && m === "POST") {
      if (M) M.clearSession();
      return ok(null);
    }
    if (path === "/getInfo" && m === "GET") {
      var u =
        user ||
        (M && M.getUser(M.keyFromToken((data && data.token) || "")));
      if (!u && M) {
        try {
          var tok = document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]+)/);
          if (tok) u = M.getUser(M.keyFromToken(decodeURIComponent(tok[1])));
        } catch (e) {}
      }
      if (!u) return fail("无效的会话，或者会话已过期，请重新登录。", 401);
      var prof = M.profilePayload(u);
      return {
        code: 200,
        msg: "操作成功",
        user: prof.data.user,
        roles: prof.data.roles,
        permissions: prof.data.permissions,
      };
    }
    if (path === "/getRouters" && m === "GET") {
      return ok([]);
    }
    if (path === "/unlockscreen" && m === "POST") {
      return ok(null);
    }

    // —— register / password ——
    if (path === "/register" && m === "POST") {
      return ok(null, { msg: "注册成功（演示，未写入后端）" });
    }
    if (path === "/register/sendSmsCode" && m === "POST") {
      return ok(true, { msg: "验证码已发送（演示码 123456）" });
    }
    if (path === "/register/checkUsername" && m === "GET") {
      var un = String(q.username || q.userName || "").toLowerCase();
      if (M && M.USERS && M.USERS[un]) return fail("用户名已存在", 500);
      return ok(true);
    }
    if (path === "/register/checkPhone" && m === "GET") {
      var ph = String(q.phonenumber || q.phoneNumber || q.phone || "");
      var taken = false;
      if (M && M.USERS) {
        Object.keys(M.USERS).forEach(function (key) {
          if (M.USERS[key].phonenumber === ph) taken = true;
        });
      }
      if (taken) return fail("手机号已注册", 500);
      return ok(true);
    }
    if (path === "/register/contract/upload" && m === "POST") {
      return ok({ url: "/mock/contract.pdf", fileName: "contract.pdf" });
    }
    if (path === "/password/reset/sendSmsCode" && m === "POST") {
      return ok(true, { msg: "验证码已发送（演示码 123456）" });
    }
    if (path === "/password/reset" && m === "POST") {
      return ok(null, { msg: "密码重置成功（演示）" });
    }

    // —— profile ——
    if (path === "/system/user/profile" && m === "GET") {
      if (!user) return fail("未登录", 401);
      return M.profilePayload(user);
    }
    if (path === "/system/user/profile" && m === "PUT") {
      if (user && data) {
        if (data.nickName) user.nickName = data.nickName;
      }
      return ok(null, { msg: "保存成功（演示）" });
    }
    if (path === "/system/user/profile/updatePhone" && m === "PUT") {
      return ok(null, { msg: "手机号已更新（演示）" });
    }
    if (path === "/system/user/profile/sendPhoneSmsCode" && m === "POST") {
      return ok(true, { msg: "验证码已发送（演示码 123456）" });
    }
    if (path === "/system/user/profile/getRealPhone" && m === "GET") {
      return ok({ phonenumber: (user && user.phonenumber) || "13800000000" });
    }
    if (path === "/system/user/profile/updatePwd" && m === "PUT") {
      return ok(null, { msg: "密码修改成功（演示）" });
    }
    if (path === "/system/user/profile/avatar" && m === "POST") {
      return ok({ imgUrl: "" }, { msg: "上传成功（演示）" });
    }
    if (path === "/system/user/profile/cancelAccount" && m === "DELETE") {
      if (M) M.clearSession();
      return ok(null, { msg: "账号已注销（演示）" });
    }

    // —— org / apikey ——
    if (path.indexOf("/dci/regorg/infoByUserId/") === 0 && m === "GET") {
      var uid = path.split("/").pop();
      var ou =
        user ||
        (M && (M.getUser(M.keyFromToken(uid)) || M.getUser(String(uid).replace(/^mock-/, ""))));
      if (!ou && M && uid) {
        Object.keys(M.USERS || {}).forEach(function (key) {
          if (M.USERS[key].userId === uid) ou = M.USERS[key];
        });
      }
      if (!ou) {
        if (window.__DCI_RCX_DEMO__ && __DCI_RCX_DEMO__.shapeOrg) {
          return __DCI_RCX_DEMO__.shapeOrg({ code: 200, data: null });
        }
        return ok(null);
      }
      var body = M.orgPayload(ou);
      if (window.__DCI_RCX_DEMO__ && __DCI_RCX_DEMO__.shapeOrg) {
        return __DCI_RCX_DEMO__.shapeOrg(body);
      }
      return body;
    }
    if (path.indexOf("/dci/regorg/getRealPhone/") === 0) {
      return ok({ phonenumber: (user && user.phonenumber) || "13800000000" });
    }
    if (path === "/dci/regorg/apply" && m === "POST") {
      return ok(null, { msg: "申请已提交（演示）" });
    }
    if (path === "/dci/regorg/resubmit" && (m === "POST" || m === "PUT")) {
      return ok(null, { msg: "已重新提交（演示）" });
    }
    if (path.indexOf("/dci/regorg/revoke/") === 0) {
      return ok(null, { msg: "已撤销（演示）" });
    }
    if (path === "/dci/regorg/auditList" && m === "GET") {
      return page([]);
    }
    if (path === "/dci/regorg/updateApiKey" && m === "POST") {
      return ok(
        {
          accessKey: data.accessKey || "AKMOCKUPDATED000000000001",
          accessSecret: data.accessSecret || "SKMOCKUPDATED000000000001",
          dataEncrypKey: data.dataEncrypKey || "DEKMOCKUPDATED00000000001",
        },
        { msg: "API Key 已更新（演示）" },
      );
    }
    if (path === "/dci/orgtype/listAll" && m === "GET") {
      return ok([
        { id: 1, typeName: "企业", typeCode: "enterprise" },
        { id: 2, typeName: "个人", typeCode: "person" },
      ]);
    }

    // —— biz ——
    if (path === "/dci/bizConsult/sendSmsCode" && m === "POST") {
      return ok(true, { msg: "验证码已发送（演示码 123456）" });
    }
    if (path === "/dci/bizConsult/submit" && m === "POST") {
      return ok(null, { msg: "提交成功（演示）" });
    }
    if (path === "/dci/apporg/list" && m === "GET") {
      if (window.__DCI_RCX_DEMO__ && __DCI_RCX_DEMO__.allowAppOrg && !__DCI_RCX_DEMO__.allowAppOrg()) {
        return page([]);
      }
      return page(APPORG_ROWS.slice(), APPORG_ROWS.length);
    }
    if (path.indexOf("/dci/apporg/record/") === 0 && m === "GET") {
      var rid = String(path.split("/").pop());
      return ok((APPORG_RECORDS[rid] || []).slice());
    }
    if (path === "/dci/apporg" && m === "POST") {
      var created = {
        id: apporgSeq++,
        appOrgName: data.appOrgName || "未命名申领平台",
        appOrgCode: data.appOrgCode || "APPLY-NEW",
        appOrgStatus: "正常",
        createTime: nowStamp(),
      };
      APPORG_ROWS.unshift(created);
      pushAppOrgRecord(created, "正常");
      return ok(created, { msg: "创建成功（演示）" });
    }
    if (path === "/dci/apporg/changeStatus" && m === "PUT") {
      var rawId = data.id;
      var nextStatus = data.appOrgStatus;
      if (rawId && typeof rawId === "object") {
        nextStatus = nextStatus || rawId.appOrgStatus;
        rawId = rawId.id;
      }
      var target = findAppOrg(rawId);
      if (!target) return fail("申领平台不存在", 500);
      if (nextStatus !== "正常" && nextStatus !== "停用") {
        nextStatus = target.appOrgStatus === "正常" ? "停用" : "正常";
      }
      target.appOrgStatus = nextStatus;
      pushAppOrgRecord(target, nextStatus);
      return ok(Object.assign({}, target), { msg: "状态已更新（演示）" });
    }
    if (path === "/dci/applyDoc/listByDciCodeAndKeyword" && m === "GET") {
      return page([]);
    }
    if (path === "/businessInterface/listByIds" && m === "GET") {
      var ids = String((q && q.ids) || "")
        .split(",")
        .map(function (x) { return x.trim(); })
        .filter(Boolean);
      var list = BUSINESS_INTERFACES.filter(function (row) {
        return !ids.length || ids.indexOf(String(row.id)) >= 0;
      });
      return ok(list);
    }
    if (path === "/interfaceCall/statistics" && m === "GET") {
      return ok(statsPayload());
    }
    if (path.indexOf("/system/dict/data/type/") === 0 && m === "GET") {
      if (path.indexOf("rcx_type") >= 0 && window.__DCI_RCX_DEMO__ && __DCI_RCX_DEMO__.dict) {
        return ok(__DCI_RCX_DEMO__.dict());
      }
      return ok([]);
    }
    if (path.indexOf("/system/config/configKey/") === 0 && m === "GET") {
      return ok("");
    }

    // absolute-style paths sometimes requested without stripping (still under prefix)
    if (path === "/realName/verify" || path === "/realName/modify") {
      return ok({ status: "PASS", msg: "演示通过" });
    }
    if (path === "/apply/applyInfo" || path === "/apply/revokeInfo") {
      return ok({ status: "NONE" });
    }

    // default: succeed with empty data so UI does not hang on network errors
    if (m === "GET") {
      if (/list|page|query/i.test(path)) return page([]);
      return ok(null);
    }
    return ok(null, { msg: "操作成功（演示）" });
  }

  function respondXhr(xhr, payload) {
    var text = JSON.stringify(payload);
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      try {
        Object.defineProperty(xhr, "readyState", { configurable: true, get: function () { return 4; } });
      } catch (e) {
        try { xhr.readyState = 4; } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "status", { configurable: true, get: function () { return 200; } });
      } catch (e) {
        try { xhr.status = 200; } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "statusText", { configurable: true, get: function () { return "OK"; } });
      } catch (e) {}
      try {
        Object.defineProperty(xhr, "responseText", { configurable: true, get: function () { return text; } });
      } catch (e) {
        try { xhr.responseText = text; } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "response", { configurable: true, get: function () { return text; } });
      } catch (e) {
        try { xhr.response = text; } catch (e2) {}
      }
      xhr.getResponseHeader = function (name) {
        return String(name || "").toLowerCase() === "content-type" ? "application/json;charset=utf-8" : null;
      };
      xhr.getAllResponseHeaders = function () {
        return "content-type: application/json;charset=utf-8\r\n";
      };
      try {
        if (typeof xhr.onreadystatechange === "function") xhr.onreadystatechange();
      } catch (e) {}
      try {
        if (typeof xhr.onload === "function") xhr.onload();
      } catch (e) {}
      try {
        xhr.dispatchEvent(new Event("readystatechange"));
        xhr.dispatchEvent(new Event("load"));
        xhr.dispatchEvent(new Event("loadend"));
      } catch (e) {}
    }
    setTimeout(finish, 8);
  }

  // —— XHR hook ——
  var XO = XMLHttpRequest.prototype.open;
  var XS = XMLHttpRequest.prototype.send;
  var XH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__dciMockMethod = method;
    this.__dciMockUrl = String(url || "");
    this.__dciMock = isDciApi(this.__dciMockUrl);
    if (this.__dciMock) {
      this.__dciMockHeaders = {};
      try {
        Object.defineProperty(this, "readyState", { configurable: true, writable: true, value: 1 });
      } catch (e) {}
      return;
    }
    return XO.apply(this, arguments);
  };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    if (this.__dciMock) {
      this.__dciMockHeaders[k] = v;
      return;
    }
    return XH.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (this.__dciMock) {
      var payload = handle(this.__dciMockMethod, this.__dciMockUrl, body);
      respondXhr(this, payload);
      return;
    }
    return XS.apply(this, arguments);
  };

  // —— fetch hook ——
  if (typeof window.fetch === "function") {
    var realFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : input && input.url;
      if (!isDciApi(url)) return realFetch(input, init);
      var method = (init && init.method) || (input && input.method) || "GET";
      var body = init && init.body;
      var payload = handle(method, url, body);
      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );
    };
  }

  window.__DCI_MOCK_API__ = {
    handle: handle,
    isDciApi: isDciApi,
    enabled: true,
  };
})();
