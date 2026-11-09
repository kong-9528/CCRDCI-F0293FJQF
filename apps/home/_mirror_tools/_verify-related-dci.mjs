import fs from "node:fs";
import vm from "node:vm";

const page = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
const css = fs.readFileSync("apps/home/mirror/static/css/index-DogJsFVJ.css", "utf8");
console.log({
  helper: page.includes("function __renderRelatedDci("),
  call: page.includes("__renderRelatedDci(l)"),
  css: css.includes(".result-related-dci"),
  fontWeight: /result-related-dci[^}]*font-weight:400/.test(css),
});

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("apps/home/mirror/static/js/dci-query-mock-catalog.js", "utf8"), sandbox);
const z11 = sandbox.window.__DCI_QUERY_MOCK_CATALOG__.find((x) => x.id === "mock-z11-1");
const soft = sandbox.window.__DCI_QUERY_MOCK_CATALOG__.find((x) => x.id === "mock-r11-1");
const dci = sandbox.window.__DCI_QUERY_MOCK_CATALOG__.find((x) => x.id === "mock-dci11-1");
console.log("z11", z11.dciCode);
console.log("r11", soft.dciCode);
console.log("dci kind", dci.kind, dci.dciCode);
