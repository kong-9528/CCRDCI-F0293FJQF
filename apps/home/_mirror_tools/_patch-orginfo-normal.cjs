const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

// 1) Remove idle/正常 banner entirely
const idleBanner =
  'xe.value&&geIdle.value?(o(),p(v,{key:1,title:"无状态",type:"info",description:"当前无待审变更。您可以点击下方「更新」修改机构信息并提交审核。","show-icon":"",closable:!1})):x("",!0)';
const idleGone = 'x("",!0)';
if (!s.includes(idleBanner)) {
  if (s.includes('title:"无状态"')) {
    console.error("idle banner pattern changed but title still present");
    process.exit(1);
  }
  console.log("idle banner already removed");
} else {
  s = s.replace(idleBanner, idleGone);
  console.log("idle banner removed");
}

// 2) 审核中 tip: 无状态 → 正常
const oldAuditDesc =
  "若申请被驳回或您主动撤回，页面将恢复为无状态，并继续展示最近一次审核通过的机构信息。";
const newAuditDesc =
  "若申请被驳回或您主动撤回，页面将恢复为正常，并继续展示最近一次审核通过的机构信息。";
if (s.includes(oldAuditDesc)) {
  s = s.replace(oldAuditDesc, newAuditDesc);
  console.log("audit banner wording updated");
} else {
  console.log("audit banner wording skip");
}

// 3) History status label: 通过 → 已通过
const oldLabel =
  'String(n.auditStatus)==="1"?"通过":String(n.auditStatus)==="0"?"审核中":String(n.auditStatus)==="3"?"已撤回":"不通过"';
const newLabel =
  'String(n.auditStatus)==="1"?"已通过":String(n.auditStatus)==="0"?"审核中":String(n.auditStatus)==="3"?"已撤回":"不通过"';
if (s.includes(oldLabel)) {
  s = s.replaceAll(oldLabel, newLabel);
  console.log("status label 已通过");
} else if (s.includes('?"已通过":')) {
  console.log("status label already 已通过");
} else {
  console.error("status label pattern missing");
  process.exit(1);
}

fs.writeFileSync(p, s);
console.log("info patch ok");
