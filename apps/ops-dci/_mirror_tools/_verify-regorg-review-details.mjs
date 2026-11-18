import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storeJs = fs.readFileSync(
  path.join(root, "mirror/static/js/ops-mock-store.js"),
  "utf8",
);
const apiJs = fs.readFileSync(
  path.join(root, "mirror/static/js/ops-mock-api.js"),
  "utf8",
);

const VALID = new Set([
  "2080587923100037121",
  "2080588010370920449",
  "2080588682629771266",
  "2080588786392657922",
]);

function makeXHR() {
  function XMLHttpRequest() {}
  XMLHttpRequest.prototype.open = function () {};
  XMLHttpRequest.prototype.send = function () {};
  XMLHttpRequest.prototype.setRequestHeader = function () {};
  return XMLHttpRequest;
}

const sandbox = {
  window: { location: { href: "http://127.0.0.1/" }, fetch: undefined },
  XMLHttpRequest: makeXHR(),
  console,
  URL,
  URLSearchParams,
  setTimeout(fn) {
    if (typeof fn === "function") fn();
    return 0;
  },
};
sandbox.window.XMLHttpRequest = sandbox.XMLHttpRequest;
sandbox.globalThis = sandbox;
vm.runInNewContext(storeJs + "\n" + apiJs, sandbox);
const API = sandbox.window.__OPS_DCI_MOCK__;

function assert(c, m) {
  if (!c) throw new Error(m);
}
assert(API && API.handle, "missing handle");

function ifaceIds(row) {
  const raw = row.apiPermissions;
  if (!raw) return [];
  if (typeof raw === "string" && raw.startsWith("[")) {
    return JSON.parse(raw).map((x) => String(x.interfaceId || x.id || ""));
  }
  if (/^\d+$/.test(String(raw))) return [String(raw)];
  return [];
}

const pending = API.handle(
  "GET",
  "/api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=0",
);
const mayi1 = pending.rows.find((r) => r.loginUsername === "mayi1");
assert(mayi1, "pending mayi1");
assert(mayi1.orgTypeCode === "ZYFW", "pending mayi1 type code");
assert(mayi1.orgTypeName === "专业服务", "pending mayi1 type name");

const myPass = API.handle(
  "GET",
  "/api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1",
);
const mayi = myPass.rows.find((r) => r.loginUsername === "mayi");
assert(mayi && mayi.orgTypeName === "专业服务", "my mayi type");
assert(
  myPass.rows.every((r) => r.orgCode && String(r.orgCode).trim()),
  "my pass all orgCode filled",
);
for (const r of myPass.rows) {
  for (const id of ifaceIds(r)) {
    assert(VALID.has(id), "my invalid iface " + id + " @" + r.loginUsername);
  }
}

const allPass = API.handle(
  "GET",
  "/api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=1",
);
const allMayi = allPass.rows.find((r) => r.loginUsername === "mayi");
assert(allMayi && allMayi.orgTypeName === "专业服务", "all mayi type");
for (const r of allPass.rows) {
  for (const id of ifaceIds(r)) {
    assert(VALID.has(id), "all invalid iface " + id + " @" + r.loginUsername);
  }
}

const myReject = API.handle(
  "GET",
  "/api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=2",
);
assert(myReject.rows.length >= 3, "reject rows exist");
assert(
  myReject.rows.every((r) => String(r.auditStatus) === "2" && r.auditRemark),
  "reject remarks present",
);
assert(
  myReject.rows.every((r) => !String(r.auditRemark).includes("标识码")),
  "reject remarks must not mention 标识码",
);

console.log("OK regorg review details", {
  pendingMayi1: mayi1.orgTypeName,
  myMayi: mayi.orgTypeName,
  myCodes: myPass.rows.map((r) => r.orgCode),
  rejectRemarks: myReject.rows.map((r) => r.auditRemark),
});
