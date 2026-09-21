/**
 * Offline mock for ALL /api/v1/dciManage requests in ops-dci mirror.
 * Uses captured payloads in window.__OPS_MOCK_STORE__ when present.
 */
(function () {
  var API_PREFIX = "/api/v1/dciManage";
  var USER = "root";

  function ok(data, extra) {
    var body = { code: 200, msg: "操作成功", data: data === undefined ? null : data };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
      }
    }
    return body;
  }

  function page(rows, total) {
    return {
      code: 200,
      msg: "查询成功",
      rows: rows || [],
      total: total != null ? total : (rows || []).length,
    };
  }

  function parseUrl(raw) {
    var s = String(raw || "");
    try {
      if (/^https?:\/\//i.test(s)) {
        var u = new URL(s);
        return { path: u.pathname, search: u.search, href: s };
      }
    } catch (e) {}
    var q = s.indexOf("?");
    return {
      path: q >= 0 ? s.slice(0, q) : s,
      search: q >= 0 ? s.slice(q) : "",
      href: s,
    };
  }

  function apiPath(raw) {
    var p = parseUrl(raw).path;
    var i = p.indexOf(API_PREFIX);
    if (i >= 0) return p.slice(i + API_PREFIX.length) || "/";
    return p;
  }

  function isDciApi(raw) {
    var s = String(raw || "");
    return s.indexOf(API_PREFIX) >= 0 || s.indexOf("/api/v1/dciManage") >= 0;
  }

  function lookup(method, rawUrl) {
    var store = window.__OPS_MOCK_STORE__ || {};
    var parsed = parseUrl(rawUrl);
    var p = apiPath(rawUrl);
    var m = String(method || "GET").toUpperCase();
    var fullPath = API_PREFIX + (p.charAt(0) === "/" ? p : "/" + p);
    var keys = [
      m + " " + fullPath + parsed.search,
      m + " " + fullPath,
      m + " " + p + parsed.search,
      m + " " + p,
    ];
    for (var i = 0; i < keys.length; i++) {
      if (Object.prototype.hasOwnProperty.call(store, keys[i])) return store[keys[i]];
    }
    return null;
  }

  function parseBody(body) {
    if (body == null || body === "") return {};
    if (typeof body === "object") return body;
    try {
      return JSON.parse(String(body));
    } catch (e) {
      return {};
    }
  }

  function handle(method, rawUrl, body) {
    var m = String(method || "GET").toUpperCase();
    var path = apiPath(rawUrl);
    var data = parseBody(body);

    if (path === "/captchaImage" && m === "GET") {
      // UI reads res.data.captchaEnabled / res.data.img (RuoYi-style nested data)
      return {
        code: 200,
        msg: "操作成功",
        data: {
          captchaEnabled: false,
          uuid: "mock-captcha-uuid",
          img: "",
        },
        captchaEnabled: false,
        uuid: "mock-captcha-uuid",
        img: "",
      };
    }

    if (path === "/login" && m === "POST") {
      var username = String(data.username || "").trim().toLowerCase();
      // Password is RSA-encrypted by the login page; accept any non-empty for root.
      if (username === USER && String(data.password || "").length > 0) {
        try {
          sessionStorage.setItem("ops-dci-mock-user", USER);
          document.cookie = "Admin-Token=mock-root; path=/";
        } catch (e) {}
        return {
          code: 1000000,
          msg: "成功",
          data: { token: "mock-root" },
          success: true,
        };
      }
      return { code: 500, msg: "用户名或密码错误（演示账号 root）", data: null };
    }

    if (path === "/logout" && (m === "POST" || m === "GET")) {
      try {
        sessionStorage.removeItem("ops-dci-mock-user");
        document.cookie = "Admin-Token=; path=/; Max-Age=0";
      } catch (e) {}
      return ok(null);
    }

    var hit = lookup(m, rawUrl);
    if (hit != null) return hit;

    // soft defaults so UI keeps working for uncaptured mutations/queries
    if (m === "GET") {
      if (/list|page|query|Tree/i.test(path)) return page([]);
      return ok(null);
    }
    return ok(null, { msg: "操作成功（演示）" });
  }

  function respondXhr(xhr, payload) {
    var text = JSON.stringify(payload);
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      try {
        Object.defineProperty(xhr, "readyState", {
          configurable: true,
          get: function () {
            return 4;
          },
        });
      } catch (e) {
        try {
          xhr.readyState = 4;
        } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "status", {
          configurable: true,
          get: function () {
            return 200;
          },
        });
      } catch (e) {
        try {
          xhr.status = 200;
        } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "statusText", {
          configurable: true,
          get: function () {
            return "OK";
          },
        });
      } catch (e) {}
      try {
        Object.defineProperty(xhr, "responseText", {
          configurable: true,
          get: function () {
            return text;
          },
        });
      } catch (e) {
        try {
          xhr.responseText = text;
        } catch (e2) {}
      }
      try {
        Object.defineProperty(xhr, "response", {
          configurable: true,
          get: function () {
            return text;
          },
        });
      } catch (e) {
        try {
          xhr.response = text;
        } catch (e2) {}
      }
      xhr.getResponseHeader = function (name) {
        return String(name || "").toLowerCase() === "content-type"
          ? "application/json;charset=utf-8"
          : null;
      };
      xhr.getAllResponseHeaders = function () {
        return "content-type: application/json;charset=utf-8\r\n";
      };
      try {
        if (typeof xhr.onreadystatechange === "function") xhr.onreadystatechange();
      } catch (e) {}
      try {
        if (typeof xhr.onload === "function") xhr.onload();
      } catch (e) {}
      try {
        xhr.dispatchEvent(new Event("readystatechange"));
        xhr.dispatchEvent(new Event("load"));
        xhr.dispatchEvent(new Event("loadend"));
      } catch (e) {}
    }
    setTimeout(finish, 8);
  }

  var XO = XMLHttpRequest.prototype.open;
  var XS = XMLHttpRequest.prototype.send;
  var XH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__opsMockMethod = method;
    this.__opsMockUrl = String(url || "");
    this.__opsMock = isDciApi(this.__opsMockUrl);
    if (this.__opsMock) {
      this.__opsMockHeaders = {};
      try {
        Object.defineProperty(this, "readyState", {
          configurable: true,
          writable: true,
          value: 1,
        });
      } catch (e) {}
      return;
    }
    return XO.apply(this, arguments);
  };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    if (this.__opsMock) {
      this.__opsMockHeaders[k] = v;
      return;
    }
    return XH.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (this.__opsMock) {
      respondXhr(this, handle(this.__opsMockMethod, this.__opsMockUrl, body));
      return;
    }
    return XS.apply(this, arguments);
  };

  if (typeof window.fetch === "function") {
    var realFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : input && input.url;
      if (!isDciApi(url)) return realFetch(input, init);
      var method = (init && init.method) || (input && input.method) || "GET";
      var b = init && init.body;
      return Promise.resolve(
        new Response(JSON.stringify(handle(method, url, b)), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );
    };
  }

  window.__OPS_DCI_MOCK__ = { handle: handle, enabled: true };
})();
