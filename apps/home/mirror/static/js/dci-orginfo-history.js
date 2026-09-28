/**
 * Org-info history as secondary page (interaction mirrors customer /account?view=history).
 * Fields & visual tokens follow /dci/org-info/index.
 * Default: all records collapsed.
 */
(function () {
  var PAGE_ID = "dci-orginfo-history-page";
  var ROOT_CLS = "is-orginfo-history-view";
  var expanded = Object.create(null); // id -> true; start empty = all collapsed
  var lastSig = "";
  var wasHistory = false;

  function isOrgInfo() {
    return /\/dci\/org-info/.test(location.pathname);
  }

  function isHistoryView() {
    try {
      return new URLSearchParams(location.search).get("view") === "history";
    } catch (e) {
      return false;
    }
  }

  function bridge() {
    return window.__DCI_ORGINFO_HISTORY__ || null;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusMeta(st) {
    var s = String(st == null ? "" : st);
    if (s === "1") return { label: "已通过", type: "success" };
    if (s === "0") return { label: "审核中", type: "warning" };
    if (s === "3") return { label: "已撤回", type: "info" };
    return { label: "不通过", type: "danger" };
  }

  function dash(v) {
    var t = v == null ? "" : String(v).trim();
    return t ? t : "-";
  }

  function contractRange(row) {
    var a = dash(row.contractStartDate).replace(/ .*$/, "");
    var b = dash(row.contractEndDate).replace(/ .*$/, "");
    if (a === "-" && b === "-") return "-";
    if (a === "-") return b;
    if (b === "-") return a;
    return a + " ~ " + b;
  }

  function field(label, valueHtml, full) {
    return (
      '<div class="oi-hist-field' +
      (full ? " oi-hist-field--full" : "") +
      '"><span class="oi-hist-field__label">' +
      esc(label) +
      '</span><div class="oi-hist-field__value">' +
      valueHtml +
      "</div></div>"
    );
  }

  function filesHtml(row, form) {
    var list =
      (row.contractFileList && row.contractFileList.length && row.contractFileList) ||
      (row.contractFiles &&
        (Array.isArray(row.contractFiles)
          ? row.contractFiles
          : String(row.contractFiles)
              .split(",")
              .filter(Boolean)
              .map(function (u) {
                return { name: u.split("/").pop() || u, url: u };
              }))) ||
      (form && form.contractFileList) ||
      [];
    if (!list.length) return esc("-");
    var html = '<div class="oi-hist-files">';
    for (var i = 0; i < list.length; i++) {
      var f = list[i] || {};
      var name = f.name || f.fileName || "附件";
      html +=
        '<div class="oi-hist-file"><span class="oi-hist-file__name">' +
        esc(name) +
        '</span><button type="button" class="oi-hist-file__link" data-file-idx="' +
        i +
        '" data-row-id="' +
        esc(row.id || "") +
        '">下载查看</button></div>';
    }
    html += "</div>";
    return html;
  }

  function phoneHtml(row, idx) {
    var b = bridge();
    var key = "history_" + idx;
    var raw = row.linkPhone || (b && b.getForm && b.getForm() && b.getForm().linkPhone) || "";
    var shown = "-";
    if (b && b.maskPhone) shown = esc(b.maskPhone(raw));
    else if (raw) {
      var e = String(raw).trim();
      shown = esc(
        e.length === 11 ? e.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : e
      );
    }
    // Live revealed value from Vue T is not mirrored here; companion uses click → bridge.revealPhone then refresh
    var revealed = window.__DCI_ORGINFO_HIST_PHONE__ && window.__DCI_ORGINFO_HIST_PHONE__[key];
    if (revealed) shown = esc(revealed);
    var id = row.id || (b && b.getForm && b.getForm() && b.getForm().id) || "";
    var html = "<span>" + shown + "</span>";
    if (id || raw) {
      html +=
        '<button type="button" class="oi-hist-phone-btn" data-phone-key="' +
        esc(key) +
        '" data-phone-id="' +
        esc(id) +
        '" title="查看手机号" aria-label="查看手机号">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.75"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75"/></svg>' +
        "</button>";
      var left =
        window.__DCI_ORGINFO_HIST_PHONE_LEFT__ &&
        window.__DCI_ORGINFO_HIST_PHONE_LEFT__[key];
      if (left > 0) html += '<span class="oi-hist-phone-left">(' + left + "s)</span>";
    }
    return html;
  }

  function cardHtml(row, idx, form) {
    var id = String(row.id || "hist-" + idx);
    var open = !!expanded[id];
    var st = statusMeta(row.auditStatus);
    var name = dash(row.regOrgName || row.orgName || (form && form.regOrgName) || "注册中心申请");
    var time = dash(row.createTime || row.auditTime);
    var orgCode = row.orgCode || (form && form.orgCode) || "";

    var panel =
      '<div class="oi-hist-panel" id="oi-hist-panel-' +
      esc(id) +
      '" role="region"' +
      (open ? "" : ' inert aria-hidden="true"') +
      '><div class="oi-hist-panel-inner">' +
      '<section class="oi-hist-block"><h4 class="oi-hist-block__title">基本信息</h4><div class="oi-hist-grid">' +
      field("机构名称", esc(name)) +
      field("机构名称中文拼音", esc(dash(row.regOrgNamePy || row.orgNamePy || (form && form.regOrgNamePy)))) +
      field("组织机构代码", esc(dash(row.creditCode || (form && form.creditCode)))) +
      (orgCode ? field("DCI注册中心标识码", esc(orgCode)) : "") +
      field("机构地址", esc(dash(row.regOrgAddress || row.orgAddress || (form && form.regOrgAddress)))) +
      field("邀请码", esc(dash(row.invitationCode || (form && form.invitationCode)))) +
      field("DCI注册中心类型", esc(dash(row.orgTypeName || row.regOrgType || (form && form.regOrgType)))) +
      field("合作领域", esc(dash(row.cooperationField || (form && form.cooperationField))), true) +
      field("合同开始日期", esc(dash(row.contractStartDate || (form && form.contractStartDate)).replace(/ .*$/, ""))) +
      field("合同结束日期", esc(dash(row.contractEndDate || (form && form.contractEndDate)).replace(/ .*$/, ""))) +
      field("合同附件", filesHtml(row, form), true) +
      '</div></section>' +
      '<section class="oi-hist-block"><h4 class="oi-hist-block__title">联系人信息</h4><div class="oi-hist-grid">' +
      field("联系人", esc(dash(row.linkName || (form && form.linkName)))) +
      field("手机号码", phoneHtml(row, idx)) +
      field("申请/审核时间", esc(time)) +
      field(
        "审核结果",
        '<span class="oi-hist-tag oi-hist-tag--' + st.type + '">' + esc(st.label) + "</span>"
      ) +
      field("审核意见 / 原因", esc(dash(row.auditRemark || row.rejectReason)), true) +
      "</div></section></div></div>";

    return (
      '<article class="oi-hist-card' +
      (open ? " is-open" : "") +
      '" data-hist-id="' +
      esc(id) +
      '"><button type="button" class="oi-hist-summary" aria-expanded="' +
      (open ? "true" : "false") +
      '" aria-controls="oi-hist-panel-' +
      esc(id) +
      '"><span class="oi-hist-summary-main"><span class="oi-hist-company" title="' +
      esc(name) +
      '">' +
      esc(name) +
      '</span><span class="oi-hist-meta"><span class="oi-hist-meta-item"><span class="oi-hist-meta-label">合同起止</span><span class="oi-hist-meta-value">' +
      esc(contractRange(row)) +
      '</span></span><span class="oi-hist-meta-item"><span class="oi-hist-meta-label">提交时间</span><span class="oi-hist-meta-value">' +
      esc(time) +
      '</span></span></span></span><span class="oi-hist-aside"><span class="oi-hist-tag oi-hist-tag--' +
      st.type +
      '">' +
      esc(st.label) +
      '</span><svg class="oi-hist-chevron' +
      (open ? " is-open" : "") +
      '" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' +
      panel +
      "</article>"
    );
  }

  function getRecords() {
    var b = bridge();
    var rows = (b && b.getRecords && b.getRecords()) || [];
    if (rows.length) return rows;
    if (
      window.__DCI_ORGINFO_DEMO__ &&
      typeof window.__DCI_ORGINFO_DEMO__.buildHistoryRecords === "function"
    ) {
      var form = (b && b.getForm && b.getForm()) || {};
      var built = window.__DCI_ORGINFO_DEMO__.buildHistoryRecords(form.id);
      return built.slice().reverse();
    }
    return [];
  }

  function render(force) {
    if (!isOrgInfo()) {
      teardown();
      lastSig = "";
      return;
    }
    var container = document.querySelector(".apply-console-container");
    if (!container) return;

    if (!isHistoryView()) {
      container.classList.remove(ROOT_CLS);
      var dead = document.getElementById(PAGE_ID);
      if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
      lastSig = "";
      return;
    }

    container.classList.add(ROOT_CLS);
    var b = bridge();
    var form = (b && b.getForm && b.getForm()) || {};
    var rows = getRecords();

    var phoneSig = JSON.stringify(window.__DCI_ORGINFO_HIST_PHONE__ || {}) +
      JSON.stringify(window.__DCI_ORGINFO_HIST_PHONE_LEFT__ || {});
    var expSig = Object.keys(expanded).sort().join(",");
    var rowSig = rows
      .map(function (r) {
        return String(r.id || "") + ":" + String(r.auditStatus || "") + ":" + String(r.createTime || "");
      })
      .join("|");
    var sig = "1|" + rowSig + "|" + expSig + "|" + phoneSig;
    if (!force && sig === lastSig && document.getElementById(PAGE_ID)) return;
    lastSig = sig;

    var page = document.getElementById(PAGE_ID);
    if (!page) {
      page = document.createElement("div");
      page.id = PAGE_ID;
      page.className = "main-card oi-history-page";
      container.appendChild(page);
    }

    var body =
      '<div class="card-header oi-history-header"><div class="header-left flex-row align-center"><button type="button" class="el-button el-button--default oi-history-back" id="oi-hist-back"><span>返回</span></button><div class="header-title">历史申请记录</div></div></div>';

    if (!rows.length) {
      body += '<div class="oi-hist-empty">暂无历史申请记录</div>';
    } else {
      body += '<div class="oi-hist-list">';
      for (var i = 0; i < rows.length; i++) body += cardHtml(rows[i], i, form);
      body += "</div>";
    }
    page.innerHTML = body;

    var back = document.getElementById("oi-hist-back");
    if (back) {
      back.onclick = function () {
        if (b && b.leaveHistory) b.leaveHistory();
        else {
          try {
            var u = new URL(location.href);
            u.searchParams.delete("view");
            history.replaceState({}, "", u.pathname + u.search + u.hash);
          } catch (e) {}
          render(true);
        }
      };
    }

    page.onclick = function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;

      var sum = t.closest(".oi-hist-summary");
      if (sum) {
        var art = sum.closest(".oi-hist-card");
        if (!art) return;
        var hid = art.getAttribute("data-hist-id");
        if (!hid) return;
        if (expanded[hid]) delete expanded[hid];
        else expanded[hid] = true;
        render(true);
        return;
      }

      var fileBtn = t.closest("[data-file-idx]");
      if (fileBtn) {
        var fi = Number(fileBtn.getAttribute("data-file-idx"));
        var rowId = fileBtn.getAttribute("data-row-id");
        var recs = getRecords();
        var row = null;
        for (var r = 0; r < recs.length; r++) {
          if (String(recs[r].id || "") === String(rowId || "")) row = recs[r];
        }
        var list =
          (row && row.contractFileList) ||
          (form && form.contractFileList) ||
          [];
        var file = list[fi];
        if (file && b && b.previewFile) b.previewFile(file);
        return;
      }

      var phoneBtn = t.closest("[data-phone-key]");
      if (phoneBtn) {
        var key = phoneBtn.getAttribute("data-phone-key");
        var pid = phoneBtn.getAttribute("data-phone-id");
        window.__DCI_ORGINFO_HIST_PHONE__ = window.__DCI_ORGINFO_HIST_PHONE__ || {};
        window.__DCI_ORGINFO_HIST_PHONE_LEFT__ =
          window.__DCI_ORGINFO_HIST_PHONE_LEFT__ || {};
        if (b && b.revealPhone) b.revealPhone(key, pid);
        var phoneGuess = (form && form.linkPhone) || "13800008002";
        fetchRealPhone(pid, key, phoneGuess);
      }
    };
  }

  function fetchRealPhone(id, key, fallback) {
    var url =
      "/api/v1/dciManage/dci/regorg/getRealPhone/" +
      encodeURIComponent(id || "0");
    fetch(url, { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (body) {
        var v = body && body.data;
        if (v && typeof v === "object")
          v = v.phonenumber || v.phoneNumber || v.phone || v.linkPhone || "";
        v = v == null ? "" : String(v).trim();
        if (!v) v = fallback;
        if (!v) return;
        window.__DCI_ORGINFO_HIST_PHONE__[key] = v;
        window.__DCI_ORGINFO_HIST_PHONE_LEFT__[key] = 10;
        render();
        if (window.__DCI_ORGINFO_HIST_PHONE_TIMER__)
          clearInterval(window.__DCI_ORGINFO_HIST_PHONE_TIMER__);
        window.__DCI_ORGINFO_HIST_PHONE_TIMER__ = setInterval(function () {
          var left = window.__DCI_ORGINFO_HIST_PHONE_LEFT__[key];
          if (left == null) return;
          left -= 1;
          window.__DCI_ORGINFO_HIST_PHONE_LEFT__[key] = left;
          if (left <= 0) {
            delete window.__DCI_ORGINFO_HIST_PHONE__[key];
            delete window.__DCI_ORGINFO_HIST_PHONE_LEFT__[key];
            clearInterval(window.__DCI_ORGINFO_HIST_PHONE_TIMER__);
          }
          render();
        }, 1000);
      })
      .catch(function () {
        if (fallback) {
          window.__DCI_ORGINFO_HIST_PHONE__[key] = fallback;
          window.__DCI_ORGINFO_HIST_PHONE_LEFT__[key] = 10;
          render();
        }
      });
  }

  function teardown() {
    var container = document.querySelector(".apply-console-container");
    if (container) container.classList.remove(ROOT_CLS);
    var dead = document.getElementById(PAGE_ID);
    if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
  }

  function hook() {
    var wrap = function (type) {
      var orig = history[type];
      return function () {
        var ret = orig.apply(this, arguments);
        setTimeout(render, 0);
        return ret;
      };
    };
    history.pushState = wrap("pushState");
    history.replaceState = wrap("replaceState");
    window.addEventListener("popstate", function () {
      setTimeout(render, 0);
    });
  }

  // Reset expand state whenever entering history view fresh
  function syncExpandOnEnter() {
    var now = isHistoryView();
    if (now && !wasHistory) {
      expanded = Object.create(null); // all collapsed by default
      lastSig = "";
    }
    wasHistory = now;
  }

  function tick() {
    syncExpandOnEnter();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      hook();
      tick();
    });
  } else {
    hook();
    tick();
  }

  setInterval(function () {
    if (!isOrgInfo()) {
      teardown();
      return;
    }
    syncExpandOnEnter();
    // Keep page in sync when Vue finishes loading records
    if (isHistoryView()) render();
  }, 600);

  // Also subscribe via bridge when available
  var unsub = null;
  setInterval(function () {
    var b = bridge();
    if (b && b.subscribeQuery && !unsub) {
      unsub = b.subscribeQuery(function () {
        syncExpandOnEnter();
        render();
      });
    }
  }, 400);
})();
