/**
 * Tech service center open-apply UI (开通管理 → 申请接入).
 * Layout / interaction mirror RegOrgInfo (注册中心申请); fields mirror customer /account edit.
 */
(function () {
  var HOST = null;
  var onBack = null;
  var form = null;
  var mode = "edit"; // edit | view
  var historyOpen = false;
  var histExpanded = Object.create(null); // id -> true; default all collapsed
  var errorMsg = "";
  var toastMsg = "";
  var toastTimer = null;

  function store() {
    return window.__DCI_TECH_STORE__;
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
    if (s === "2") return { label: "不通过", type: "danger" };
    return { label: "未开通", type: "info" };
  }

  function toast(msg) {
    toastMsg = msg;
    render();
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastMsg = "";
      render();
    }, 2200);
  }

  function dash(v) {
    var t = v == null ? "" : String(v).trim();
    return t ? t : "-";
  }

  function formatSize(bytes) {
    if (bytes == null || !isFinite(bytes) || bytes < 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function syncModeFromStatus() {
    var st = store().currentTechStatus();
    // 审核中：只读查看进度；其余可编辑（含已撤回/未通过重新申请）
    mode = st === 0 ? "view" : "edit";
  }

  function loadForm() {
    form = store().getDraft();
    if (!form.contractFileList) form.contractFileList = [];
    syncModeFromStatus();
  }

  function validate() {
    if (!String(form.orgName || "").trim()) return "请输入机构名称";
    if (!String(form.creditCode || "").trim()) return "请输入组织机构代码";
    if (!String(form.orgAddress || "").trim()) return "请输入机构地址";
    if (!String(form.invitationCode || "").trim()) return "请输入邀请码";
    if (!String(form.cooperationField || "").trim()) return "请输入合作领域";
    if (String(form.cooperationField || "").trim().length > 300) return "合作领域不能超过300字";
    if (!String(form.contractStartDate || "").trim()) return "请选择合同开始日期";
    if (!String(form.contractEndDate || "").trim()) return "请选择合同结束日期";
    if (form.contractStartDate > form.contractEndDate) return "合同结束日期不能早于开始日期";
    if (!form.contractFileList || !form.contractFileList.length) return "请上传合同附件";
    if (!String(form.linkName || "").trim()) return "请输入联系人";
    if (!String(form.linkPhone || "").trim()) return "请输入手机号码";
    if (!/^1[3-9]\d{9}$/.test(String(form.linkPhone).replace(/[\s-]/g, ""))) {
      return "请输入正确手机号码";
    }
    return null;
  }

  function fieldRow(label, required, controlHtml, infoTip) {
    return (
      '<div class="el-form-item' +
      (required ? " is-required" : "") +
      ' asterisk-left">' +
      '<label class="el-form-item__label" style="width:160px">' +
      esc(label) +
      (infoTip
        ? '<span class="tech-field-info" title="' + esc(infoTip) + '">ⓘ</span>'
        : "") +
      "</label>" +
      '<div class="el-form-item__content" style="margin-left:160px">' +
      controlHtml +
      "</div></div>"
    );
  }

  function inputHtml(name, placeholder, type) {
    type = type || "text";
    var readonly = mode === "view";
    if (readonly) {
      return '<div class="form-text-value">' + esc(dash(form[name])) + "</div>";
    }
    if (type === "date") {
      return (
        '<div class="el-input el-date-editor el-date-editor--date tech-date-wrap">' +
        '<span class="tech-date-icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.75"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>' +
        "</span>" +
        '<input class="el-input__inner tech-input tech-date-input" data-field="' +
        esc(name) +
        '" type="date" value="' +
        esc(form[name] || "") +
        '" placeholder="年/月/日" />' +
        "</div>"
      );
    }
    return (
      '<div class="el-input el-input--default">' +
      '<input class="el-input__inner tech-input" data-field="' +
      esc(name) +
      '" type="' +
      type +
      '" value="' +
      esc(form[name] || "") +
      '" placeholder="' +
      esc(placeholder) +
      '" />' +
      "</div>"
    );
  }

  function textareaHtml(name, placeholder) {
    if (mode === "view") {
      return '<div class="form-text-value">' + esc(dash(form[name])) + "</div>";
    }
    var val = form[name] || "";
    return (
      '<div class="tech-textarea-wrap el-textarea">' +
      '<textarea class="el-textarea__inner tech-textarea" data-field="' +
      esc(name) +
      '" rows="3" maxlength="300" placeholder="' +
      esc(placeholder) +
      '">' +
      esc(val) +
      "</textarea>" +
      '<span class="tech-textarea-counter">' +
      String(val).length +
      " / 300</span></div>"
    );
  }

  function filesHtml() {
    var list = form.contractFileList || [];
    if (mode === "view") {
      if (!list.length) return '<div class="form-text-value">-</div>';
      return (
        '<div class="upload-wrapper"><div class="file-list">' +
        list
          .map(function (f) {
            var size = formatSize(f.size);
            return (
              '<div class="file-item"><span class="file-name">' +
              esc(f.name) +
              (size ? "（" + size + "）" : "") +
              '</span><a href="javascript:;" class="tech-file-view" data-name="' +
              esc(f.name) +
              '">查看</a></div>'
            );
          })
          .join("") +
        "</div></div>"
      );
    }
    return (
      '<div class="upload-wrapper tech-upload">' +
      '<label class="el-button el-button--primary upload-btn tech-upload-btn">' +
      "点击上传" +
      '<input type="file" accept=".pdf,application/pdf" class="tech-file-input" hidden />' +
      "</label>" +
      '<div class="upload-tip tech-upload-hint">仅支持 PDF 格式，单个文件不超过 10MB</div>' +
      (list.length
        ? '<div class="file-list">' +
          list
            .map(function (f, idx) {
              var size = formatSize(f.size);
              return (
                '<div class="file-item"><span class="file-name">' +
                esc(f.name) +
                (size ? "（" + size + "）" : "") +
                '</span><a href="javascript:;" class="tech-file-remove" data-idx="' +
                idx +
                '">移除</a></div>'
              );
            })
            .join("") +
          "</div>"
        : "") +
      "</div>"
    );
  }

  function alertHtml() {
    var st = store().currentTechStatus();
    if (st === 0) {
      return (
        '<div class="status-alert-wrapper" style="margin-bottom:20px">' +
        '<div class="el-alert el-alert--warning is-light" role="alert">' +
        '<div class="el-alert__content"><span class="el-alert__title">审核中</span>' +
        '<p class="el-alert__description">您提交的技术服务中心开通申请正在由运营管理人员审核中。审核期间可撤回申请；通过后可从开通管理进入技术服务中心工作台。</p>' +
        "</div></div></div>"
      );
    }
    if (st === 2) {
      var hist = store().historyList();
      var last = hist.find(function (r) {
        return String(r.auditStatus) === "2";
      });
      var remark = (last && last.auditRemark) || "审核未通过，请修改后重新提交";
      return (
        '<div class="status-alert-wrapper" style="margin-bottom:20px">' +
        '<div class="el-alert el-alert--error is-light" role="alert">' +
        '<div class="el-alert__content"><span class="el-alert__title">未通过</span>' +
        '<p class="el-alert__description">' +
        esc(remark) +
        "</p></div></div></div>"
      );
    }
    // 未提交 / 已撤回：上方无状态条
    return "";
  }

  function contractRange(row) {
    var a = dash(row.contractStartDate).replace(/ .*$/, "");
    var b = dash(row.contractEndDate).replace(/ .*$/, "");
    if (a === "-" && b === "-") return "-";
    if (a === "-") return b;
    if (b === "-") return a;
    return a + " ~ " + b;
  }

  function histField(label, valueHtml, full) {
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

  function filesDescHtml(row) {
    var list = row.contractFileList || [];
    if ((!list || !list.length) && row.contractFiles) {
      list = String(row.contractFiles)
        .split(",")
        .filter(Boolean)
        .map(function (u) {
          return { name: u.split("/").pop() || "合同附件.pdf", url: u };
        });
    }
    if (!list.length) return "-";
    var html = '<div class="oi-hist-files">';
    for (var i = 0; i < list.length; i++) {
      var f = list[i] || {};
      html +=
        '<div class="oi-hist-file"><span class="oi-hist-file__name">' +
        esc(f.name || "合同附件.pdf") +
        '</span><button type="button" class="oi-hist-file__link tech-file-view" data-name="' +
        esc(f.name || "") +
        '">下载查看</button></div>';
    }
    html += "</div>";
    return html;
  }

  function histCardHtml(row, idx) {
    var id = String(row.id || "tech-hist-" + idx);
    var open = !!histExpanded[id];
    var meta = statusMeta(row.auditStatus);
    var name = dash(row.orgName) === "-" ? "技术服务中心申请" : dash(row.orgName);
    var time = dash(row.createTime || row.submittedAt || row.auditTime);
    var startDate = dash(row.contractStartDate).replace(/ .*$/, "");
    var endDate = dash(row.contractEndDate).replace(/ .*$/, "");
    var resultTag =
      '<span class="oi-hist-tag oi-hist-tag--' + meta.type + '">' + esc(meta.label) + "</span>";

    var panel =
      '<div class="oi-hist-panel" id="tech-hist-panel-' +
      esc(id) +
      '" role="region"' +
      (open ? "" : ' inert aria-hidden="true"') +
      '><div class="oi-hist-panel-inner">' +
      '<section class="oi-hist-block"><h4 class="oi-hist-block__title">基本信息</h4><div class="oi-hist-grid">' +
      histField("机构名称", esc(name)) +
      histField("组织机构代码", esc(dash(row.creditCode))) +
      histField("机构地址", esc(dash(row.orgAddress))) +
      histField("邀请码", esc(dash(row.invitationCode))) +
      histField("合作领域", esc(dash(row.cooperationField)), true) +
      histField("合同开始日期", esc(startDate)) +
      histField("合同结束日期", esc(endDate)) +
      histField("合同附件", filesDescHtml(row), true) +
      '</div></section>' +
      '<section class="oi-hist-block"><h4 class="oi-hist-block__title">联系人信息</h4><div class="oi-hist-grid">' +
      histField("联系人", esc(dash(row.linkName))) +
      histField("手机号码", esc(dash(row.linkPhone))) +
      histField("申请/审核时间", esc(time)) +
      histField("审核结果", resultTag) +
      histField("审核意见 / 原因", esc(dash(row.auditRemark || row.rejectReason)), true) +
      "</div></section></div></div>";

    return (
      '<article class="oi-hist-card' +
      (open ? " is-open" : "") +
      '" data-hist-id="' +
      esc(id) +
      '"><button type="button" class="oi-hist-summary" aria-expanded="' +
      (open ? "true" : "false") +
      '" aria-controls="tech-hist-panel-' +
      esc(id) +
      '"><span class="oi-hist-summary-main"><span class="oi-hist-company" title="' +
      esc(name) +
      '">' +
      esc(name) +
      '</span><span class="oi-hist-meta"><span class="oi-hist-meta-item"><span class="oi-hist-meta-label">合同起止</span><span class="oi-hist-meta-value">' +
      esc(contractRange(row)) +
      '</span></span><span class="oi-hist-meta-item"><span class="oi-hist-meta-label">提交时间</span><span class="oi-hist-meta-value">' +
      esc(time) +
      '</span></span></span></span><span class="oi-hist-aside">' +
      resultTag +
      '<svg class="oi-hist-chevron' +
      (open ? " is-open" : "") +
      '" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' +
      panel +
      "</article>"
    );
  }

  function historyPageHtml() {
    var rows = store().historyList();
    var body =
      '<div class="card-header oi-history-header"><div class="header-left flex-row align-center">' +
      '<button type="button" class="el-button el-button--default oi-history-back" data-action="close-hist"><span>返回</span></button>' +
      '<div class="header-title">历史申请记录</div></div></div>';
    if (!rows.length) {
      body += '<div class="oi-hist-empty">暂无历史申请记录</div>';
    } else {
      body += '<div class="oi-hist-list">';
      for (var i = 0; i < rows.length; i++) body += histCardHtml(rows[i], i);
      body += "</div>";
    }
    return '<div class="main-card oi-history-page is-embedded-card">' + body + "</div>";
  }

  function render() {
    if (!HOST) return;
    var st = store().currentTechStatus();
    var title =
      st === 0
        ? "技术服务中心申请进度"
        : st === 1
          ? "技术服务中心机构信息"
          : "申请接入 DCI®技术服务中心";

    if (historyOpen) {
      HOST.innerHTML =
        '<div class="apply-console-container is-embedded-container tech-apply-root is-orginfo-history-view">' +
        (toastMsg ? '<div class="tech-toast">' + esc(toastMsg) + "</div>" : "") +
        historyPageHtml() +
        "</div>";
      bind();
      return;
    }

    HOST.innerHTML =
      '<div class="apply-console-container is-embedded-container tech-apply-root">' +
      (toastMsg ? '<div class="tech-toast">' + esc(toastMsg) + "</div>" : "") +
      '<div class="el-card main-card is-always-shadow is-embedded-card">' +
      '<div class="card-header flex-row justify-between align-center is-embedded-header">' +
      '<div class="header-left flex-row align-center">' +
      '<button type="button" class="el-button back-open-btn" data-action="back">' +
      '<span class="tech-back-chevron">‹</span> 返回开通管理' +
      "</button>" +
      '<div class="header-icon-wrapper" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.75"/><path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>' +
      "</div>" +
      '<span class="header-title">' +
      esc(title) +
      "</span></div>" +
      '<div class="header-right flex-row align-center" style="gap:10px">' +
      '<button type="button" class="el-button history-btn" data-action="history">' +
      '<span class="tech-hist-btn-icon" aria-hidden="true">☰</span> 历史申请记录' +
      "</button>" +
      "</div></div>" +
      '<div class="el-card__body">' +
      alertHtml() +
      '<form class="apply-form el-form el-form--default is-embedded-form tech-apply-form" onsubmit="return false">' +
      '<div class="section-title"><span>基本信息</span></div>' +
      fieldRow("机构名称", true, inputHtml("orgName", "请输入机构名称")) +
      fieldRow("组织机构代码", true, inputHtml("creditCode", "请输入组织机构代码")) +
      fieldRow("机构地址", true, inputHtml("orgAddress", "请输入机构地址")) +
      fieldRow("邀请码", true, inputHtml("invitationCode", "请输入邀请码")) +
      fieldRow(
        "合作领域",
        true,
        textareaHtml("cooperationField", "请输入合作领域，如电商领域、艺术领域等"),
        "请填写与贵机构业务相关的合作领域，如电商领域、艺术领域等。",
      ) +
      fieldRow("合同开始日期", true, inputHtml("contractStartDate", "年/月/日", "date")) +
      fieldRow("合同结束日期", true, inputHtml("contractEndDate", "年/月/日", "date")) +
      fieldRow("合同附件", true, filesHtml()) +
      '<div class="custom-divider"></div>' +
      '<div class="section-title"><span>联系人信息</span></div>' +
      fieldRow("联系人", true, inputHtml("linkName", "请输入联系人")) +
      fieldRow("手机号码", true, inputHtml("linkPhone", "请输入手机号码")) +
      (errorMsg ? '<div class="tech-form-error">' + esc(errorMsg) + "</div>" : "") +
      (mode === "edit"
        ? '<div class="submit-action">' +
          '<button type="button" class="el-button el-button--primary submit-btn" data-action="submit">提交申请</button>' +
          '<button type="button" class="el-button" data-action="cancel">取消申请</button>' +
          "</div>"
        : '<div class="submit-action">' +
          '<button type="button" class="el-button el-button--primary submit-btn" data-action="revoke">撤回申请</button>' +
          "</div>") +
      "</form></div></div>" +
      "</div>";

    bind();
  }

  function bind() {
    if (!HOST) return;
    HOST.querySelectorAll("[data-field]").forEach(function (el) {
      var field = el.getAttribute("data-field");
      el.addEventListener("input", function () {
        form[field] = el.value;
        if (field === "cooperationField") {
          var counter = HOST.querySelector(".tech-textarea-counter");
          if (counter) counter.textContent = String(el.value.length) + " / 300";
        }
      });
    });

    var fileInput = HOST.querySelector(".tech-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
          toast("仅支持上传 PDF 文件");
          fileInput.value = "";
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast("文件不能超过 10MB");
          fileInput.value = "";
          return;
        }
        form.contractFileList = [
          {
            name: file.name,
            size: file.size,
            url: "demo://" + file.name,
            file: file,
          },
        ];
        errorMsg = "";
        render();
        toast("合同文件已准备，提交申请时一并上报");
      });
    }

    HOST.querySelectorAll(".tech-file-remove").forEach(function (el) {
      el.addEventListener("click", function () {
        var idx = Number(el.getAttribute("data-idx"));
        form.contractFileList.splice(idx, 1);
        render();
      });
    });

    HOST.querySelectorAll(".tech-file-view").forEach(function (el) {
      el.addEventListener("click", function () {
        toast("演示：预览 " + (el.getAttribute("data-name") || "附件"));
      });
    });

    HOST.querySelectorAll("[data-action]").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        var act = el.getAttribute("data-action");
        if (act === "back" || act === "cancel") {
          if (act === "cancel" && mode === "edit") {
            if (!window.confirm("取消申请后将放弃本次未提交的修改，确定取消吗？")) return;
          }
          // Do NOT clear Vue-managed DOM here — let onBack flip view mode,
          // then the host ref(null) path unmounts cleanly.
          if (typeof onBack === "function") onBack();
          else unmount();
          return;
        }
        if (act === "history" || act === "close-hist") {
          if (act === "close-hist") {
            historyOpen = false;
            render();
            return;
          }
          historyOpen = true;
          histExpanded = Object.create(null); // enter fresh → all collapsed
          render();
          return;
        }
        if (act === "submit") {
          errorMsg = validate();
          if (errorMsg) {
            render();
            return;
          }
          var payload = {
            id: form.id,
            orgName: String(form.orgName).trim(),
            creditCode: String(form.creditCode).trim(),
            orgAddress: String(form.orgAddress).trim(),
            invitationCode: String(form.invitationCode).trim(),
            cooperationField: String(form.cooperationField).trim(),
            contractStartDate: form.contractStartDate,
            contractEndDate: form.contractEndDate,
            linkName: String(form.linkName).trim(),
            linkPhone: String(form.linkPhone).trim(),
            contractFileList: (form.contractFileList || []).map(function (f) {
              return { name: f.name, size: f.size, url: f.url || "" };
            }),
          };
          var isResubmit = !!payload.id || store().currentTechStatus() === 2 || store().currentTechStatus() === 3;
          if (isResubmit) store().resubmit(payload);
          else store().apply(payload);
          toast(isResubmit ? "技术服务中心申请已重新提交，请等待审核！" : "技术服务中心申请已成功提交，请等待审核！");
          loadForm();
          render();
          return;
        }
        if (act === "revoke") {
          if (!window.confirm("撤回后申请数据将恢复为可编辑状态，是否确认撤回该申请？")) return;
          var id = form.id || (store().historyList()[0] && store().historyList()[0].id);
          if (!id) {
            toast("未找到有效申请ID");
            return;
          }
          store().revoke(id);
          toast("申请撤回成功！已为您恢复可编辑状态。");
          loadForm();
          render();
        }
      });
    });

    var mask = HOST.querySelector(".tech-hist-mask");
    if (mask) {
      mask.addEventListener("click", function (ev) {
        if (ev.target === mask || (ev.target.classList && ev.target.classList.contains("el-overlay-dialog"))) {
          historyOpen = false;
          render();
        }
      });
    }

    // Expand / collapse history cards (org-info interaction)
    HOST.querySelectorAll(".oi-hist-summary").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var art = btn.closest(".oi-hist-card");
        if (!art) return;
        var hid = art.getAttribute("data-hist-id");
        if (!hid) return;
        if (histExpanded[hid]) delete histExpanded[hid];
        else histExpanded[hid] = true;
        render();
      });
    });
  }

  function mount(el, opts) {
    HOST = el;
    onBack = (opts && opts.onBack) || null;
    historyOpen = false;
    histExpanded = Object.create(null);
    errorMsg = "";
    loadForm();
    render();
  }

  function unmount() {
    if (HOST) HOST.innerHTML = "";
    HOST = null;
    onBack = null;
  }

  function isMounted() {
    return !!HOST;
  }

  window.__DCI_TECH_APPLY__ = {
    mount: mount,
    unmount: unmount,
    isMounted: isMounted,
    remount: function () {
      if (HOST) {
        loadForm();
        render();
      }
    },
    refresh: function () {
      if (!HOST) return;
      loadForm();
      syncModeFromStatus();
      render();
    },
  };
})();
