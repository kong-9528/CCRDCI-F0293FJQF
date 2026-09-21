/**
 * Floating DCI码权限 demo switcher for info-management pages.
 * Shared across identity + apporg tabs via sessionStorage.
 */
(function () {
  var STORE_KEY = "dci-rcx-demo-mode";
  var EVENT = "dci-rcx-demo-change";
  var PANEL_ID = "dci-rcx-demo-panel";

  var MODES = [
    {
      id: "none",
      label: "未分配",
      hint: "无标识码、无码权限；申领平台不可操作",
      orgCode: "",
      rcxType: "",
      auditStatus: "0",
      allowAppOrg: false,
    },
    {
      id: "coded",
      label: "仅标识码",
      hint: "已分配标识码，码权限未配置；申领平台可维护",
      orgCode: true,
      rcxType: "",
      auditStatus: "1",
      allowAppOrg: true,
    },
    {
      id: "basic",
      label: "基础权限",
      hint: "作品登记、DCI查询",
      orgCode: true,
      rcxType: "reg,query",
      auditStatus: "1",
      allowAppOrg: true,
    },
    {
      id: "full",
      label: "完整权限",
      hint: "登记 / 查询 / 确权 / 同步",
      orgCode: true,
      rcxType: "reg,query,cert,sync",
      auditStatus: "1",
      allowAppOrg: true,
    },
  ];

  var DICT = [
    { dictLabel: "作品登记", dictValue: "reg", listClass: "", cssClass: "" },
    { dictLabel: "DCI查询", dictValue: "query", listClass: "", cssClass: "" },
    { dictLabel: "确权认证", dictValue: "cert", listClass: "", cssClass: "" },
    { dictLabel: "数据同步", dictValue: "sync", listClass: "", cssClass: "" },
  ];

  function modeById(id) {
    for (var i = 0; i < MODES.length; i++) {
      if (MODES[i].id === id) return MODES[i];
    }
    return MODES[0];
  }

  function getModeId() {
    try {
      var v = sessionStorage.getItem(STORE_KEY);
      if (v && modeById(v)) return v;
    } catch (e) {}
    return "none";
  }

  function setModeId(id) {
    if (!modeById(id)) return;
    try {
      sessionStorage.setItem(STORE_KEY, id);
    } catch (e) {}
    try {
      window.dispatchEvent(
        new CustomEvent(EVENT, { detail: { mode: id } }),
      );
    } catch (e) {}
    renderPanel();
  }

  function resolveOrgCode(preferred) {
    if (preferred) return preferred;
    var M = window.__DCI_MOCK__;
    var u = M && M.currentUser && M.currentUser();
    if (u && u.username) return "ORG-" + String(u.username).toUpperCase();
    return "ORG-DEMO";
  }

  function shapeOrg(body) {
    var mode = modeById(getModeId());
    var prev = (body && body.data) || {};
    var code = mode.orgCode
      ? resolveOrgCode(prev.orgCode || prev.dciRegOrgCode)
      : "";
    return {
      code: 200,
      msg: "操作成功",
      data: {
        id: prev.id || (window.__DCI_MOCK__ && window.__DCI_MOCK__.currentUser()
          ? window.__DCI_MOCK__.currentUser().userId
          : "mock-demo"),
        auditStatus: mode.auditStatus,
        orgName: prev.orgName || (window.__DCI_MOCK__ && window.__DCI_MOCK__.currentUser()
          ? window.__DCI_MOCK__.currentUser().orgName
          : "演示登记机构") || "演示登记机构",
        regOrgName: prev.regOrgName || prev.orgName || "演示登记机构",
        orgCode: code || undefined,
        dciRegOrgCode: code || undefined,
        rcxType: mode.rcxType || undefined,
        apiPermissions:
          "[{\"interfaceId\":\"2080588010370920449\",\"startDate\":\"2026-09-09\"},{\"interfaceId\":\"2080587923100037121\",\"startDate\":\"2026-09-09\"},{\"interfaceId\":\"2070330053367017473\",\"startDate\":\"2026-09-09\"},{\"interfaceId\":\"2055556104074723330\",\"startDate\":\"2026-09-09\"}]",
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
    return DICT.slice();
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
      "width:200px;background:#fff;border:1px solid #dbe3f0;border-radius:10px;" +
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
      " .rcx-sub{margin-top:2px;font-size:11px;color:#7a889f;line-height:1.35}" +
      "#" +
      PANEL_ID +
      " .rcx-list{padding:8px}" +
      "#" +
      PANEL_ID +
      " .rcx-item{display:block;width:100%;text-align:left;border:1px solid transparent;" +
      "background:#f8fafc;color:#334155;border-radius:7px;padding:8px 10px;margin:0 0 6px;" +
      "cursor:pointer;font-size:12px;line-height:1.3}" +
      "#" +
      PANEL_ID +
      " .rcx-item:last-child{margin-bottom:0}" +
      "#" +
      PANEL_ID +
      " .rcx-item:hover{border-color:#c9d7ef;background:#f1f6fd}" +
      "#" +
      PANEL_ID +
      " .rcx-item.is-active{border-color:#1449b2;background:#e8f1fc;color:#1449b2;font-weight:600}" +
      "#" +
      PANEL_ID +
      " .rcx-item small{display:block;margin-top:2px;font-weight:400;color:#8a97ab;font-size:10px}";
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
    var mode = modeById(modeId);
    var panel = existing || document.createElement("div");
    panel.id = PANEL_ID;
    var html =
      '<div class="rcx-head"><div class="rcx-title">DCI码权限演示</div>' +
      '<div class="rcx-sub">' +
      mode.hint +
      "</div></div><div class=\"rcx-list\">";
    for (var i = 0; i < MODES.length; i++) {
      var m = MODES[i];
      html +=
        '<button type="button" class="rcx-item' +
        (m.id === modeId ? " is-active" : "") +
        '" data-mode="' +
        m.id +
        '">' +
        m.label +
        "<small>" +
        m.hint +
        "</small></button>";
    }
    html += "</div>";
    panel.innerHTML = html;
    if (!existing) document.body.appendChild(panel);
    panel.onclick = function (ev) {
      var btn = ev.target && ev.target.closest
        ? ev.target.closest("[data-mode]")
        : null;
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
    getModeId: getModeId,
    setModeId: setModeId,
    shapeOrg: shapeOrg,
    allowAppOrg: allowAppOrg,
    dict: dict,
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
