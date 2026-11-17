import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogJs = fs.readFileSync(
  path.join(root, "mirror/static/js/dci-query-mock-catalog.js"),
  "utf8",
);
const indexHtml = path.join(root, "mirror/index.html");

const sandbox = { window: {}, globalThis: {} };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(catalogJs, sandbox);
const catalog = sandbox.__DCI_QUERY_MOCK_CATALOG__;

const CODE = "DCI:RBQDJZCPC.156.20260120C3E5G7I9K1";
const ORG = "中国版权保护中心";

function normQuery(s) {
  return String(s || "").trim().replace(/[\s\u3000]+/g, "").toUpperCase();
}
function normKeyword(s) {
  return String(s || "").trim().replace(/[\s\u3000]+/g, "").replace(/[《》]/g, "");
}

const row = catalog.find((r) => r.id === "mock-work-reg-ok");
if (!row) throw new Error("missing case3");
if (row.dciCode !== CODE) throw new Error("bad dciCode " + row.dciCode);
if (!row.matchCodes.includes(CODE)) throw new Error("matchCodes missing dci");
if (row.regOrgName !== ORG) throw new Error("regOrgName");
const orgField = row.fields.find((f) => f.label === "DCI注册中心");
if (!orgField || orgField.value !== ORG) throw new Error("org field");

const mid = CODE.replace(/^DCI:/i, "").split(".")[0];
if (!/^[RCX][A-Z0-9]{8,11}$/.test(mid)) throw new Error("bad mid " + mid);

const codeOrReg = normQuery(CODE);
const kw = normKeyword("海风摄影集");
const hits = catalog.filter((r) => {
  const codes = (r.matchCodes || []).map(normQuery);
  const keys = (r.matchKeywords || []).map(normKeyword);
  return codes.includes(codeOrReg) && keys.includes(kw);
});
if (hits.length !== 1 || hits[0].id !== "mock-work-reg-ok") {
  throw new Error("query miss");
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-case3-20261117",
);
fs.writeFileSync(indexHtml, h);
console.log("OK case3:", CODE, ORG);
