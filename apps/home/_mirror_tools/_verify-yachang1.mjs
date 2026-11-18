import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const authJs = fs.readFileSync(
  path.join(root, "mirror/static/js/dci-mock-auth.js"),
  "utf8",
);
const apiJs = fs.readFileSync(
  path.join(root, "mirror/static/js/dci-mock-api.js"),
  "utf8",
);
const rcxJs = fs.readFileSync(
  path.join(root, "mirror/static/js/dci-rcx-demo.js"),
  "utf8",
);
const indexHtml = path.join(root, "mirror/index.html");

function makeStorage() {
  return {
    _d: {},
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null;
    },
    setItem(k, v) {
      this._d[k] = String(v);
    },
    removeItem(k) {
      delete this._d[k];
    },
  };
}

function makeXHR() {
  function XMLHttpRequest() {
    this.readyState = 0;
    this.status = 0;
    this.responseText = "";
    this.response = "";
    this.onreadystatechange = null;
    this.onload = null;
  }
  XMLHttpRequest.prototype.open = function () {};
  XMLHttpRequest.prototype.send = function () {};
  XMLHttpRequest.prototype.setRequestHeader = function () {};
  XMLHttpRequest.prototype.addEventListener = function () {};
  XMLHttpRequest.prototype.dispatchEvent = function () {};
  return XMLHttpRequest;
}

const sessionStorage = makeStorage();
const localStorage = makeStorage();
const documentStub = {
  cookie: "",
  readyState: "complete",
  body: { appendChild() {} },
  getElementById() {
    return null;
  },
  createElement() {
    return { id: "", textContent: "", innerHTML: "", onclick: null, style: {} };
  },
  addEventListener() {},
  head: { appendChild() {} },
};

const sandbox = {
  window: {
    location: { search: "", pathname: "/" },
    history: {
      pushState() {},
      replaceState() {},
    },
    document: documentStub,
    sessionStorage,
    localStorage,
    addEventListener() {},
    setInterval() {
      return 0;
    },
    clearInterval() {},
    setTimeout(fn) {
      if (typeof fn === "function") fn();
      return 0;
    },
    clearTimeout() {},
    console,
  },
  sessionStorage,
  localStorage,
  document: documentStub,
  location: { search: "", pathname: "/", hash: "" },
  history: {
    pushState() {},
    replaceState() {},
  },
  XMLHttpRequest: makeXHR(),
  setTimeout(fn) {
    if (typeof fn === "function") fn();
    return 0;
  },
  clearTimeout() {},
  setInterval() {
    return 0;
  },
  clearInterval() {},
  console,
  URL,
  URLSearchParams,
  Event: class Event {
    constructor(type) {
      this.type = type;
    }
  },
  Response: class Response {
    constructor(body, init) {
      this._body = body;
      this.status = (init && init.status) || 200;
      this.headers = (init && init.headers) || {};
    }
    json() {
      return Promise.resolve(JSON.parse(this._body));
    }
    text() {
      return Promise.resolve(String(this._body));
    }
  },
};
sandbox.window.XMLHttpRequest = sandbox.XMLHttpRequest;
sandbox.window.fetch = undefined;
sandbox.globalThis = sandbox;

vm.runInNewContext(authJs + "\n" + apiJs, sandbox);

const M = sandbox.window.__DCI_MOCK__;
const API = sandbox.window.__DCI_MOCK_API__;

function assert(c, m) {
  if (!c) throw new Error(m);
}

assert(M && M.USERS && M.USERS.yachang1, "missing yachang1");
const u = M.USERS.yachang1;
assert(u.username === "yachang1", "username");
assert(M.resolveLogin("yachang1", "Abcd1234") === "yachang1", "login");
assert(u.auditStatus === 1, "auditStatus should be approved");
assert(u.techStatus === null, "techStatus should be null (never submitted)");
assert(u.orgName === M.USERS.yachang.orgName, "orgName same as yachang");
assert(u.creditCode === M.USERS.yachang.creditCode, "creditCode same as yachang");
assert(M.openedLabel(u) === "DCI注册中心", "openedLabel");

const seed = M.getApplySeed(u);
assert(seed.orgName === "深圳市雅昌艺术网股份有限公司", "seed org");
assert(seed.orgTypeCode === "NRPT", "seed type");

const org = M.orgPayload(u);
assert(org && org.data && org.data.auditStatus === 1, "orgPayload audit");
assert(org.data.orgCode === "ART", "orgCode ART");
assert(org.data.dciRegOrgCode === "ART", "dciRegOrgCode ART");
assert(org.data.dciCodeType === "原始分配", "dciCodeType 原始分配 only");
assert(
  org.data.dciDataInterface ===
    "实名信息接口,实名信息修改接口,DCI申领数据同步接口,DCI撤销数据同步接口",
  "dciDataInterface four APIs",
);

M.setSession("yachang1");
const apporg = API.handle("GET", "/api/v1/dciManage/dci/apporg/list", {});
assert(apporg && Array.isArray(apporg.rows), "apporg rows");
assert(apporg.rows.length === 1, "yachang1 has exactly 1 apporg");
assert(
  apporg.rows[0].appOrgName === "雅昌艺术家艺术数字文献系统",
  "apporg name",
);
assert(apporg.rows[0].appOrgCode === "DCS00", "apporg code DCS00");
assert(apporg.rows[0].appOrgStatus === "正常", "apporg status");

sandbox.location.pathname = "/dci/info-management";
sandbox.window.location.pathname = "/dci/info-management";
vm.runInNewContext(rcxJs, sandbox);
const RCX = sandbox.window.__DCI_RCX_DEMO__;
RCX.setModeId("configured");
assert(
  JSON.stringify(RCX.resolveCodeTypes()) === JSON.stringify(["原始分配"]),
  "resolveCodeTypes yachang1",
);
const shaped = RCX.shapeOrg({ data: org.data });
assert(shaped.data.orgCode === "ART", "shaped orgCode ART");
assert(shaped.data.dciCodeType === "原始分配", "shaped dciCodeType");
assert(!String(shaped.data.dciCodeType).includes("授权"), "no 授权分配");
assert(!String(shaped.data.dciCodeType).includes("其他"), "no 其他");
assert(
  shaped.data.dciDataInterface === org.data.dciDataInterface,
  "shaped dciDataInterface",
);

assert(Object.keys(M.USERS).length === 5, "expect 5 mock users");

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-mock-auth\.js(\?v=[^"]*)?/,
  "dci-mock-auth.js?v=yachang1-art-20261118",
);
h = h.replace(
  /dci-mock-api\.js(\?v=[^"]*)?/,
  "dci-mock-api.js?v=yachang1-art-20261118",
);
h = h.replace(
  /dci-rcx-demo\.js(\?v=[^"]*)?/,
  "dci-rcx-demo.js?v=yachang1-art-20261118",
);
fs.writeFileSync(indexHtml, h);

console.log("OK yachang1:", {
  login: "yachang1 / Abcd1234",
  orgCode: org.data.orgCode,
  dciCodeType: org.data.dciCodeType,
  apporg: apporg.rows[0],
});
