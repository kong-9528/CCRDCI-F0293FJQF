import fs from "node:fs";
import path from "node:path";

const dir = "apps/ops-dci/mirror/static/js";
for (const f of fs.readdirSync(dir)) {
  if (!/\.js$/.test(f)) continue;
  if (/allocation|Alloc/i.test(f)) console.log("file", f);
}
const s = fs.readFileSync(path.join(dir, "index-DsYmzmNg.js"), "utf8");
const matches = [...s.matchAll(/allocation[^"'\\\s]{0,60}/gi)].slice(0, 20);
console.log("index matches", matches.map((m) => m[0]));
const i = s.indexOf('dci/codeManage/allocation');
console.log("path alloc", i, i >= 0 ? s.slice(i - 100, i + 200) : "");
const j = s.indexOf("DciCodeManage");
console.log("snippet around codeManage route children already known");

// component map for allocation
const k = s.indexOf('codeManage/allocation');
console.log("codeManage/allocation idx", k, k >= 0 ? s.slice(k - 150, k + 250) : "none");
