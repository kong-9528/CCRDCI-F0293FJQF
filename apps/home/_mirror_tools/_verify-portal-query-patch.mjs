import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portal = path.join(root, "mirror/static/js/portal-CGcjgAeB.js");
const query = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const overrides = path.join(root, "mirror/overrides.css");
const indexHtml = path.join(root, "mirror/index.html");

const p = fs.readFileSync(portal, "utf8");
const q = fs.readFileSync(query, "utf8");
const css = fs.readFileSync(overrides, "utf8");
const h = fs.readFileSync(indexHtml, "utf8");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const expectedH =
  'H=[{name:"雅昌",logo:ge},{name:"蚂蚁集团",logo:ye},{name:"中国标准化研究院",logo:ue},{name:"淘天集团",logo:Be},{name:"更多合作伙伴",more:!0}]';
assert(p.includes(expectedH), "partner order incorrect");
assert(p.includes("partner-card-more"), "more card render missing");
assert(p.includes("更多合作伙伴"), "more label missing");
assert(!p.includes('{name:"中文在线",logo:pe}'), "old partner 中文在线 should be gone from H");
assert(!p.includes('{name:"保利文化",logo:fe}'), "old partner 保利文化 should be gone from H");

assert(q.includes('placeholder:"请输入DCI码或登记号"'), "query placeholder not updated");
// leftover warning text with 登记证书编号 is OK if present; placeholder must not keep old wording
assert(
  !q.includes('placeholder:"请输入DCI码或登记证书编号"'),
  "old placeholder still present",
);

assert(css.includes("partner-card-more"), "more card css missing");
assert(h.includes("overrides.css?v=portal-partners-5-20261118") || h.includes("overrides.css"), "index html ok");

for (const file of [portal, query]) {
  const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  assert(check.status === 0, `syntax fail ${path.basename(file)}: ${check.stderr}`);
}

console.log("OK");
console.log("- partners:", expectedH);
console.log("- query placeholder: 请输入DCI码或登记号");
