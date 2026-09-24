const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

// 1) Fix broken if-condition insert (restore comma-expression + safe apply side-effect)
const broken =
  'P.value==="1"&&(A.value=!1);try{if(xe.value&&window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.apply==="function")window.__DCI_ORGINFO_DEMO__.apply({k:k,P:P,A:A})}catch(_demo){},e.contractFiles&&typeof e.contractFiles=="string"){';
const fixed =
  'P.value==="1"&&(A.value=!1),(function(){try{if(xe.value&&window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.apply==="function")window.__DCI_ORGINFO_DEMO__.apply({k:k,P:P,A:A})}catch(_demo){}})(),e.contractFiles&&typeof e.contractFiles=="string"){';
if (!s.includes(broken)) {
  console.error("broken apply insert not found");
  // already fixed?
  if (!s.includes("__DCI_ORGINFO_DEMO__.apply")) {
    console.error("no apply hook at all");
    process.exit(1);
  }
  console.log("skip apply-fix (pattern missing, checking integrity)");
} else {
  s = s.replace(broken, fixed);
  console.log("fixed apply insert");
}

// 2) geAudit: on org-info only changeStatus matters
const oldGe = 'geAudit=E(()=>w.value||P.value==="1")';
const newGe = 'geAudit=E(()=>xe.value?P.value==="1":w.value||P.value==="1")';
if (s.includes(oldGe)) {
  s = s.replace(oldGe, newGe);
  console.log("geAudit org-info aware");
} else if (s.includes(newGe)) {
  console.log("geAudit already ok");
} else {
  console.error("geAudit pattern missing");
  process.exit(1);
}

// 3) Hide header withdraw on org-info (footer owns the action)
const oldHdr =
  'm("div",ua,[geAudit.value?(o(),p(d,{key:0,type:"danger",plain:"",icon:"RefreshLeft",onClick:ae},{default:t(()=>[s("撤回申请",1)]),_:1})):x("",!0),';
const newHdr =
  'm("div",ua,[geAudit.value&&!xe.value?(o(),p(d,{key:0,type:"danger",plain:"",icon:"RefreshLeft",onClick:ae},{default:t(()=>[s("撤回申请",1)]),_:1})):x("",!0),';
if (s.includes(oldHdr)) {
  s = s.replace(oldHdr, newHdr);
  console.log("header withdraw gated");
} else if (s.includes("geAudit.value&&!xe.value?(o(),p(d,{key:0,type:\"danger\"")) {
  console.log("header withdraw already gated");
} else {
  console.error("header withdraw pattern missing");
  process.exit(1);
}

// 4) Cancel button label → 取消申请
if (s.includes('[s(" 取消 ",-1)]')) {
  s = s.replace('[s(" 取消 ",-1)]', '[s(" 取消申请 ",-1)]');
  console.log("cancel label → 取消申请");
}

// 5) Soften cancel confirm copy to match 取消申请
if (s.includes('fe.confirm("取消后将放弃本次未提交的修改，确定取消吗？","取消确认"')) {
  s = s.replace(
    'fe.confirm("取消后将放弃本次未提交的修改，确定取消吗？","取消确认",{confirmButtonText:"确定取消",cancelButtonText:"继续编辑",type:"warning"})',
    'fe.confirm("取消申请后将放弃本次未提交的修改，确定取消吗？","取消申请确认",{confirmButtonText:"确定取消",cancelButtonText:"继续编辑",type:"warning"})'
  );
  console.log("cancel confirm copy updated");
}

fs.writeFileSync(p, s);
console.log("ok");
