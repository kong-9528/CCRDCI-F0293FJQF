import fs from "node:fs";
import vm from "node:vm";

const catalogSrc = fs.readFileSync("apps/home/mirror/static/js/dci-query-mock-catalog.js", "utf8");
const mockSrc = fs.readFileSync("apps/home/mirror/static/js/dci-mock-api.js", "utf8");

// syntax check via Function / vm
new Function(catalogSrc);
// mock is IIFE relying on window — just check the listBy block parses
const i = mockSrc.indexOf('if (path === "/dci/applyDoc/listByDciCodeAndKeyword"');
const j = mockSrc.indexOf('if (path === "/businessInterface/listByIds"', i);
const block = mockSrc.slice(i, j);
try {
  new Function("path", "m", "q", "ok", "window", block + ";");
  console.log("mock block syntax ok, chars", block.length);
} catch (e) {
  console.error("mock block syntax fail", e);
  console.log(block.slice(0, 500));
  process.exit(1);
}

// page helpers exist once
const page = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
const n1 = page.split("function __resolveQueryFields(").length - 1;
const n2 = page.split("__renderResultHead(l)").length - 1;
console.log("helper defs", n1, "head calls", n2);
if (n1 !== 1) process.exit(1);
