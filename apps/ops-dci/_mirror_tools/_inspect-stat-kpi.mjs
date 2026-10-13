import fs from "node:fs";

const org = fs.readFileSync(
  new URL("../mirror/static/js/org-BBVj6u8M.js", import.meta.url),
  "utf8",
);
const owner = fs.readFileSync(
  new URL("../mirror/static/js/owner-fg193Azo.js", import.meta.url),
  "utf8",
);

function show(s, label) {
  const i = s.indexOf(label);
  console.log("---", label, i);
  if (i >= 0) console.log(s.slice(Math.max(0, i - 160), i + label.length + 280));
}

for (const label of [
  "新增DCI注册中心",
  "新增DCI申领平台",
  "async function B",
  "kpi-row",
  "kpi-card",
  "span:12",
]) {
  show(org, label);
}

console.log("\n==== OWNER ====\n");
for (const label of [
  "新增著作权人",
  "async function v",
  "kpi-row",
  "kpi-card",
  "span:12",
  "个人",
  "机构",
]) {
  show(owner, label);
}

const oi = org.indexOf("opusDwcrStat");
console.log("\norg import area\n", org.slice(Math.max(0, oi - 220), oi + 60));
const ow = owner.indexOf("opusDwcrStat");
console.log("\nowner import area\n", owner.slice(Math.max(0, ow - 220), ow + 60));

// dump function B roughly
const bStart = org.indexOf("async function B");
console.log("\nfunction B\n", org.slice(bStart, bStart + 900));
const vStart = owner.indexOf("async function v");
console.log("\nfunction v\n", owner.slice(vStart, vStart + 700));
