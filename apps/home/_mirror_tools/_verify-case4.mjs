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
const CODE = "DCI:RBQDJZCPC.156.20250601D4F6H8J0L2";

const sandbox = { window: {}, globalThis: {} };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(catalogJs, sandbox);
const catalog = sandbox.__DCI_QUERY_MOCK_CATALOG__;

function normQuery(s) {
  return String(s || "").trim().replace(/[\s\u3000]+/g, "").toUpperCase();
}
function normKeyword(s) {
  return String(s || "").trim().replace(/[\s\u3000]+/g, "").replace(/[《》]/g, "");
}

const row = catalog.find((r) => r.id === "mock-work-reg-rev");
if (!row) throw new Error("missing case4");
if (row.dciCode !== CODE) throw new Error("bad dci " + row.dciCode);
if (!row.matchCodes.includes(CODE)) throw new Error("matchCodes miss");
const mid = CODE.replace(/^DCI:/i, "").split(".")[0];
if (!/^[RCX][A-Z0-9]{8,11}$/.test(mid)) throw new Error("bad mid " + mid);

const hits = catalog.filter((r) => {
  const codes = (r.matchCodes || []).map(normQuery);
  const keys = (r.matchKeywords || []).map(normKeyword);
  return codes.includes(normQuery(CODE)) && keys.includes(normKeyword("城市速写本"));
});
if (hits.length !== 1 || hits[0].id !== "mock-work-reg-rev") throw new Error("query miss");

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-case4-20261117",
);
fs.writeFileSync(indexHtml, h);
console.log("OK case4:", CODE);
