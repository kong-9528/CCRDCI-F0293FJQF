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

function makeXHR() {
  function XMLHttpRequest() {}
  XMLHttpRequest.prototype.open = function () {};
  XMLHttpRequest.prototype.send = function () {};
  XMLHttpRequest.prototype.setRequestHeader = function () {};
  return XMLHttpRequest;
}

const sandbox = {
  window: {
    location: { href: "http://127.0.0.1/" },
    fetch: undefined,
  },
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
assert(API && typeof API.handle === "function", "missing mock handle");

const pending = API.handle(
  "GET",
  "/api/v1/dciManage/dci/regorg/list?pageNum=1&pageSize=10&auditStatus=0",
);
assert(pending.rows[0].loginUsername === "yachang", "pending#1 yachang");
assert(pending.rows[1].loginUsername === "mayi1", "pending#2 mayi1");

const mine = API.handle(
  "GET",
  "/api/v1/dciManage/dci/regorg/myList?pageNum=1&pageSize=10&auditStatus=1",
);
assert(mine.rows[0].loginUsername === "yachang1", "my#1 yachang1");
assert(mine.rows[1].loginUsername === "mayi", "my#2 mayi");
assert(mine.rows[0].orgCode === "ART", "yachang1 ART");
assert(mine.rows[1].orgCode === "ANT", "mayi ANT");

console.log("OK", {
  pending: pending.rows.slice(0, 2).map((r) => r.loginUsername),
  my: mine.rows.slice(0, 2).map((r) => r.loginUsername),
});
