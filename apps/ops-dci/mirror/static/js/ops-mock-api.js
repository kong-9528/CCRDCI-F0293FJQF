/**
 * Offline mock for ALL /api/v1/dciManage requests in ops-dci mirror.
 * Uses captured payloads in window.__OPS_MOCK_STORE__ when present.
 */
(function () {
  var API_PREFIX = "/api/v1/dciManage";
  var USER = "root";

  function ok(data, extra) {
    var body = { code: 200, msg: "操作成功", data: data === undefined ? null : data };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
      }
    }
    return body;
  }

  function page(rows, total) {
    return {
      code: 200,
      msg: "查询成功",
      rows: rows || [],
      total: total != null ? total : (rows || []).length,
    };
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

  function apiPath(raw) {
    var p = parseUrl(raw).path;
    var i = p.indexOf(API_PREFIX);
    if (i >= 0) return p.slice(i + API_PREFIX.length) || "/";
    return p;
  }

  function isDciApi(raw) {
    var s = String(raw || "");
    // Intercept every backend call so nothing hits the network.
    return (
      s.indexOf(API_PREFIX) >= 0 ||
      s.indexOf("/api/v1/dciManage") >= 0 ||
      s.indexOf("/api/") >= 0
    );
  }

  function lookup(method, rawUrl) {
    var store = window.__OPS_MOCK_STORE__ || {};
    var parsed = parseUrl(rawUrl);
    var p = apiPath(rawUrl);
    var m = String(method || "GET").toUpperCase();
    var fullPath = API_PREFIX + (p.charAt(0) === "/" ? p : "/" + p);
    var keys = [
      m + " " + fullPath + parsed.search,
      m + " " + fullPath,
      m + " " + p + parsed.search,
      m + " " + p,
    ];
    for (var i = 0; i < keys.length; i++) {
      if (Object.prototype.hasOwnProperty.call(store, keys[i])) return store[keys[i]];
    }
    return null;
  }

  function parseBody(body) {
    if (body == null || body === "") return {};
    if (typeof body === "object") return body;
    try {
      return JSON.parse(String(body));
    } catch (e) {
      return {};
    }
  }

  function ok100(data, extra) {
    var body = {
      code: 1000000,
      msg: "成功",
      data: data === undefined ? null : data,
      success: true,
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
      }
    }
    return body;
  }

  function isSuccessBody(body) {
    if (!body || typeof body !== "object") return false;
    if (body.success === false) return false;
    var c = body.code;
    return c === 200 || c === 1000000 || c === 1e6;
  }

  var TREND_DEMO = {
    timeList: ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"],
    seriesList: [
      { name: "申领", data: [12, 18, 15, 22, 19, 25], color: "#0075c1" },
      { name: "撤销", data: [2, 1, 3, 2, 1, 2], color: "#e86452" },
    ],
  };
  var PIE_DEMO = [
    { code: "A", name: "作品", count: 120 },
    { code: "B", name: "软件", count: 45 },
    { code: "C", name: "数据", count: 30 },
  ];
  var TOP_DEMO = [
    { name: "演示平台甲", count: 86 },
    { name: "演示平台乙", count: 64 },
    { name: "演示平台丙", count: 41 },
    { name: "演示平台丁", count: 28 },
    { name: "演示平台戊", count: 15 },
  ];
  var APPLY_REVOKE_DEMO = [
    { name: "DCI编码申领总数", count: 1280 },
    { name: "DCI编码撤销总数", count: 36 },
  ];
  var RELATED_DEMO = {
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
  };

  function placeholderFor(path) {
    if (/queryStatByTimeType|queryContractFilingTrend/.test(path)) {
      return ok100(TREND_DEMO);
    }
    if (/queryApplyAndRevoke/.test(path)) {
      return ok100(APPLY_REVOKE_DEMO);
    }
    if (
      /queryDciCodeType|queryFileType|queryArea|queryBusinessType|queryRegisterOrgType/.test(
        path,
      )
    ) {
      return ok100(PIE_DEMO);
    }
    if (/queryRightOwnerType|queryOwnerType|queryOwnerTypeGroup/.test(path)) {
      return ok100([
        { name: "个人", count: 56 },
        { name: "机构", count: 34 },
      ]);
    }
    if (/Top10|top10/.test(path)) {
      return ok100(TOP_DEMO);
    }
    if (/queryApplyAndRegisterCount/.test(path)) {
      return ok100(RELATED_DEMO);
    }
    if (/list|page|query|Tree/i.test(path)) {
      return {
        code: 1000000,
        msg: "成功",
        rows: [],
        total: 0,
        data: [],
        success: true,
      };
    }
    return ok100(null);
  }

  function sanitizeGetInfo(body) {
    if (!body || typeof body !== "object") return body;
    var clone = JSON.parse(JSON.stringify(body));
    if (!clone.data || typeof clone.data !== "object") {
      clone.data = {};
    }
    clone.data.isPasswordExpired = false;
    clone.data.isDefaultModifyPwd = false;
    // Ensure shape Vue getInfo expects (avoids boot → logOut → /login race)
    if (!clone.data.user || typeof clone.data.user !== "object") {
      clone.data.user = {
        userId: "1",
        username: USER,
        userName: USER,
        nickName: "管理员",
        avatar: "",
        userType: "0",
      };
    } else {
      if (!clone.data.user.username && !clone.data.user.userName) {
        clone.data.user.username = USER;
      }
      if (clone.data.user.avatar == null) clone.data.user.avatar = "";
    }
    if (!Array.isArray(clone.data.roles) || !clone.data.roles.length) {
      clone.data.roles = ["sys"];
    }
    if (!Array.isArray(clone.data.permissions)) {
      clone.data.permissions = ["*:*:*"];
    }
    return clone;
  }

  function stripUserRoleMenus(body) {
    if (!body || typeof body !== "object" || !Array.isArray(body.data)) return body;
    var clone = JSON.parse(JSON.stringify(body));
    function filterNodes(nodes) {
      return (nodes || [])
        .filter(function (n) {
          var p = String(n.path || "");
          var name = String(n.name || "");
          if (p === "user" || p === "role") return false;
          if (name === "User" || name === "Role") return false;
          return true;
        })
        .map(function (n) {
          if (n.children) n.children = filterNodes(n.children);
          return n;
        });
    }
    function reorderSystemChildren(children) {
      var desired = ["invitationCode", "busPort", "log"];
      var result = [];
      var used = [];
      for (var i = 0; i < desired.length; i += 1) {
        var p = desired[i];
        var found = children.find(function (c) {
          return String(c.path) === p || String(c.name).toLowerCase() === p.toLowerCase();
        });
        if (found) {
          result.push(found);
          used.push(found);
        }
      }
      for (var j = 0; j < children.length; j += 1) {
        if (used.indexOf(children[j]) < 0) result.push(children[j]);
      }
      return result;
    }
    function reorderTop(nodes) {
      var list = (nodes || []).slice();
      var sysIdx = -1;
      for (var i = 0; i < list.length; i += 1) {
        if (list[i].path === "/system" || list[i].name === "System") {
          sysIdx = i;
          break;
        }
      }
      if (sysIdx >= 0) {
        var sys = list.splice(sysIdx, 1)[0];
        if (Array.isArray(sys.children)) {
          sys.children = reorderSystemChildren(sys.children);
        }
        list.push(sys);
      }
      return list;
    }
    clone.data = reorderTop(filterNodes(clone.data));
    function renameMenus(nodes) {
      return (nodes || []).map(function (n) {
        var next = Object.assign({}, n);
        if (n.meta) {
          next.meta = Object.assign({}, n.meta);
          if (next.meta.title === "注册中心管理") next.meta.title = "机构管理";
          var name = String(n.name || "");
          var p = String(n.path || "");
          if (
            name === "Pending" ||
            name === "My" ||
            name === "All" ||
            p === "pending" ||
            p === "my" ||
            p === "all"
          ) {
            next.meta.noCache = true;
          }
        }
        if (n.children) next.children = renameMenus(n.children);
        return next;
      });
    }
    clone.data = renameMenus(clone.data);
    return clone;
  }

  function findRegOrgById(id) {
    var store = window.__OPS_MOCK_STORE__ || {};
    var sid = String(id);
    for (var key in store) {
      if (!Object.prototype.hasOwnProperty.call(store, key)) continue;
      if (key.indexOf("regorg") < 0) continue;
      var body = store[key];
      var rows = (body && (body.rows || body.data)) || [];
      if (!Array.isArray(rows)) continue;
      for (var i = 0; i < rows.length; i += 1) {
        if (String(rows[i].id) === sid) {
          return JSON.parse(JSON.stringify(rows[i]));
        }
      }
    }
    return null;
  }

  function mockRegOrgVo(id) {
    var row = findRegOrgById(id);
    if (row) return row;
    return {
      id: String(id || "demo"),
      orgName: "演示机构",
      orgTypeCode: "NRPT",
      orgTypeName: "内容平台",
      orgCode: "DEM",
      creditCode: "91110000MA01234567",
      accessKey: "demo-ak",
      accessSecret: "demo-sk",
      dataEncrypKey: "demo-dek",
      apiPermissions:
        '[{"interfaceId":"2080587923100037121","startDate":"2026-01-01"},{"interfaceId":"2080588010370920449","startDate":"2026-01-01"},{"interfaceId":"2080588682629771266","startDate":"2026-01-01"},{"interfaceId":"2080588786392657922","startDate":"2026-01-01"}]',
      status: "0",
      auditStatus: "1",
      contractStartDate: "2026-01-01 00:00:00",
      contractEndDate: "2027-12-31 00:00:00",
      contactPerson: "演示联系人",
      contactPhone: "13800138000",
      contactEmail: "demo@example.com",
      orgNamePy: "ysjg",
      orgAddress: "北京市朝阳区演示路 1 号",
      cooperationField: "版权服务",
      contractFiles: null,
      linkName: "演示联系人",
      linkPhone: "13800138000",
      linkEmail: "demo@example.com",
      loginUsername: "demoorg",
      loginPhone: "13800138000",
      rcxType: "R",
      invitationCode: "DEMOCODE",
      changeStatus: "0",
      auditType: "1",
    };
  }

  function handle(method, rawUrl, body) {
    var m = String(method || "GET").toUpperCase();
    var path = apiPath(rawUrl);
    var data = parseBody(body);

    // 机构配置详情：本地 mock，不走真实接口
    var voMatch = path.match(/^\/dci\/regorg\/([^/]+)\/vo$/);
    if (m === "GET" && voMatch) {
      return ok(mockRegOrgVo(decodeURIComponent(voMatch[1])));
    }
    var detailMatch = path.match(/^\/dci\/regorg\/(\d+)$/);
    if (m === "GET" && detailMatch) {
      return ok(mockRegOrgVo(detailMatch[1]));
    }
    if (m === "PUT" && path === "/dci/regorg/editDciRegOrg") {
      try {
        var store = window.__OPS_MOCK_STORE__ || {};
        var sid = data && data.id != null ? String(data.id) : "";
        if (sid) {
          for (var key in store) {
            if (!Object.prototype.hasOwnProperty.call(store, key)) continue;
            if (key.indexOf("regorg") < 0) continue;
            var body = store[key];
            var rows = (body && (body.rows || body.data)) || [];
            if (!Array.isArray(rows)) continue;
            for (var i = 0; i < rows.length; i += 1) {
              if (String(rows[i].id) === sid) {
                for (var f in data) {
                  if (Object.prototype.hasOwnProperty.call(data, f) && f !== "params") {
                    rows[i][f] = data[f];
                  }
                }
              }
            }
          }
        }
      } catch (e) {}
      return ok(null);
    }
    if (m === "GET" && path === "/dci/regorg/getRegOrgAccessInfo") {
      return ok({
        accessSecret: "mock-sk-" + Date.now().toString(36),
        dataEncrypKey: "mock-dek-" + Date.now().toString(36),
      });
    }

    if (path === "/captchaImage" && m === "GET") {
      // UI reads res.data.captchaEnabled / res.data.img (RuoYi-style nested data)
      return {
        code: 200,
        msg: "操作成功",
        data: {
          captchaEnabled: false,
          uuid: "mock-captcha-uuid",
          img: "",
        },
        captchaEnabled: false,
        uuid: "mock-captcha-uuid",
        img: "",
      };
    }

    if (path === "/login" && m === "POST") {
      var username = String(data.username || "").trim().toLowerCase();
      // Password is RSA-encrypted by the login page; accept any non-empty for root.
      if (username === USER && String(data.password || "").length > 0) {
        try {
          sessionStorage.setItem("ops-dci-mock-user", USER);
          document.cookie = "Admin-Token=mock-root; path=/";
        } catch (e) {}
        return {
          code: 1000000,
          msg: "成功",
          data: { token: "mock-root" },
          success: true,
        };
      }
      return { code: 500, msg: "用户名或密码错误（演示账号 root）", data: null };
    }

    if (path === "/logout" && (m === "POST" || m === "GET")) {
      var sessionAge = 0;
      try {
        var raw = sessionStorage.getItem("ops-dci-sso-session");
        var parsed = raw ? JSON.parse(raw) : null;
        if (parsed && parsed.at) sessionAge = Date.now() - Number(parsed.at);
      } catch (e) {}
      try {
        sessionStorage.removeItem("ops-dci-mock-user");
        sessionStorage.removeItem("ops-dci-sso-session");
        sessionStorage.removeItem("ops-dci-from-sso");
        document.cookie = "Admin-Token=; path=/; Max-Age=0";
        document.cookie = "Admin-Token=; path=/; Max-Age=0; SameSite=Lax";
      } catch (e2) {}
      // Only bounce to SSO on intentional logout (session lived >3s).
      // Boot-time getInfo/logOut failures must NOT redirect — that loops with SSO auto-return.
      // Never force SSO on cold open of localhost:3030 (local /login must remain usable).
      if (sessionAge > 3000) {
        setTimeout(function () {
          if (window.__OPS_DCI_SSO__ && typeof window.__OPS_DCI_SSO__.goSso === "function") {
            window.__OPS_DCI_SSO__.goSso();
            return;
          }
          var sso =
            (typeof window.__OPS_DCI_SSO_URL__ === "string" && window.__OPS_DCI_SSO_URL__) ||
            "http://localhost:3003";
          location.replace(
            sso.replace(/\/$/, "") +
              "/login?return_url=" +
              encodeURIComponent(location.origin + "/"),
          );
        }, 30);
      }
      return ok100(null);
    }

    var hit = lookup(m, rawUrl);
    if (hit != null) {
      if (path === "/getInfo") return sanitizeGetInfo(hit);
      if (path === "/getRouters") return stripUserRoleMenus(hit);
      if (!isSuccessBody(hit)) return placeholderFor(path);
      return hit;
    }

    // Never fall through to network; always return a successful mock body.
    return placeholderFor(path);
  }

  function respondXhr(xhr, payload) {
    var text = JSON.stringify(payload);
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      try {
        Object.defineProperty(xhr, "readyState", {
          configurable: true,
          get: function () {
            return 4;
          },
        });
      } catch (e) {
        try {
          xhr.readyState = 4;
        } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "status", {
          configurable: true,
          get: function () {
            return 200;
          },
        });
      } catch (e) {
        try {
          xhr.status = 200;
        } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "statusText", {
          configurable: true,
          get: function () {
            return "OK";
          },
        });
      } catch (e) {}
      try {
        Object.defineProperty(xhr, "responseText", {
          configurable: true,
          get: function () {
            return text;
          },
        });
      } catch (e) {
        try {
          xhr.responseText = text;
        } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "response", {
          configurable: true,
          get: function () {
            return text;
          },
        });
      } catch (e) {
        try {
          xhr.response = text;
        } catch (e2) {}
      }
      xhr.getResponseHeader = function (name) {
        return String(name || "").toLowerCase() === "content-type"
          ? "application/json;charset=utf-8"
          : null;
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

  var XO = XMLHttpRequest.prototype.open;
  var XS = XMLHttpRequest.prototype.send;
  var XH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__opsMockMethod = method;
    this.__opsMockUrl = String(url || "");
    this.__opsMock = isDciApi(this.__opsMockUrl);
    if (this.__opsMock) {
      this.__opsMockHeaders = {};
      try {
        Object.defineProperty(this, "readyState", {
          configurable: true,
          writable: true,
          value: 1,
        });
      } catch (e) {}
      return;
    }
    return XO.apply(this, arguments);
  };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    if (this.__opsMock) {
      this.__opsMockHeaders[k] = v;
      return;
    }
    return XH.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (this.__opsMock) {
      respondXhr(this, handle(this.__opsMockMethod, this.__opsMockUrl, body));
      return;
    }
    return XS.apply(this, arguments);
  };

  if (typeof window.fetch === "function") {
    var realFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : input && input.url;
      if (!isDciApi(url)) return realFetch(input, init);
      var method = (init && init.method) || (input && input.method) || "GET";
      var b = init && init.body;
      return Promise.resolve(
        new Response(JSON.stringify(handle(method, url, b)), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );
    };
  }

  window.__OPS_DCI_MOCK__ = { handle: handle, enabled: true };
})();
