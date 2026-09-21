/**
 * SSO entry bridge for ops-dci (runs before Vue boot).
 * Consumes ?sso_ticket=… (also buried in ?redirect=) from SSO launcher.
 */
(function () {
  var TOKEN = "mock-root";
  var COOKIE = "Admin-Token";
  var SSO =
    (typeof window.__OPS_DCI_SSO_URL__ === "string" && window.__OPS_DCI_SSO_URL__) ||
    "http://localhost:3003";

  function hasToken() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/);
      return !!(m && m[1] && m[1] !== "undefined");
    } catch (e) {
      return false;
    }
  }

  function setSession(username) {
    try {
      document.cookie = COOKIE + "=" + TOKEN + "; path=/";
      sessionStorage.setItem("ops-dci-mock-user", username || "root");
      sessionStorage.setItem(
        "ops-dci-sso-session",
        JSON.stringify({ username: username || "root", at: Date.now() }),
      );
    } catch (e) {}
  }

  function clearSession() {
    try {
      document.cookie = COOKIE + "=; path=/; Max-Age=0";
      sessionStorage.removeItem("ops-dci-mock-user");
      sessionStorage.removeItem("ops-dci-sso-session");
    } catch (e) {}
  }

  function goSso() {
    var returnUrl = location.origin + "/";
    location.replace(
      SSO.replace(/\/$/, "") +
        "/login?return_url=" +
        encodeURIComponent(returnUrl),
    );
  }

  function readTicket(url) {
    var ticket = url.searchParams.get("sso_ticket");
    var username = url.searchParams.get("username") || "root";
    var displayName = url.searchParams.get("displayName") || username;
    if (ticket) {
      return { ticket: ticket, username: username, displayName: displayName, via: "query" };
    }
    // Vue may bounce to /login?redirect=/index?sso_ticket=...
    var redirect = url.searchParams.get("redirect");
    if (redirect) {
      try {
        var nested = new URL(redirect, location.origin);
        var t2 = nested.searchParams.get("sso_ticket");
        if (t2) {
          return {
            ticket: t2,
            username: nested.searchParams.get("username") || "root",
            displayName: nested.searchParams.get("displayName") || "root",
            via: "redirect",
            cleanPath: nested.pathname || "/",
          };
        }
      } catch (e) {}
    }
    return null;
  }

  var url = new URL(location.href);
  var hit = readTicket(url);
  if (hit) {
    setSession(hit.username);
    url.searchParams.delete("sso_ticket");
    url.searchParams.delete("username");
    url.searchParams.delete("displayName");
    url.searchParams.delete("redirect");
    var path = hit.cleanPath || url.pathname;
    if (/\/login\/?$/.test(path)) path = "/";
    history.replaceState({}, "", path + (url.search || "") + url.hash);
    if (/\/login\/?$/.test(location.pathname)) {
      location.replace(path || "/");
      return;
    }
    window.__OPS_DCI_SSO__ = { clearSession: clearSession, goSso: goSso, hasToken: hasToken };
    return;
  }

  if (!hasToken()) {
    goSso();
    return;
  }

  if (/\/login\/?$/.test(location.pathname)) {
    location.replace("/");
    return;
  }

  window.__OPS_DCI_SSO__ = { clearSession: clearSession, goSso: goSso, hasToken: hasToken };
})();
