/**
 * Account-center open-apply demo switcher (注册中心 / 技术服务中心申请子页).
 * Styles mirror /dci/org-info left-bottom floating panel.
 * Modes: reviewing | idle(未提交/已撤回) | rejected(不通过)
 * Does NOT activate on /dci/org-info workbench.
 */
(function () {
  var STORE_KEY = "dci-account-apply-demo-mode";
  var EVENT = "dci-account-apply-demo-change";
  var PANEL_ID = "dci-account-apply-demo-panel";
  var STYLE_ID = "dci-account-apply-demo-style";

  var MODES = [
    { id: "reviewing", label: "审核中", auditStatus: 0 },
    { id: "idle", label: "未提交/已撤回", auditStatus: -1 },
    {
      id: "rejected",
      label: "不通过",
      auditStatus: 2,
      rejectReason: "机构地址与营业执照信息不一致，请修改后重新提交",
    },
  ];

  var listeners = [];
  var regRefs = null; // { k, rejectRemark? } from RegOrgInfo when embedded

  function modeById(id) {
    for (var i = 0; i < MODES.length; i++) {
      if (MODES[i].id === id) return MODES[i];
    }
    return MODES[1];
  }

  function getModeId() {
    try {
      var v = sessionStorage.getItem(STORE_KEY);
      // migrate old combined "editable" key → idle
      if (v === "editable") v = "idle";
      if (v && modeById(v) && modeById(v).id === v) return v;
    } catch (e) {}
    return "idle";
  }

  function setModeId(id) {
    var m = modeById(id);
    if (!m) return;
    try {
      sessionStorage.setItem(STORE_KEY, m.id);
    } catch (e) {}
    applyToTargets(m);
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

  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (x) {
        return x !== fn;
      });
    };
  }

  function isAccountOpenTab() {
    if (!/\/user\/profile/.test(location.pathname)) return false;
    try {
      return new URLSearchParams(location.search).get("tab") === "open";
    } catch (e) {
      return false;
    }
  }

  /** Apply / progress subpage (not the two-card list). */
  function isAccountApplySubpage() {
    if (!isAccountOpenTab()) return false;
    if (/\/dci\/org-info/.test(location.pathname)) return false;
    return !!(
      document.querySelector(".embedded-apply-wrap .apply-console-container") ||
      document.querySelector(".tech-apply-root")
    );
  }

  function applyToTargets(m) {
    m = m || modeById(getModeId());
    // RegOrgInfo embedded (账号中心 → 注册中心申请)
    if (regRefs && regRefs.k) {
      try {
        regRefs.k.value = m.auditStatus;
        if (regRefs.A) regRefs.A.value = false;
        if (m.auditStatus === 2) {
          if (regRefs.rejectRemark) regRefs.rejectRemark.value = m.rejectReason || "";
          window.__DCI_ACCOUNT_APPLY_REJECT__ =
            m.rejectReason || "审核未通过，请修改后重新提交";
        } else {
          window.__DCI_ACCOUNT_APPLY_REJECT__ = "";
        }
      } catch (e) {}
    }
    // Tech apply only when tech subpage is mounted
    if (!document.querySelector(".tech-apply-root")) return;
    try {
      var TS = window.__DCI_TECH_STORE__;
      if (TS && typeof TS.setDemoStatus === "function") {
        TS.setDemoStatus(m.auditStatus, m.rejectReason || "");
      }
    } catch (e2) {}
    try {
      var TA = window.__DCI_TECH_APPLY__;
      if (TA && typeof TA.refresh === "function") TA.refresh();
    } catch (e3) {}
  }

  function bindRegRefs(refs) {
    regRefs = refs || null;
    if (regRefs) applyToTargets();
  }

  function apply(refs) {
    // Called from RegOrgInfo setup when embedded
    if (refs) bindRegRefs(refs);
    else applyToTargets();
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#" +
      PANEL_ID +
      "{position:fixed;left:16px;bottom:16px;z-index:9999;width:200px;background:#fff;" +
      "border:1px solid #dbe3f0;border-radius:10px;box-shadow:0 8px 24px rgba(15,35,80,.14);" +
      "font-family:system-ui,sans-serif;overflow:hidden}" +
      "#" +
      PANEL_ID +
      " .aa-head{padding:10px 12px 8px;background:linear-gradient(180deg,#f5f8fd,#eef3fb);" +
      "border-bottom:1px solid #e5ecf6}" +
      "#" +
      PANEL_ID +
      " .aa-title{font-size:12px;font-weight:700;color:#1f3b70}" +
      "#" +
      PANEL_ID +
      " .aa-sub{margin-top:3px;font-size:11px;color:#7a889f;line-height:1.35}" +
      "#" +
      PANEL_ID +
      " .aa-list{padding:8px;display:flex;flex-direction:column;gap:6px}" +
      "#" +
      PANEL_ID +
      " .aa-item{display:block;width:100%;text-align:center;border:1px solid transparent;" +
      "background:#f8fafc;color:#334155;border-radius:7px;padding:9px 8px;margin:0;" +
      "cursor:pointer;font-size:12px;line-height:1.35}" +
      "#" +
      PANEL_ID +
      " .aa-item:hover{border-color:#c9d7ef;background:#f1f6fd}" +
      "#" +
      PANEL_ID +
      " .aa-item.is-active{border-color:#0075c1;background:#e8f1fc;color:#0075c1;font-weight:600}";
    document.head.appendChild(style);
  }

  function renderPanel() {
    if (!isAccountApplySubpage()) {
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
      '<div class="aa-head"><div class="aa-title">开通申请状态</div>' +
      '<div class="aa-sub">切换演示状态</div></div><div class="aa-list">';
    for (var i = 0; i < MODES.length; i++) {
      var m = MODES[i];
      html +=
        '<button type="button" class="aa-item' +
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
    // Keep targets in sync when panel (re)appears
    applyToTargets();
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

  window.__DCI_ACCOUNT_APPLY_DEMO__ = {
    MODES: MODES,
    getModeId: getModeId,
    setModeId: setModeId,
    apply: apply,
    bindRegRefs: bindRegRefs,
    isAccountApplySubpage: isAccountApplySubpage,
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
    if (isAccountApplySubpage() && !document.getElementById(PANEL_ID)) renderPanel();
    if (!isAccountApplySubpage() && document.getElementById(PANEL_ID)) renderPanel();
  }, 600);
})();
