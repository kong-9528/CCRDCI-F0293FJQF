/**
 * Tech-service-center (技术服务中心) open-apply mock store.
 * Status codes mirror 注册中心 auditStatus: null/-1 未开通, 0 审核中, 1 已通过, 2 未通过, 3 已撤回.
 * Fields align with customer /account change-apply (no 拼音 / 注册中心类型 / 标识码).
 */
(function () {
  var SS_KEY = "dci-tech-apply-store";

  function nowStamp() {
    var d = new Date();
    function p(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    return (
      d.getFullYear() +
      "-" +
      p(d.getMonth() + 1) +
      "-" +
      p(d.getDate()) +
      " " +
      p(d.getHours()) +
      ":" +
      p(d.getMinutes()) +
      ":" +
      p(d.getSeconds())
    );
  }

  function loadRaw() {
    try {
      var raw = sessionStorage.getItem(SS_KEY);
      if (raw) return JSON.parse(raw) || {};
    } catch (e) {}
    return {};
  }

  function saveRaw(map) {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function userKey() {
    try {
      var M = window.__DCI_MOCK__;
      return (M && M.currentKey && M.currentKey()) || "anon";
    } catch (e) {
      return "anon";
    }
  }

  function seedHistory(u) {
    if (!u) return [];
    var name = u.username || "demo";
    // yachang：开通申请演示用「已撤回 / 不通过」历史（尚未开通）
    if (name === "yachang") {
      return [
        {
          id: "tech-h-withdrawn-yachang",
          submittedAt: "2026-06-18 11:20:00",
          createTime: "2026-06-18 11:20:00",
          auditStatus: "3",
          auditRemark: "申请人主动撤回本次技术服务中心开通申请",
          orgName: u.orgName || "深圳市雅昌艺术网股份有限公司",
          creditCode: u.creditCode || "91440300724726181Q",
          orgAddress: u.orgAddress || "深圳市南山区深云路19号",
          invitationCode: "TECH-YC-0601",
          cooperationField: "艺术品数字版权确权与展览内容核验",
          contractStartDate: "2026-07-01",
          contractEndDate: "2027-06-30",
          contractFileList: [{ name: "雅昌-技术服务开通申请-撤回稿.pdf", url: "demo://yc-tech-withdrawn.pdf" }],
          linkName: "王敏",
          linkPhone: u.phonenumber || "13900001111",
        },
        {
          id: "tech-h-rejected-yachang",
          submittedAt: "2026-08-05 15:42:00",
          createTime: "2026-08-05 15:42:00",
          auditStatus: "2",
          auditRemark: "合同起止日期与邀请码备案信息不一致，请核对后重新提交",
          orgName: u.orgName || "深圳市雅昌艺术网股份有限公司",
          creditCode: u.creditCode || "91440300724726181Q",
          orgAddress: "深圳市南山区科技园南区",
          invitationCode: "TECH-YC-0802",
          cooperationField: "数字内容发行、版权运营",
          contractStartDate: "2026-03-01",
          contractEndDate: "2027-02-28",
          contractFileList: [{ name: "雅昌-技术服务开通申请-驳回稿.pdf", url: "demo://yc-tech-rejected.pdf" }],
          linkName: "赵强",
          linkPhone: "13700005566",
        },
      ];
    }
    // Account-center tech apply only covers pre-approval lifecycle — never seed「已通过」
    return [];
  }

  function mergeSeedHistory(existing, seeded) {
    var list = Array.isArray(existing) ? existing.slice() : [];
    var ids = {};
    list.forEach(function (r) {
      if (r && r.id) ids[String(r.id)] = true;
    });
    (seeded || []).forEach(function (row) {
      if (!row || !row.id || ids[String(row.id)]) return;
      list.push(row);
    });
    list.sort(function (a, b) {
      var ta = String((a && (a.submittedAt || a.createTime)) || "");
      var tb = String((b && (b.submittedAt || b.createTime)) || "");
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    });
    return list;
  }

  function ensureBucket(key) {
    var map = loadRaw();
    var M = window.__DCI_MOCK__;
    // Read USERS directly — do NOT call M.getUser (it may touch this store).
    var u = M && M.USERS && key ? M.USERS[key] : null;
    var seeded = seedHistory(u);
    var SEED_VER = 3; // v3: drop account-center「已通过」seeds
    if (!map[key]) {
      var st =
        u && u.techStatus !== undefined && u.techStatus !== null
          ? Number(u.techStatus)
          : null;
      map[key] = {
        techStatus: st,
        draft: null,
        history: seeded.slice(),
        seedVer: SEED_VER,
      };
      saveRaw(map);
    } else {
      var hist = Array.isArray(map[key].history) ? map[key].history.slice() : [];
      // Purge any persisted「已通过」rows from account-center store
      var purged = hist.filter(function (r) {
        return String((r && r.auditStatus) || "") !== "1";
      });
      var merged = seeded.length ? mergeSeedHistory(purged, seeded) : purged;
      var changed =
        map[key].seedVer !== SEED_VER ||
        merged.length !== hist.length ||
        (seeded.length && merged.length !== purged.length);
      if (changed) {
        map[key].history = merged;
        map[key].seedVer = SEED_VER;
        saveRaw(map);
      }
    }
    return map;
  }

  function getState() {
    var key = userKey();
    var map = ensureBucket(key);
    return map[key];
  }

  function setState(patch) {
    var key = userKey();
    var map = ensureBucket(key);
    map[key] = Object.assign({}, map[key], patch || {});
    saveRaw(map);
    syncUserTechStatus(map[key].techStatus);
    return map[key];
  }

  function syncUserTechStatus(st) {
    try {
      var M = window.__DCI_MOCK__;
      var key = M && M.currentKey && M.currentKey();
      if (key && M.USERS && M.USERS[key]) {
        M.USERS[key].techStatus = st === null || st === undefined ? null : Number(st);
      }
    } catch (e) {}
  }

  function currentTechStatus() {
    var st = getState().techStatus;
    if (st === null || st === undefined || Number.isNaN(Number(st))) {
      try {
        var M = window.__DCI_MOCK__;
        var key = M && M.currentKey && M.currentKey();
        var u = key && M.USERS ? M.USERS[key] : null;
        if (u && u.techStatus !== undefined && u.techStatus !== null) return Number(u.techStatus);
      } catch (e) {}
      return null;
    }
    return Number(st);
  }

  function blankDraft(u) {
    u = u || {};
    // First-time apply: empty like 注册中心申请；联系人手机默认带出账号信息便于填写
    return {
      id: undefined,
      orgName: "",
      creditCode: "",
      orgAddress: "",
      invitationCode: "",
      cooperationField: "",
      contractStartDate: "",
      contractEndDate: "",
      linkName: "",
      linkPhone: u.phonenumber || "",
      contractFileList: [],
    };
  }

  function getDraft() {
    var st = getState();
    if (st.draft) return JSON.parse(JSON.stringify(st.draft));
    var M = window.__DCI_MOCK__;
    var u = (M && M.currentUser && M.currentUser()) || {};
    return blankDraft(u);
  }

  function historyList() {
    // Account-center tech apply: exclude「已通过」(approved orgs manage via workbench)
    return (getState().history || []).filter(function (r) {
      return String((r && r.auditStatus) || "") !== "1";
    });
  }

  function apply(payload) {
    var row = Object.assign({}, payload, {
      id: payload.id || "tech-app-" + Date.now(),
      submittedAt: nowStamp(),
      createTime: nowStamp(),
      auditStatus: "0",
      auditRemark: "用户提交申请，等待审核中",
    });
    var hist = historyList();
    hist.unshift(row);
    setState({
      techStatus: 0,
      draft: Object.assign({}, payload, { id: row.id }),
      history: hist,
    });
    return row;
  }

  function resubmit(payload) {
    return apply(payload);
  }

  function revoke(id) {
    var hist = historyList().map(function (r) {
      if (String(r.id) === String(id) && String(r.auditStatus) === "0") {
        return Object.assign({}, r, {
          auditStatus: "3",
          auditRemark: "申请人已撤回申请",
        });
      }
      return r;
    });
    var draft = getDraft();
    if (draft && String(draft.id) === String(id)) {
      draft = Object.assign({}, draft);
    }
    setState({ techStatus: 3, draft: draft, history: hist });
    return true;
  }

  /** Demo helpers (optional console) */
  function approvePending() {
    var hist = historyList();
    var hit = hist.find(function (r) {
      return String(r.auditStatus) === "0";
    });
    if (!hit) return false;
    hist = hist.map(function (r) {
      if (r.id === hit.id) {
        return Object.assign({}, r, { auditStatus: "1", auditRemark: "审核通过" });
      }
      return r;
    });
    setState({ techStatus: 1, history: hist });
    return true;
  }

  function rejectPending(reason) {
    var hist = historyList();
    var hit = hist.find(function (r) {
      return String(r.auditStatus) === "0";
    });
    if (!hit) return false;
    hist = hist.map(function (r) {
      if (r.id === hit.id) {
        return Object.assign({}, r, {
          auditStatus: "2",
          auditRemark: reason || "资料不完整，请修改后重新提交",
        });
      }
      return r;
    });
    setState({ techStatus: 2, history: hist });
    return true;
  }

  window.__DCI_TECH_STORE__ = {
    currentTechStatus: currentTechStatus,
    getDraft: getDraft,
    setDraft: function (d) {
      setState({ draft: d });
    },
    historyList: historyList,
    apply: apply,
    resubmit: resubmit,
    revoke: revoke,
    approvePending: approvePending,
    rejectPending: rejectPending,
    blankDraft: blankDraft,
  };
})();
