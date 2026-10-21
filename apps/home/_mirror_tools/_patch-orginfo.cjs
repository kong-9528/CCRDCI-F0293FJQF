/**
 * Patch org-info page: states, buttons, labels, demo switcher.
 */
const fs = require("fs");

// —— 1) Page JS ——
{
  const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
  let s = fs.readFileSync(p, "utf8");

  // Fix history labels 注册中心类型 → DCI注册中心类型
  s = s.replaceAll('label:"注册中心类型"', 'label:"DCI注册中心类型"');

  // Button text: 更新机构信息 → 更新
  s = s.replace('s(" 更新机构信息 ",-1)', 's(" 更新 ",-1)');

  // Computed helpers: add auditing / idle for org-info
  // Current: S=E(()=>k.value===1),w=E(()=>k.value===0),O=E(()=>S.value?!A.value:w.value),Ne=E(...)
  const oldComp =
    "S=E(()=>k.value===1),w=E(()=>k.value===0),O=E(()=>S.value?!A.value:w.value),Ne=E(()=>k.value===-1||k.value===2||k.value===3)";
  const newComp =
    'S=E(()=>k.value===1),w=E(()=>k.value===0),geAudit=E(()=>w.value||P.value==="1"),geIdle=E(()=>xe.value?!geAudit.value&&!A.value:S.value&&!A.value&&P.value!=="1"),O=E(()=>xe.value?geAudit.value||!A.value&&S.value:S.value?!A.value:w.value),Ne=E(()=>xe.value?!1:k.value===-1||k.value===2||k.value===3)';
  if (!s.includes(oldComp)) {
    console.error("computed block missing");
    process.exit(1);
  }
  s = s.replace(oldComp, newComp);

  // Status banner: show 审核中 for org-info when auditing; hide change-only condition
  const oldBanner =
    'm("div",ca,[S.value&&P.value==="1"?(o(),p(v,{key:0,title:"机构信息变更申请正在审核中",type:"warning",description:"您提交的机构信息变更申请正在由运营管理人员审核中。审核期间不会影响您现有的线上业务正常运行，审核通过后将自动更新为最新资质信息。","show-icon":"",closable:!1})):x("",!0)])';
  const newBanner =
    'm("div",ca,[geAudit.value?(o(),p(v,{key:0,title:"审核中",type:"warning",description:"您提交的机构信息变更申请正在由运营管理人员审核中。审核期间不会影响您现有的线上业务正常运行；审核通过后将自动更新为最新信息。若申请被驳回或您主动撤回，页面将恢复为无状态，并继续展示最近一次审核通过的机构信息。","show-icon":"",closable:!1})):xe.value&&geIdle.value?(o(),p(v,{key:1,title:"无状态",type:"info",description:"当前无待审变更。您可以点击下方「更新」修改机构信息并提交审核。","show-icon":"",closable:!1})):x("",!0)])';
  if (!s.includes(oldBanner)) {
    console.error("banner missing");
    process.exit(1);
  }
  s = s.replace(oldBanner, newBanner);

  // Header withdraw: keep when auditing
  const oldHeaderBtn =
    'k.value===0||k.value==="0"||S.value&&P.value==="1"?(o(),p(d,{key:0,type:"danger",plain:"",icon:"RefreshLeft",onClick:ae},{default:t(()=>[s("撤回申请",1)]),_:1})):x("",!0)';
  const newHeaderBtn =
    'geAudit.value?(o(),p(d,{key:0,type:"danger",plain:"",icon:"RefreshLeft",onClick:ae},{default:t(()=>[s("撤回申请",1)]),_:1})):x("",!0)';
  if (!s.includes(oldHeaderBtn)) {
    console.error("header btn missing");
    process.exit(1);
  }
  s = s.replace(oldHeaderBtn, newHeaderBtn);

  // Footer buttons — rewrite the chain for cleaner org-info behavior
  // Current chain starts at Ne.value?(o(),c("div",La,...
  const footerStart = s.indexOf("Ne.value?(o(),c(\"div\",La,");
  if (footerStart < 0) {
    console.error("footer start missing");
    process.exit(1);
  }
  // Find end: ends before `]),_:1},8,["model"])],2),l(pe,`
  const footerEnd = s.indexOf(']),_:1},8,["model"])],2),l(pe,', footerStart);
  if (footerEnd < 0) {
    console.error("footer end missing");
    process.exit(1);
  }
  const oldFooter = s.slice(footerStart, footerEnd);
  // Build new footer:
  // 1) Ne (apply flow, not org-info): 提交申请
  // 2) xe && A OR (!xe && S && A): 提交申请 + 取消
  // 3) geAudit: 撤回申请 only (full width)
  // 4) xe && geIdle OR (!xe && S): 更新
  // Need to keep La, Ua, Ra, Aa keys - look at existing structure

  // Simpler approach: replace specific branches
  // Branch 1: auditing footer - remove disabled button, keep only withdraw full width
  const oldAuditFooter =
    'k.value===0||k.value==="0"?(o(),c("div",Ua,[l(d,{type:"primary",class:"submit-btn is-disabled",disabled:""},{default:t(()=>[...e[26]||(e[26]=[s(" 申请正在审核中 ",-1)])]),_:1}),l(d,{type:"danger",style:{height:"48px","border-radius":"24px",padding:"0 32px","font-size":"16px","font-weight":"500"},icon:"RefreshLeft",onClick:ae},{default:t(()=>[...e[27]||(e[27]=[s(" 撤回申请 ",-1)])]),_:1})]))';
  const newAuditFooter =
    'geAudit.value?(o(),c("div",Ua,[l(d,{type:"danger",class:"submit-btn",icon:"RefreshLeft",onClick:ae},{default:t(()=>[...e[26]||(e[26]=[s(" 撤回申请 ",-1)])]),_:1})]))';
  if (!s.includes(oldAuditFooter)) {
    console.error("audit footer missing");
    console.log(s.slice(s.indexOf("申请正在审核中") - 200, s.indexOf("申请正在审核中") + 400));
    process.exit(1);
  }
  s = s.replace(oldAuditFooter, newAuditFooter);

  // Branch: S&&P==="1" withdraw-only — redundant now with geAudit, replace with false
  const oldChangeFooter =
    'S.value&&P.value==="1"?(o(),c("div",Ra,[l(d,{type:"danger",class:"submit-btn",icon:"RefreshLeft",onClick:ae},{default:t(()=>[...e[29]||(e[29]=[s(" 撤回申请 ",-1)])]),_:1})]))';
  const newChangeFooter = "x(\"\",!0)";
  if (!s.includes(oldChangeFooter)) {
    console.error("change footer missing");
    process.exit(1);
  }
  s = s.replace(oldChangeFooter, newChangeFooter);

  // Edit branch: S&&A → also allow when xe&&A (same since S is needed for edit on org-info)
  // Already S.value&&A.value — good for org-info when approved and editing

  // Idle update button text already changed to 更新
  // Ensure update shows for geIdle on org-info: else branch is update when not Ne, not audit, not edit
  // Current else: update button — with our Ne=false on xe and geAudit/edit handled, idle falls through. Good.

  // After load: apply org-info demo mode
  const oldLoadEnd = "e.id&&Le(e.id)}}).catch(()=>{J.value=!1})";
  // Find a better hook after auditStatus assignment
  const applyDemo =
    ';try{if(xe.value&&window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.apply==="function")window.__DCI_ORGINFO_DEMO__.apply({k:k,P:P,A:A})}catch(_demo){}';
  // Insert after changeStatus handling
  const marker = 'P.value==="1"&&(A.value=!1)';
  if (!s.includes(marker)) {
    console.error("changeStatus marker missing");
    process.exit(1);
  }
  s = s.replace(marker, marker + applyDemo);

  // Subscribe demo on mount
  const mountMarker = "Je(()=>{";
  // Find setup onMounted - Je is onMounted (e as Je from import)
  // Look for Je(()=>
  const mi = s.indexOf("Je(()=>{");
  if (mi < 0) {
    // try other patterns
    console.log("onMounted search", s.indexOf("Je("));
  } else {
    s = s.replace(
      "Je(()=>{",
      'Je(()=>{try{if(window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.subscribe==="function"){window.__DCI_ORGINFO_DEMO__.subscribe(function(){ee()})}}catch(_d){}',
    );
  }

  fs.writeFileSync(p, s);
  console.log("1) page patched");
}

console.log("page pass done");
