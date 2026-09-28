/**
 * Org-info: history dialog → secondary page bridge.
 * - History button sets ?view=history (org-info only)
 * - Exposes window.__DCI_ORGINFO_HISTORY__ for the companion UI
 */
const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

const oldBtn =
  'l(d,{class:"history-btn",icon:"Document",onClick:e[0]||(e[0]=n=>M.value=!0)}';
const newBtn =
  'l(d,{class:"history-btn",icon:"Document",onClick:e[0]||(e[0]=n=>{if(xe.value){try{const _q=Object.assign({},he.query||{});_q.view="history";ke.replace({path:he.path,query:_q})}catch(_h){M.value=!0}}else M.value=!0})}';

if (!s.includes(oldBtn)) {
  console.error("history-btn click handler not found");
  process.exit(1);
}
if (s.includes('_q.view="history"')) {
  console.log("history-btn already patched");
} else {
  s = s.replace(oldBtn, newBtn);
  console.log("history-btn → ?view=history");
}

// Expose bridge after Le() / q is available — inject once near const re=Ye()
const bridgeMarker = "window.__DCI_ORGINFO_HISTORY__";
if (!s.includes(bridgeMarker)) {
  const anchor = "const re=Ye(),J=C(!1),R=C(!1),M=C(!1),G=C(!1),f=C({})";
  if (!s.includes(anchor)) {
    console.error("anchor for bridge missing");
    process.exit(1);
  }
  const bridge =
    ';(function(){try{window.__DCI_ORGINFO_HISTORY__={getRecords:()=>q.value||[],getForm:()=>a.value,previewFile:typeof Q=="function"?Q:null,revealPhone:typeof K=="function"?K:null,maskPhone:typeof H=="function"?H:null,isOrgInfo:()=>!!xe.value,isHistoryView:()=>{try{return!!xe.value&&String((he.query&&he.query.view)||"")==="history"}catch(e){return!1}},enterHistory:()=>{try{const _q=Object.assign({},he.query||{});_q.view="history";ke.replace({path:he.path,query:_q})}catch(e){}},leaveHistory:()=>{try{const _q=Object.assign({},he.query||{});delete _q.view;ke.replace({path:he.path,query:_q})}catch(e){}},subscribeQuery:(fn)=>{if(typeof fn!="function")return()=>{};let last="";const tick=()=>{let cur="";try{cur=String((he.query&&he.query.view)||"")}catch(e){}if(cur!==last){last=cur;try{fn(cur==="history")}catch(e){}}};tick();const id=setInterval(tick,200);return()=>clearInterval(id)}};}catch(_b){}})();' +
    anchor;
  s = s.replace(anchor, bridge);
  console.log("bridge exposed");
} else {
  console.log("bridge already present");
}

// Keep dialog from showing on org-info when somehow M flips true while in history view —
// optional: force M false when xe. Soften by not opening dialog from button (done).

fs.writeFileSync(p, s);
console.log("orginfo history page patch ok");
