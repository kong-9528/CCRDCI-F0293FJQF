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
    // DCI 码路径含冒号，兼容 encode / decode 两种 key
    try {
      var decFull = decodeURIComponent(fullPath);
      var decP = decodeURIComponent(p);
      if (decFull !== fullPath) {
        keys.push(m + " " + decFull + parsed.search, m + " " + decFull);
      }
      if (decP !== p) {
        keys.push(m + " " + decP + parsed.search, m + " " + decP);
      }
      var encFull = fullPath.replace(/DCI:/g, "DCI%3A");
      if (encFull !== fullPath) {
        keys.push(m + " " + encFull + parsed.search, m + " " + encFull);
      }
    } catch (e) {}
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

  function parsedSearchParam(rawUrl, name) {
    try {
      var search = parseUrl(rawUrl).search || "";
      if (!search) return "";
      var sp = new URLSearchParams(search.charAt(0) === "?" ? search.slice(1) : search);
      return sp.get(name) || "";
    } catch (e) {
      return "";
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

  var TREND_DEMO_MONTH = {
    timeList: ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"],
    seriesList: [
      { name: "申领", data: [12, 18, 15, 22, 19, 25], color: "#0075c1" },
      { name: "撤销", data: [2, 1, 3, 2, 1, 2], color: "#e86452" },
    ],
  };
  var TREND_DEMO_YEAR = {
    timeList: ["2022", "2023", "2024", "2025", "2026"],
    seriesList: [
      { name: "申领", data: [86, 112, 148, 190, 111], color: "#0075c1" },
      { name: "撤销", data: [8, 11, 14, 18, 11], color: "#e86452" },
    ],
  };
  function trendDemoFor(dateType) {
    return dateType === "year" ? TREND_DEMO_YEAR : TREND_DEMO_MONTH;
  }
  var WORK_TYPE_DEMO = [
    { code: "TEXT", name: "文字作品", count: 186 },
    { code: "MUSIC", name: "音乐作品", count: 142 },
    { code: "PHOTO", name: "摄影作品", count: 168 },
    { code: "ART", name: "美术作品", count: 124 },
    { code: "AV", name: "影视作品", count: 96 },
    { code: "SOFT", name: "软件作品", count: 88 },
    { code: "DATASET", name: "数据集", count: 54 },
    { code: "OTHER", name: "其他作品", count: 37 },
  ];
  var CODE_TYPE_DEMO = [
    { code: "ORIGIN", name: "原始分配", count: 168 },
    { code: "AUTH", name: "授权分配", count: 92 },
    { code: "OTHER", name: "其他", count: 24 },
  ];
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

  function placeholderFor(path, reqData) {
    if (/queryStatByTimeType|queryContractFilingTrend/.test(path)) {
      return ok100(trendDemoFor(reqData && reqData.dateType));
    }
    if (/queryApplyAndRevoke/.test(path)) {
      return ok100(APPLY_REVOKE_DEMO);
    }
    if (/queryFileType/.test(path)) {
      return ok100(WORK_TYPE_DEMO);
    }
    if (/queryDciCodeType/.test(path)) {
      return ok100(CODE_TYPE_DEMO);
    }
    if (/queryArea|queryBusinessType|queryRegisterOrgType/.test(path)) {
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
      // 顶层：注册中心 → DCI码管理 → DCI发码统计 → 其余 → 系统管理置底
      var picked = [];
      var rest = [];
      var sys = null;
      for (var i = 0; i < list.length; i += 1) {
        var n = list[i];
        var p = String(n.path || "");
        var title = (n.meta && n.meta.title) || "";
        if (p === "/system" || n.name === "System") {
          sys = n;
          continue;
        }
        if (p === "/dciCodeManage" || title === "DCI码管理") {
          picked[0] = n;
          continue;
        }
        if (p === "/dci/stat" || title === "DCI发码统计") {
          picked[1] = n;
          continue;
        }
        rest.push(n);
      }
      var lead = [];
      var afterLead = [];
      for (var r = 0; r < rest.length; r += 1) {
        var rp = String(rest[r].path || "");
        var rt = (rest[r].meta && rest[r].meta.title) || "";
        if (
          rp === "/registrOrg" ||
          rt === "DCI注册中心管理" ||
          rt === "注册中心管理" ||
          rt === "机构管理"
        ) {
          lead.push(rest[r]);
        } else {
          afterLead.push(rest[r]);
        }
      }
      var ordered = lead.concat(picked.filter(Boolean)).concat(afterLead);
      if (sys) {
        if (Array.isArray(sys.children)) {
          sys.children = reorderSystemChildren(sys.children);
        }
        ordered.push(sys);
      }
      return ordered;
    }
    clone.data = reorderTop(filterNodes(clone.data));
    function renameMenus(nodes) {
      return (nodes || []).map(function (n) {
        var next = Object.assign({}, n);
        if (n.meta) {
          next.meta = Object.assign({}, n.meta);
          if (next.meta.title === "注册中心管理") next.meta.title = "DCI注册中心管理";
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


  var CATEGORY_LABEL = {100:"文字作品",110:"音乐作品",120:"戏剧作品",130:"曲艺作品",140:"舞蹈作品",150:"美术作品",160:"摄影作品",170:"电影作品",180:"视听作品",190:"工程设计图/产品设计图",200:"地图/示意图",210:"其他作品",220:"口述作品",230:"杂技艺术",240:"建筑作品",250:"模型作品",260:"录音制品",270:"录像制品",280:"软件",290:"汇编作品（数据集）"};
  var STATUS_LABEL = {0:"申领",1:"撤销"};

  function parseFormBody(body) {
    if (body == null || body === "") return {};
    if (typeof body === "object" && typeof body !== "string") return body;
    var s = String(body);
    if (s.charAt(0) === "{") {
      try { return JSON.parse(s); } catch (e) { return {}; }
    }
    var out = {};
    try {
      var sp = new URLSearchParams(s);
      sp.forEach(function (v, k) { out[k] = v; });
    } catch (e) {}
    return out;
  }

  function csvEscape(v) {
    var t = v == null ? "" : String(v);
    if (/[",\n\r]/.test(t)) return '"' + t.replace(/"/g, '""') + '"';
    return t;
  }

  function mockApplyDocExport(rawUrl, body) {
    var params = parseFormBody(body);
    var caseType = params.caseType || "opus";
    var store = window.__OPS_MOCK_STORE__ || {};
    var listBody = store["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
    var allRows =
      (listBody && listBody.data && listBody.data.rows) ||
      (listBody && listBody.rows) ||
      [];
    var rows = (allRows || []).filter(function (r) {
      if (!caseType) return true;
      var t = r.caseType || r.case_type;
      return !t || String(t) === String(caseType);
    });
    // mock 库可能缺某 caseType 样例；列表页仍会展示 cursorList 全量，导出与可见列表对齐
    if (!rows.length) rows = allRows || [];
    var headers;
    var mapRow;
    if (caseType === "soft") {
      headers = ["序号","DCI码","软件名称","著作权人","DCI注册中心","DCI申领平台","DCI分配时间","状态"];
      mapRow = function (r, i) {
        return [i+1, r.dciCode, r.caseName, r.ownerName, r.registerName, r.applyOrgName, r.dciApplyTime || r.dciApplyTimeStr || "", STATUS_LABEL[r.dciStatus] != null ? STATUS_LABEL[r.dciStatus] : (r.dciStatus == null ? "-" : r.dciStatus)];
      };
    } else if (caseType === "dataset") {
      headers = ["序号","DCI码","数据集名称","著作权人","DCI注册中心","DCI申领平台","DCI分配时间","状态"];
      mapRow = function (r, i) {
        return [i+1, r.dciCode, r.caseName, r.ownerName, r.registerName, r.applyOrgName, r.dciApplyTime || r.dciApplyTimeStr || "", STATUS_LABEL[r.dciStatus] != null ? STATUS_LABEL[r.dciStatus] : (r.dciStatus == null ? "-" : r.dciStatus)];
      };
    } else {
      headers = ["序号","DCI码","作品名称","作品类别","著作权人","DCI注册中心","DCI申领平台","DCI分配时间","状态"];
      mapRow = function (r, i) {
        var cat = CATEGORY_LABEL[r.caseCategoryCode] || r.caseCategoryName || r.caseCategoryCode || "";
        return [i+1, r.dciCode, r.caseName, cat, r.ownerName, r.registerName, r.applyOrgName, r.dciApplyTime || r.dciApplyTimeStr || "", STATUS_LABEL[r.dciStatus] != null ? STATUS_LABEL[r.dciStatus] : (r.dciStatus == null ? "-" : r.dciStatus)];
      };
    }
    var lines = [headers.map(csvEscape).join(",")];
    for (var i = 0; i < rows.length; i++) {
      lines.push(mapRow(rows[i], i).map(csvEscape).join(","));
    }
    // UTF-8 BOM so Excel opens Chinese correctly; content-type non-json so download helper accepts blob
    var csv = "\uFEFF" + lines.join("\r\n");
    return {
      __opsMockBlob: true,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: csv,
      filename: "codeManage_" + caseType + "_export.xlsx",
    };
  }


  function filterCursorListByCaseType(body, reqBody) {
    if (!body || !body.data || !Array.isArray(body.data.rows)) return body;
    var params = parseFormBody(reqBody);
    if (!params || typeof params !== "object") {
      try {
        params = typeof reqBody === "string" ? JSON.parse(reqBody || "{}") : reqBody || {};
      } catch (e) {
        params = {};
      }
    }
    var caseType = params.caseType || params.case_type;
    if (!caseType) return body;
    var rows = body.data.rows.filter(function (r) {
      return String(r.caseType || r.case_type || "") === String(caseType);
    });
    var out = JSON.parse(JSON.stringify(body));
    out.data.rows = rows;
    out.data.total = rows.length;
    out.data.hasMore = false;
    out.data.caseType = caseType;
    return out;
  }

  function handle(method, rawUrl, body) {
    var m = String(method || "GET").toUpperCase();
    var path = apiPath(rawUrl);
    var data = parseBody(body);


    // DCI码分配列表：按 tab caseType 过滤
    if ((m === "POST" || m === "GET") && /\/dci\/applyDoc\/cursorList$/.test(path)) {
      var listHit = lookup(m, rawUrl);
      if (listHit) return filterCursorListByCaseType(listHit, body);
    }

    // DCI码分配列表导出：字段与列表列一致，返回可下载 blob
    if ((m === "POST" || m === "GET") && /\/dci\/applyDoc\/export/.test(path)) {
      return mockApplyDocExport(rawUrl, body);
    }

    // 机构配置详情：本地 mock，不走真实接口
    var voMatch = path.match(/^\/dci\/regorg\/([^/]+)\/vo$/);
    if (m === "GET" && voMatch) {
      return ok(mockRegOrgVo(decodeURIComponent(voMatch[1])));
    }
    var detailMatch = path.match(/^\/dci\/regorg\/(\d+)$/);
    if (m === "GET" && detailMatch) {
      return ok(mockRegOrgVo(detailMatch[1]));
    }
    // 机构审核记录历史
    var auditListMatch = path.match(/^\/dci\/regorg\/getDciRegOrgAuditList\/([^/]+)$/);
    if (m === "GET" && auditListMatch) {
      var auditId = decodeURIComponent(auditListMatch[1]);
      var auditKey =
        "GET /api/v1/dciManage/dci/regorg/getDciRegOrgAuditList/" + auditId;
      var auditHit = (window.__OPS_MOCK_STORE__ || {})[auditKey];
      if (auditHit) return auditHit;
      return ok100([]);
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

    // 著作权人列表：按个人/机构页签返回
    if (m === "GET" && path === "/dci/applyRightOwner/list") {
      var ownerStore = window.__OPS_MOCK_STORE__ || {};
      var cat =
        parsedSearchParam(rawUrl, "ownerCategory") ||
        (data && data.ownerCategory) ||
        "person";
      var personKey =
        "GET /api/v1/dciManage/dci/applyRightOwner/list?pageNum=1&pageSize=10&ownerCategory=person";
      var orgKey =
        "GET /api/v1/dciManage/dci/applyRightOwner/list?pageNum=1&pageSize=10&ownerCategory=org";
      var listHit =
        ownerStore[cat === "org" ? orgKey : personKey] ||
        ownerStore["GET /api/v1/dciManage/dci/applyRightOwner/list"];
      if (listHit) return listHit;
    }

    // 著作权人详情
    var ownerDetailMatch = path.match(/^\/dci\/applyRightOwner\/detail\/([^/]+)$/);
    if (m === "GET" && ownerDetailMatch) {
      var detailKey =
        "GET /api/v1/dciManage/dci/applyRightOwner/detail/" +
        decodeURIComponent(ownerDetailMatch[1]);
      var detailHit = (window.__OPS_MOCK_STORE__ || {})[detailKey];
      if (detailHit) return detailHit;
      return ok100({
        info: {
          id: ownerDetailMatch[1],
          ownerName: "演示著作权人",
          cardFrontURL: null,
          cardBackURL: null,
        },
        opusDwcrApplyInfoList: [],
      });
    }

    // DCI 码查询：按码/关键词从 cursorList mock 过滤
    if (
      (m === "GET" || m === "POST") &&
      /\/dci\/applyDoc\/listByDciCodeAndKeyword/.test(path)
    ) {
      var qStore = window.__OPS_MOCK_STORE__ || {};
      var listBody = qStore["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
      var allRows =
        (listBody && listBody.data && listBody.data.rows) ||
        (listBody && listBody.rows) ||
        [];
      var codeQ = String(
        (data && (data.dciCode || data.code)) ||
          (parsedSearchParam(rawUrl, "dciCode") || ""),
      )
        .trim()
        .toUpperCase();
      var kwQ = String(
        (data && data.keyword) || parsedSearchParam(rawUrl, "keyword") || "",
      )
        .trim()
        .toLowerCase();
      var filtered = (allRows || []).filter(function (row) {
        if (!row) return false;
        if (codeQ && String(row.dciCode || "").toUpperCase().indexOf(codeQ) < 0) {
          return false;
        }
        if (kwQ) {
          var blob = [
            row.caseName,
            row.ownerName,
            row.applyOrgName,
            row.registerName,
            row.relatedRegNo,
          ]
            .join(" ")
            .toLowerCase();
          if (blob.indexOf(kwQ) < 0) return false;
        }
        return true;
      });
      return ok100({ rows: filtered, total: filtered.length });
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

    // Trend charts: always honor dateType so 按年 returns year labels on x-axis
    if (/queryStatByTimeType|queryContractFilingTrend/.test(path)) {
      return ok100(trendDemoFor(data && data.dateType));
    }
    // Pie charts: override store demos so category labels stay current
    if (/queryFileType/.test(path)) {
      return ok100(WORK_TYPE_DEMO);
    }
    if (/queryDciCodeType/.test(path)) {
      return ok100(CODE_TYPE_DEMO);
    }

    var applyDetail = mockApplyDocDetail(path);
    if (applyDetail) return applyDetail;

    var hit = lookup(m, rawUrl);
    if (hit != null) {
      if (path === "/getInfo") return sanitizeGetInfo(hit);
      if (path === "/getRouters") return stripUserRoleMenus(hit);
      if (!isSuccessBody(hit)) return placeholderFor(path, data);
      return hit;
    }

    // Never fall through to network; always return a successful mock body.
    return placeholderFor(path, data);
  }


  function mockOwner(i, id) {
    var n = Number(id) || 12;
    return {
      ownerName: "著作权人" + n + (i > 0 ? "-" + i : ""),
      ccpcOwnerId: "AUTH" + String(n).padStart(8, "0") + "00",
      rightOwnerTypeDesc: i % 2 ? "法人" : "自然人",
      rightOwnerRegion: "中国-北京市-北京市",
      cardTypeDesc: i % 2 ? "营业执照" : "居民身份证",
      cardNumber: i % 2 ? "911******0" + n + "X" : "110******123" + (n % 10),
      cardValidStartDate: "2016-01-01",
      cardValidEndDate: "2036-12-31",
      contactPerson: "联系人" + n + "-" + (i || 1),
      phone: "1380013" + String(100 + (n % 90) + i),
      email: "owner" + n + "_" + (i || 1) + "@example.com",
      cardFrontName: "证件正面照_" + n + "_1.jpg",
      cardBackName: "证件反面照_" + n + "_1.jpg",
      publicCardFrontUrl: "/static/favicon.ico",
      publicCardBackUrl: "/static/favicon.ico",
    };
  }

  function mockLinks(n, prefix) {
    return [1, 2, 3].map(function (i) {
      var linkMid = (prefix + String(n % 100000).padStart(5, "0") + "0" + i + "A").slice(
        0,
        10,
      );
      if (linkMid.length < 9) linkMid = (linkMid + "0ANT").slice(0, 9);
      return {
        dciCode: "DCI:" + linkMid + ".156.2025010" + i + "00000157" + i,
        ownerName: "著作权人" + i,
        dciApplyTime: "2025-0" + i + "-14 09:00:00",
        applyStatus: i === 3 ? "撤销" : "申领",
      };
    });
  }


  function findAllocListRow(id) {
    var store = window.__OPS_MOCK_STORE__ || {};
    var listBody = store["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
    var all =
      (listBody && listBody.data && listBody.data.rows) ||
      (listBody && listBody.rows) ||
      [];
    var sid = String(id);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === sid || String(all[i].docId) === sid) return all[i];
    }
    return null;
  }

  function findOriginRCode(listRow) {
    if (!listRow || listRow.dciCodeType !== "C") return "";
    var store = window.__OPS_MOCK_STORE__ || {};
    var listBody = store["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
    var all =
      (listBody && listBody.data && listBody.data.rows) ||
      (listBody && listBody.rows) ||
      [];
    for (var i = 0; i < all.length; i++) {
      var r = all[i];
      if (
        r.caseType === listRow.caseType &&
        r.dciCodeType === "R" &&
        r.ownerName === listRow.ownerName
      ) {
        return r.dciCode;
      }
    }
    for (var j = 0; j < all.length; j++) {
      if (all[j].caseType === listRow.caseType && all[j].dciCodeType === "R") {
        return all[j].dciCode;
      }
    }
    return "";
  }

  function mockApplyDocDetail(path) {
    var m = path.match(/\/dci\/applyDoc\/(opus|soft|dataset)\/(r|c|x)Info\/([^/]+)/i);
    if (!m) return null;
    var entity = m[1].toLowerCase();
    var code = m[2].toUpperCase();
    var id = decodeURIComponent(m[3]);
    var n = Number(id) || 12;
    var typeName =
      entity === "opus"
        ? code === "C"
          ? "授权分配"
          : code === "X"
            ? "其他"
            : "原始分配"
        : code === "C"
          ? "C码"
          : code === "X"
            ? "其他"
            : "R码";
    var prefix = code === "C" ? "C" : code === "X" ? "X" : "R";
    var listRow = findAllocListRow(id);
    var mid =
      prefix +
      String(Math.abs(n % 100000000)).padStart(8, "0").slice(0, 8 + (n % 3));
    if (mid.length < 9) mid = (mid + "0ANT").slice(0, 9);
    if (mid.length > 12) mid = mid.slice(0, 12);
    var dciCode =
      listRow && listRow.dciCode
        ? listRow.dciCode
        : "DCI:" + mid + ".156.20261001" + String(n).padStart(6, "0");
    var originDciCode = code === "C" ? findOriginRCode(listRow) || "" : "";
    if (code === "C" && !originDciCode) {
      originDciCode =
        "DCI:R" + String(n).padStart(8, "0").slice(0, 8) + "A.156.20250101000017";
    }
    var listName = (listRow && listRow.caseName) || "";
    var listOwner = (listRow && listRow.ownerName) || "";
    var catLabel =
      (listRow && CATEGORY_LABEL[listRow.caseCategoryCode]) || "";

    var base = {
      dciCode: dciCode,
      originDciCode: originDciCode,
      dciApplyTime: (listRow && listRow.dciApplyTime) || "2026-09-22 10:50:03",
      dciCodeType: code,
      dciCodeTypeName: typeName,
      registerName: (listRow && listRow.registerName) || "中国版权保护中心",
      applyOrgName:
        (listRow && listRow.applyOrgName) || "DCI申领平台" + ((n % 3) + 1),
      dciRegisterSyncTime: "2026-09-27 09:00:00",
    };

    var owners = [mockOwner(1, id)];
    if (listOwner) owners[0].ownerName = listOwner;
    var chain = {
      sDatahash: "0x" + (n * 7919).toString(16) + "a1b2c3d4e5f6",
      blockTime: "2026-09-27 09:00:00",
    };
    var register = {
      registerNo: "DJ2025" + String(n).padStart(3, "0"),
      registerDate: "2026-11-21",
      registerOrgName: "中华人民共和国国家版权局",
    };
    var rights = {
      methodAcquiringRights: "原始取得",
      methodOwnershipRights: "个人所有",
      rightsScope: "全部财产权利",
      registeredDesc: "是",
      originRegisterNo: register.registerNo,
      registerDate: register.registerDate,
      registerOrgName: register.registerOrgName,
      changedDesc: "是",
      isRegistered: "是",
      softRegisterNo: register.registerNo,
      hasChange: "是",
    };

    var data = {
      dciLinkInfoVO: mockLinks(n, prefix),
    };

    if (entity === "opus") {
      data.dciCodeOpusBaseRinfo = base;
      data.dciOpusBaseRinfo = {
        opusName: listName || ("作品名称" + n),
        opusCategoryName: catLabel || (code === "C" ? "曲艺作品" : code === "X" ? "音乐作品" : "戏剧作品"),
        opusCreationNature: code === "C" ? "改编" : code === "X" ? "汇编" : "原创",
        completeDate: "2026-10-22",
        completeAddress: "中国-广东省深圳市",
        publishStatusDesc: code === "R" ? "已发表" : "未发表",
        firstPublishDate: code === "R" ? "2026-10-02" : "-",
        firstAddress: code === "R" ? "中国-广东省深圳市" : "-",
        authorNames: "作者" + n,
        authorSignatures: code === "R" ? "署名" + n : "-",
        preRegistrationTrueWillDesc: "密码或确认短信",
        mattersEntrusted: "委托创作",
        preRegUserApplyConfirmTime: "2026-09-22 10:50:03",
      };
      data.dciOpusSampleRinfos = [
        {
          attachmentName: "作品样本 - " + (listName || ("作品名称" + n)) + ".pdf",
          sampleSummary:
            "由" + (listOwner || ("著作权人" + n)) + "创作完成，内容涉及 DCI 数字版权相关主题。",
          publicAttachmentUrl: "/static/favicon.ico",
        },
        {
          attachmentName: "作品样本附图 - " + (listName || ("作品名称" + n)) + ".zip",
          sampleSummary: "",
          publicAttachmentUrl: "/static/favicon.ico",
        },
      ];
      data.dciOpusRightOwnerRinfos = owners;
      data.dciOpusRightRinfo = rights;
      data.dciOpusRegisterRinfo = register;
      data.dciOpusBlockchainRinfo = chain;
      if (code === "C") {
        data.dciAuthContractRinfo = {
          contractType: "许可合同",
          applyType: "许可",
          effectDate: "2026-10-14",
          attachmentName: "合同附件_" + n + ".pdf",
          publicAttachmentUrl: "/static/favicon.ico",
        };
        data.transferorList = [Object.assign(mockOwner(1, id), { ownerName: "转让方" + n + "-1" })];
        data.transfereeList = [Object.assign(mockOwner(2, id), { ownerName: "受让方" + n + "-1" })];
        data.dciAuthScopeRinfo = {
          methodAcquiringRights: "原始取得",
          authRightsScope: "发行权",
          sublicensePermit: "不允许",
          authStartDate: "2026-10-09",
          authEndDate: "2027-09-19",
          regionScope: "全球",
          otherLimit: "仅限中国大陆地区使用",
        };
      }
    } else if (entity === "soft") {
      data.dciCodeSoftBaseRinfo = base;
      data.dciSoftBaseRinfo = {
        softFullName: listName || ("软件全称" + n),
        softShortName: listName ? listName.slice(0, 6) : ("简称" + n),
        version: "V" + ((n % 5) + 1) + ".2.0",
        softCategoryName: code === "C" ? "嵌入式软件" : "应用软件",
        creationNature: "修改（含翻译软件、合成软件）",
        needAuthDesc: "是",
        modifyDesc:
          code === "C"
            ? "合成多个模块形成新软件"
            : "在原软件基础上进行功能修改与界面优化",
        developMode: "单独开发",
        completeDate: "2026-11-03",
        publishStatusDesc: code === "R" ? "已发表" : "未发表",
        firstPublishDate: code === "R" ? "2026-10-14" : "-",
        firstPublishAddress: code === "R" ? "中国-北京市" : "-",
        preRegistrationTrueWillDesc: "密码或确认短信",
        mattersEntrusted: "委托开发",
        preRegUserApplyConfirmTime: "2026-10-04 10:51:03",
        devHardwareEnv: "Intel Core i7 / 16GB RAM",
        runHardwareEnv: "Intel Core i5 / 8GB RAM",
        devOs: "Windows 10",
        devTools: "Visual Studio 2022",
        runOs: "Linux",
        runSupport: "Java 17",
        programLanguage: "C++",
        sourceLines: "16000 行",
        developPurpose: "开发目的" + n + "：为用户提供高效便捷的数字版权管理工具",
        industry: "教育",
        mainFunction: "主要功能" + n + "：支持 DCI 码申领、查询、撤销及状态变更等核心业务",
        techFeature: "技术特点" + n + "：采用微服务架构，支持高并发、分布式部署",
      };
      data.dciSoftFeatureRinfo = data.dciSoftBaseRinfo;
      data.dciSoftSampleRinfo = {
        sourceName: "程序源代码.zip",
        docName: "软件说明文档.pdf",
        publicSourceUrl: "/static/favicon.ico",
        publicDocUrl: "/static/favicon.ico",
      };
      data.dciSoftRightOwnerRinfos = owners;
      data.dciSoftRightRinfo = rights;
      data.dciSoftRegisterRinfo = register;
      data.dciSoftBlockchainRinfo = chain;
      if (code === "C") {
        data.dciAuthContractRinfo = {
          contractType: "专有许可合同",
          softRegisteredDesc: "否",
          softRegisterNo: "软著登字第2025011号",
          changeCertNo: "无",
          attachmentName: "软件授权合同_" + n + ".pdf",
          publicAttachmentUrl: "/static/favicon.ico",
        };
        data.transferorList = [Object.assign(mockOwner(1, id), { ownerName: "转让方" + n + "-1" })];
        data.transfereeList = [Object.assign(mockOwner(2, id), { ownerName: "受让方" + n + "-1" })];
        data.dciAuthScopeRinfo = {
          methodAcquiringRights: "原始取得",
          authRightsScope: "信息网络传播权",
          regionScope: "亚太地区",
          contractEffectDate: "2026-11-05",
          licenseStartDate: "2024-01-01",
          licenseEndDate: "2029-12-31",
        };
      }
    } else {
      data.dciCodeDatasetBaseRinfo = base;
      data.dciDatasetBaseRinfo = {
        datasetName: listName || ("数据集名称" + n),
        dataScale: n * 32 + " 万条数据",
        dataLevel: "一级：科技 / 二级：人工智能",
        structureType: "非结构化数据",
        dataFormat: "图片 / 文本",
        datasetType: "商业数据集",
        authorNames: "作者" + n,
        opusCategoryName: "数据集",
        opusCreationNature: "改编",
        completeDate: "2026-04-11",
        completeAddress: "中国-北京市",
        publishStatusDesc: "已发表",
        firstPublishDate: "2026-04-11",
        firstPublishAddress: "中国-北京市",
        publishChannel: "科研数据共享平台",
      };
      data.dciDatasetSampleRinfo = {
        attachmentName: "数据集样本.zip",
        sampleSummary:
          "该数据集样本包含部分代表性数据条目及字段说明文档，用于版权登记审核与数据确权。",
        publicAttachmentUrl: "/static/favicon.ico",
      };
      data.dciDatasetRightOwnerRinfos = owners;
      data.dciDatasetRightRinfo = Object.assign({}, rights, {
        methodOwnershipRights: "职务作品",
        rightsScope: "人身权利及财产权利",
      });
      data.dciDatasetRegisterRinfo = register;
      data.dciDatasetBlockchainRinfo = chain;
      if (code === "C") {
        data.dciAuthContractRinfo = {
          contractType: "许可合同",
          applyType: "许可",
          effectDate: "2026-10-14",
          attachmentName: "合同附件_" + n + ".pdf",
          publicAttachmentUrl: "/static/favicon.ico",
        };
        data.transferorList = [Object.assign(mockOwner(1, id), { ownerName: "转让方" + n + "-1" })];
        data.transfereeList = [Object.assign(mockOwner(2, id), { ownerName: "受让方" + n + "-1" })];
        data.dciAuthScopeRinfo = {
          methodAcquiringRights: "原始取得",
          authRightsScope: "复制权",
          sublicensePermit: "不允许",
          authStartDate: "2026-01-01",
          authEndDate: "2028-12-31",
          regionScope: "中国",
          otherLimit: "-",
        };
      }
    }
    return ok100(data);
  }

  function respondXhr(xhr, payload) {
    var isBlob = payload && payload.__opsMockBlob;
    var contentType = isBlob
      ? payload.contentType || "application/octet-stream"
      : "application/json;charset=utf-8";
    var text = isBlob ? String(payload.body || "") : JSON.stringify(payload);
    var blobObj = isBlob ? new Blob([text], { type: contentType }) : null;
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
            return blobObj || text;
          },
        });
      } catch (e) {
        try {
          xhr.response = blobObj || text;
        } catch (e2) {}
      }
      xhr.getResponseHeader = function (name) {
        var n = String(name || "").toLowerCase();
        if (n === "content-type") return contentType;
        if (n === "content-disposition" && isBlob && payload.filename) {
          return 'attachment; filename="' + payload.filename + '"';
        }
        return null;
      };
      xhr.getAllResponseHeaders = function () {
        var h = "content-type: " + contentType + "\r\n";
        if (isBlob && payload.filename) {
          h +=
            'content-disposition: attachment; filename="' +
            payload.filename +
            '"\r\n';
        }
        return h;
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
      var payload = handle(method, url, b);
      if (payload && payload.__opsMockBlob) {
        return Promise.resolve(
          new Response(payload.body || "", {
            status: 200,
            headers: {
              "Content-Type":
                payload.contentType || "application/octet-stream",
              "Content-Disposition":
                'attachment; filename="' +
                (payload.filename || "export.xlsx") +
                '"',
            },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );
    };
  }

  window.__OPS_DCI_MOCK__ = { handle: handle, enabled: true };
})();
