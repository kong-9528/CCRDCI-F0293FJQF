/**
 * SSO entry bridge for ops-dci (runs before Vue boot).
 *
 * Rules:
 * 1) Arrive with ?sso_ticket=… → establish session and enter app (bypass /login)
 * 2) Visit http://localhost:3030/ alone → keep local RuoYi /login page (no forced SSO bounce)
 */
(function () {
  var TOKEN = "mock-root";
  var COOKIE = "Admin-Token";
  var FROM_SSO_KEY = "ops-dci-from-sso";
  var SSO =
    (typeof window.__OPS_DCI_SSO_URL__ === "string" && window.__OPS_DCI_SSO_URL__) ||
    "http://localhost:3003";

  function hasToken() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)Admin-Token=([^;]*)/);
      if (m && m[1] && m[1] !== "undefined" && decodeURIComponent(m[1]) !== "") return true;
    } catch (e) {}
    return false;
  }

  function setCookieToken() {
    // Write both raw and encoded forms so js-cookie / document.cookie both see it
    var expires = "; path=/; max-age=86400; SameSite=Lax";
    document.cookie = COOKIE + "=" + TOKEN + expires;
    document.cookie =
      encodeURIComponent(COOKIE) + "=" + encodeURIComponent(TOKEN) + expires;
  }

  function setSession(username) {
    try {
      setCookieToken();
      sessionStorage.setItem("ops-dci-mock-user", username || "root");
      sessionStorage.setItem(
        "ops-dci-sso-session",
        JSON.stringify({ username: username || "root", at: Date.now(), fromSso: true }),
      );
      sessionStorage.setItem(FROM_SSO_KEY, "1");
    } catch (e) {}
  }

  function clearSession() {
    try {
      document.cookie = COOKIE + "=; path=/; Max-Age=0";
      document.cookie = encodeURIComponent(COOKIE) + "=; path=/; Max-Age=0";
      sessionStorage.removeItem("ops-dci-mock-user");
      sessionStorage.removeItem("ops-dci-sso-session");
      sessionStorage.removeItem(FROM_SSO_KEY);
    } catch (e) {}
  }

  /** Optional: open SSO (used by logout / launcher), not on cold visit */
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
    // Vue may bury ticket in ?redirect=/index?sso_ticket=...
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

  function enterApp(preferredPath) {
    // Prefer `/` for full page loads. Hard-navigating to `/index` hits a
    // no-extension COS object and the browser downloads a file named "index".
    var path = preferredPath || "/";
    if (/\/login\/?$/.test(path) || path === "/index" || path === "/index/") path = "/";
    if (!path) path = "/";
    var next = path;
    if (location.pathname + location.search + location.hash !== next) {
      location.replace(next);
      return true;
    }
    return false;
  }

  /**
   * After Vue boots, pinia may have captured empty token before cookie settled.
   * If we came from SSO (or have cookie) but landed on /login, force enter app.
   */
  function watchBypassLogin() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var fromSso = false;
      try {
        fromSso = sessionStorage.getItem(FROM_SSO_KEY) === "1";
      } catch (e) {}
      if (!fromSso && !hasToken()) {
        if (tries > 40) clearInterval(timer);
        return;
      }
      // Re-assert cookie each tick (survives pinia/logOut races during boot)
      if (fromSso || hasToken()) setCookieToken();
      if (/\/login\/?$/.test(location.pathname) && (fromSso || hasToken())) {
        clearInterval(timer);
        enterApp("/");
        return;
      }
      // Cleared login successfully
      if (!/\/login\/?$/.test(location.pathname) && hasToken()) {
        try {
          sessionStorage.removeItem(FROM_SSO_KEY);
        } catch (e2) {}
        clearInterval(timer);
        return;
      }
      if (tries > 40) clearInterval(timer);
    }, 100);
  }

  var url = new URL(location.href);
  var hit = readTicket(url);

  // —— 1) SSO ticket: establish session and enter app (bypass login) ——
  if (hit) {
    setSession(hit.username);
    url.searchParams.delete("sso_ticket");
    url.searchParams.delete("username");
    url.searchParams.delete("displayName");
    url.searchParams.delete("redirect");
    var path = hit.cleanPath || url.pathname || "/";
    if (/\/login\/?$/.test(path) || path === "/" || path === "/index" || path === "/index/") {
      path = "/";
    }
    var qs = url.search || "";
    var next = path + qs + (url.hash || "");
    window.__OPS_DCI_SSO__ = {
      clearSession: clearSession,
      goSso: goSso,
      hasToken: hasToken,
      fromSso: true,
    };
    watchBypassLogin();
    if (location.pathname + location.search + location.hash !== next) {
      location.replace(next);
      return;
    }
    return;
  }

  // —— 2) Cold visit / local login: do NOT force SSO ——
  // If already authenticated and on /login, go to app
  if (hasToken() && /\/login\/?$/.test(location.pathname)) {
    enterApp("/");
    window.__OPS_DCI_SSO__ = { clearSession: clearSession, goSso: goSso, hasToken: hasToken };
    return;
  }

  // Recently from SSO but ticket stripped — still bypass login if cookie/session exists
  try {
    if (sessionStorage.getItem(FROM_SSO_KEY) === "1") {
      setCookieToken();
      watchBypassLogin();
      if (/\/login\/?$/.test(location.pathname)) {
        enterApp("/");
      }
    }
  } catch (e) {}

  window.__OPS_DCI_SSO__ = { clearSession: clearSession, goSso: goSso, hasToken: hasToken };
})();
