/**
 * Org-info page demo: 无状态 / 审核中
 */
(function () {
  var STORE_KEY = "dci-orginfo-demo-mode";
  var EVENT = "dci-orginfo-demo-change";
  var PANEL_ID = "dci-orginfo-demo-panel";

  var MODES = [
    { id: "idle", label: "无状态", changeStatus: "0" },
    { id: "reviewing", label: "审核中", changeStatus: "1" },
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
      if (v && modeById(v)) return modeById(v).id;
    } catch (e) {}
    return "idle";
  }

  function setModeId(id) {
    var m = modeById(id);
    if (!m) return;
    try {
      sessionStorage.setItem(STORE_KEY, m.id);
    } catch (e) {}
    listeners.forEach(function (fn) {
      try {
        fn(m.id);
      } catch (err) {}
    });
    try {
      window.dispatchEvent(new CustomEvent(EVENT, { detail: m.id }));
    } catch (e2) {}
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

  function isOrgInfoPage() {
    return /\/dci\/org-info/.test(location.pathname);
  }

  function apply(refs) {
    if (!refs) return;
    var m = modeById(getModeId());
    try {
      // Org-info browse base is always「已通过」; page status is changeStatus only
      if (refs.k) refs.k.value = 1;
      if (refs.P) refs.P.value = m.changeStatus;
      if (refs.A && m.changeStatus === "1") refs.A.value = false;
    } catch (e) {}
  }

  function shapePayload(body) {
    if (!isOrgInfoPage()) return body;
    if (!body) body = { code: 200, data: {} };
    if (!body.data) body.data = {};
    var m = modeById(getModeId());
    var d = body.data;
    d.changeStatus = m.changeStatus;
    d.auditStatus = 1;
    // Fill demo fields if sparse
    if (!d.orgName && !d.regOrgName) d.orgName = "太极计算机股份有限公司";
    if (!d.regOrgName) d.regOrgName = d.orgName;
    if (!d.orgNamePy && !d.regOrgNamePy) d.orgNamePy = "Taiji Computer Co Ltd";
    if (!d.creditCode) d.creditCode = "91110000710934657Q";
    if (!d.orgAddress && !d.regOrgAddress) d.orgAddress = "北京市海淀区北四环中路211号";
    if (!d.invitationCode) d.invitationCode = "DCI-INVITE-2026";
    if (!d.orgCode) d.orgCode = "ANT";
    if (!d.orgTypeCode && !d.regOrgType) d.orgTypeCode = "ZYFW";
    if (!d.cooperationField) d.cooperationField = "数字版权确权、DCI码申领与同步";
    if (!d.contractStartDate) d.contractStartDate = "2026-01-01";
    if (!d.contractEndDate) d.contractEndDate = "2027-12-31";
    if (!d.linkName) d.linkName = "张三";
    if (!d.linkPhone) d.linkPhone = "13800008002";
    return body;
  }

  function ensureStyles() {
    if (document.getElementById("dci-orginfo-demo-style")) return;
    var style = document.createElement("style");
    style.id = "dci-orginfo-demo-style";
    style.textContent =
      "#" +
      PANEL_ID +
      "{position:fixed;left:16px;bottom:16px;z-index:9999;width:168px;background:#fff;" +
      "border:1px solid #dbe3f0;border-radius:10px;box-shadow:0 8px 24px rgba(15,35,80,.14);" +
      "font-family:system-ui,sans-serif;overflow:hidden}" +
      "#" +
      PANEL_ID +
      " .oi-head{padding:10px 12px 8px;background:linear-gradient(180deg,#f5f8fd,#eef3fb);" +
      "border-bottom:1px solid #e5ecf6}" +
      "#" +
      PANEL_ID +
      " .oi-title{font-size:12px;font-weight:700;color:#1f3b70}" +
      "#" +
      PANEL_ID +
      " .oi-sub{margin-top:3px;font-size:11px;color:#7a889f;line-height:1.35}" +
      "#" +
      PANEL_ID +
      " .oi-list{padding:8px;display:flex;flex-direction:column;gap:6px}" +
      "#" +
      PANEL_ID +
      " .oi-item{display:block;width:100%;text-align:center;border:1px solid transparent;" +
      "background:#f8fafc;color:#334155;border-radius:7px;padding:9px 10px;margin:0;" +
      "cursor:pointer;font-size:13px;line-height:1.3}" +
      "#" +
      PANEL_ID +
      " .oi-item:hover{border-color:#c9d7ef;background:#f1f6fd}" +
      "#" +
      PANEL_ID +
      " .oi-item.is-active{border-color:#0075c1;background:#e8f1fc;color:#0075c1;font-weight:600}";
    document.head.appendChild(style);
  }

  function renderPanel() {
    if (!isOrgInfoPage()) {
      var dead = document.getElementById(PANEL_ID);
      if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
      return;
    }
    ensureStyles();
    var existing = document.getElementById(PANEL_ID);
    var modeId = getModeId();
    var panel = existing || document.createElement("div");
    panel.id = PANEL_ID;
    var html =
      '<div class="oi-head"><div class="oi-title">机构信息状态</div>' +
      '<div class="oi-sub">切换浏览状态</div></div><div class="oi-list">';
    for (var i = 0; i < MODES.length; i++) {
      var m = MODES[i];
      html +=
        '<button type="button" class="oi-item' +
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

  window.__DCI_ORGINFO_DEMO__ = {
    MODES: MODES,
    getModeId: getModeId,
    setModeId: setModeId,
    apply: apply,
    shapePayload: shapePayload,
    isOrgInfoPage: isOrgInfoPage,
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
    if (isOrgInfoPage() && !document.getElementById(PANEL_ID)) renderPanel();
    if (!isOrgInfoPage() && document.getElementById(PANEL_ID)) renderPanel();
  }, 800);
})();
