/**
 * Floating demo switcher for info-management pages.
 * Shared across identity + apporg tabs via sessionStorage.
 */
(function () {
  var STORE_KEY = "dci-rcx-demo-mode";
  var EVENT = "dci-rcx-demo-change";
  var PANEL_ID = "dci-rcx-demo-panel";

  var ALL_CODE_TYPES = ["原始分配", "授权分配", "其他"];
  var ALL_DATA_APIS = [
    "实名信息接口",
    "实名信息修改接口",
    "DCI申领数据同步接口",
    "DCI撤销数据同步接口",
  ];

  var MODES = [
    {
      id: "none",
      label: "未配置",
      orgCode: false,
      configured: false,
      auditStatus: "0",
      allowAppOrg: false,
    },
    {
      id: "configured",
      label: "已配置",
      orgCode: true,
      configured: true,
      auditStatus: "1",
      allowAppOrg: true,
    },
  ];

  function modeById(id) {
    for (var i = 0; i < MODES.length; i++) {
      if (MODES[i].id === id) return MODES[i];
    }
    // migrate legacy mode ids
    if (id === "coded" || id === "basic" || id === "full") {
      return modeById("configured");
    }
    return MODES[0];
  }

  function getModeId() {
    try {
      var v = sessionStorage.getItem(STORE_KEY);
      if (v) {
        var m = modeById(v);
        if (m) {
          if (v !== m.id) {
            try {
              sessionStorage.setItem(STORE_KEY, m.id);
            } catch (e) {}
          }
          return m.id;
        }
      }
    } catch (e) {}
    return "none";
  }

  function setModeId(id) {
    var m = modeById(id);
    if (!m) return;
    try {
      sessionStorage.setItem(STORE_KEY, m.id);
    } catch (e) {}
    notify(m.id);
    renderPanel();
  }

  var listeners = [];
  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (x) {
        return x !== fn;
      });
    };
  }
  function notify(modeId) {
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](modeId);
      } catch (e) {}
    }
    try {
      window.dispatchEvent(new CustomEvent(EVENT, { detail: { mode: modeId } }));
    } catch (e) {}
  }

  function resolveOrgCode() {
    var M = window.__DCI_MOCK__;
    var u = M && M.currentUser && M.currentUser();
    if (u && (u.username === "mayi" || u.username === "mayi2")) return "ANT";
    if (u && u.username) return "ANT";
    return "ANT";
  }

  function shapeOrg(body) {
    var mode = modeById(getModeId());
    var prev = (body && body.data) || {};
    var code = mode.orgCode ? resolveOrgCode() : "";
    var configured = !!mode.configured;
    return {
      code: 200,
      msg: "操作成功",
      data: {
        id:
          prev.id ||
          (window.__DCI_MOCK__ && window.__DCI_MOCK__.currentUser()
            ? window.__DCI_MOCK__.currentUser().userId
            : "mock-demo"),
        auditStatus: mode.auditStatus,
        orgName:
          prev.orgName ||
          (window.__DCI_MOCK__ && window.__DCI_MOCK__.currentUser()
            ? window.__DCI_MOCK__.currentUser().orgName
            : "演示登记机构") ||
          "演示登记机构",
        regOrgName: prev.regOrgName || prev.orgName || "演示登记机构",
        orgCode: code || "",
        dciRegOrgCode: code || "",
        dciCodeType: configured ? ALL_CODE_TYPES.join(",") : "",
        dciDataInterface: configured ? ALL_DATA_APIS.join(",") : "",
        apiPermissions:
          '[{"interfaceId":"2080588010370920449","startDate":"2026-09-09"},{"interfaceId":"2080587923100037121","startDate":"2026-09-09"},{"interfaceId":"2070330053367017473","startDate":"2026-09-09"},{"interfaceId":"2055556104074723330","startDate":"2026-09-09"}]',
        accessKey: prev.accessKey || "AKDEMOMOCK000000000000001",
        accessSecret: prev.accessSecret || "SKDEMOMOCKSECRET000000001",
        dataEncrypKey: prev.dataEncrypKey || "DEKDEMOMOCK0000000000001",
      },
    };
  }

  function allowAppOrg() {
    return !!modeById(getModeId()).allowAppOrg;
  }

  function dict() {
    return [];
  }

  function isInfoPage() {
    return /\/dci\/info-management/.test(location.pathname);
  }

  function ensureStyles() {
    if (document.getElementById("dci-rcx-demo-style")) return;
    var style = document.createElement("style");
    style.id = "dci-rcx-demo-style";
    style.textContent =
      "#" +
      PANEL_ID +
      "{position:fixed;left:16px;bottom:16px;z-index:9999;" +
      "width:168px;background:#fff;border:1px solid #dbe3f0;border-radius:10px;" +
      "box-shadow:0 8px 24px rgba(15,35,80,.14);font-family:system-ui,sans-serif;" +
      "overflow:hidden}" +
      "#" +
      PANEL_ID +
      " .rcx-head{padding:10px 12px 8px;background:linear-gradient(180deg,#f5f8fd,#eef3fb);" +
      "border-bottom:1px solid #e5ecf6}" +
      "#" +
      PANEL_ID +
      " .rcx-title{font-size:12px;font-weight:700;color:#1f3b70;letter-spacing:.02em}" +
      "#" +
      PANEL_ID +
      " .rcx-sub{margin-top:3px;font-size:11px;color:#7a889f;line-height:1.35}" +
      "#" +
      PANEL_ID +
      " .rcx-list{padding:8px;display:flex;flex-direction:column;gap:6px}" +
      "#" +
      PANEL_ID +
      " .rcx-item{display:block;width:100%;text-align:center;border:1px solid transparent;" +
      "background:#f8fafc;color:#334155;border-radius:7px;padding:9px 10px;margin:0;" +
      "cursor:pointer;font-size:13px;line-height:1.3}" +
      "#" +
      PANEL_ID +
      " .rcx-item:hover{border-color:#c9d7ef;background:#f1f6fd}" +
      "#" +
      PANEL_ID +
      " .rcx-item.is-active{border-color:#0075c1;background:#e8f1fc;color:#0075c1;font-weight:600}";
    document.head.appendChild(style);
  }

  function renderPanel() {
    ensureStyles();
    var existing = document.getElementById(PANEL_ID);
    if (!isInfoPage()) {
      if (existing) existing.remove();
      return;
    }
    var modeId = getModeId();
    var panel = existing || document.createElement("div");
    panel.id = PANEL_ID;
    var html =
      '<div class="rcx-head"><div class="rcx-title">状态演示</div>' +
      '<div class="rcx-sub">切换配置状态</div></div><div class="rcx-list">';
    for (var i = 0; i < MODES.length; i++) {
      var m = MODES[i];
      html +=
        '<button type="button" class="rcx-item' +
        (m.id === modeId ? " is-active" : "") +
        '" data-mode="' +
        m.id +
        '">' +
        m.label +
        "</button>";
    }
    html += "</div>";
    panel.innerHTML = html;
    if (!existing) document.body.appendChild(panel);
    panel.onclick = function (ev) {
      var btn =
        ev.target && ev.target.closest ? ev.target.closest("[data-mode]") : null;
      if (!btn) return;
      var next = btn.getAttribute("data-mode");
      if (next && next !== getModeId()) setModeId(next);
    };
  }

  function hookHistory() {
    var wrap = function (type) {
      var orig = history[type];
      return function () {
        var ret = orig.apply(this, arguments);
        setTimeout(renderPanel, 0);
        return ret;
      };
    };
    history.pushState = wrap("pushState");
    history.replaceState = wrap("replaceState");
    window.addEventListener("popstate", renderPanel);
  }

  window.__DCI_RCX_DEMO__ = {
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      hookHistory();
      renderPanel();
    });
  } else {
    hookHistory();
    renderPanel();
  }
  setInterval(function () {
    if (isInfoPage() && !document.getElementById(PANEL_ID)) renderPanel();
    if (!isInfoPage() && document.getElementById(PANEL_ID)) renderPanel();
  }, 800);
})();
