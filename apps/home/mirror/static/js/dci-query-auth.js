/**
 * /dci/query 未登录查询 → 登录后回跳本页并恢复表单。
 * 仅在「查询页点击查询触发登录」时生效；其它入口不写入，postLoginPath 也不劫持。
 */
(function () {
  var KEY = "dci_query_auth_pending";
  var TTL_MS = 30 * 60 * 1000;

  function readRaw() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return null;
      if (obj.at && Date.now() - Number(obj.at) > TTL_MS) {
        sessionStorage.removeItem(KEY);
        return null;
      }
      return obj;
    } catch (e) {
      return null;
    }
  }

  function save(dciCode, keyword) {
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          dciCode: dciCode == null ? "" : String(dciCode),
          keyword: keyword == null ? "" : String(keyword),
          at: Date.now(),
        }),
      );
    } catch (e) {}
  }

  function peek() {
    var obj = readRaw();
    if (!obj) return null;
    return {
      dciCode: obj.dciCode || "",
      keyword: obj.keyword || "",
    };
  }

  function clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch (e) {}
  }

  function has() {
    return !!readRaw();
  }

  /**
   * 仅当存在待恢复表单，且当前仍在查询页（弹窗叠在本页上）时，登录后回 /dci/query。
   * 其它页面登录不受影响，即使 session 里残留 pending。
   */
  function postLoginPath() {
    if (!has()) return null;
    var path = "";
    try {
      path = String(location.pathname || "");
    } catch (e) {}
    if (path.indexOf("/dci/query") >= 0) return "/dci/query";
    return null;
  }

  /** 留在查询页登录成功后，强制同步 cookie + store，刷新顶栏已登录态 */
  function syncNav(userStore) {
    try {
      var M = window.__DCI_MOCK__;
      if (!M || !userStore) return;
      var key = typeof M.currentKey === "function" ? M.currentKey() : null;
      if (!key && userStore.token && typeof M.keyFromToken === "function") {
        key = M.keyFromToken(userStore.token);
      }
      if (!key) return;
      var tok =
        typeof M.tokenFor === "function" ? M.tokenFor(key) : userStore.token;
      if (!tok) return;
      if (typeof M.setSession === "function") M.setSession(key);
      try {
        document.cookie =
          "Admin-Token=" + encodeURIComponent(tok) + "; path=/";
      } catch (e) {}
      userStore.token = tok;
      if (typeof userStore.checkToken === "function") userStore.checkToken();
    } catch (e) {}
  }

  window.__DCI_QUERY_AUTH__ = {
    save: save,
    peek: peek,
    clear: clear,
    has: has,
    postLoginPath: postLoginPath,
    syncNav: syncNav,
  };
})();
