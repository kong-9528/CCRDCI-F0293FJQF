/**
 * Enable tech-service-center open-apply in home 开通管理.
 * - Profile tech card: status lifecycle like 注册中心
 * - Embed dci-tech-apply when action=applyTech
 * - Header: show「申请接入技术服务中心」when not approved
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../mirror");
const PROFILE = path.join(ROOT, "static/js/index-CsmZrPeY.js");
const HEADER = path.join(ROOT, "static/js/index-_fJendd7.js");
const INDEX_HTML = path.join(ROOT, "index.html");
const OVERRIDES = path.join(ROOT, "overrides.css");

function mustReplace(file, from, to, label) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes(from)) {
    if (s.includes(to) || (typeof to === "string" && to.length > 40 && s.includes(to.slice(0, 40)))) {
      console.log("SKIP already", label);
      return;
    }
    throw new Error("NOT FOUND: " + label + "\n" + from.slice(0, 120));
  }
  s = s.replace(from, to);
  fs.writeFileSync(file, s, "utf8");
  console.log("OK", label);
}

function ensureOnce(file, needle, insertAfter, chunk, label) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes(needle)) {
    console.log("SKIP already", label);
    return;
  }
  const i = s.indexOf(insertAfter);
  if (i < 0) throw new Error("anchor missing: " + label);
  s = s.slice(0, i + insertAfter.length) + chunk + s.slice(i + insertAfter.length);
  fs.writeFileSync(file, s, "utf8");
  console.log("OK", label);
}

// ——— index.html scripts ———
{
  let html = fs.readFileSync(INDEX_HTML, "utf8");
  if (!html.includes("dci-tech-store.js")) {
    html = html.replace(
      '<script src="/static/js/dci-orginfo-history.js"></script>',
      '<script src="/static/js/dci-orginfo-history.js"></script>\n  <script src="/static/js/dci-tech-store.js"></script>\n  <script src="/static/js/dci-tech-apply.js"></script>',
    );
    fs.writeFileSync(INDEX_HTML, html, "utf8");
    console.log("OK index.html tech scripts");
  } else {
    console.log("SKIP index.html tech scripts");
  }
}

// ——— Profile: tech status flags (full lifecycle) ———
mustReplace(
  PROFILE,
  'jt=F(()=>m.techStatus===1),ot=F(()=>{const r=j.value,t2=jt.value;return r&&t2?"DCI注册中心、DCI®技术服务中心":r?"DCI注册中心":t2?"DCI®技术服务中心":"暂无"})',
  'bt=r(null),jt=F(()=>{var ts=bt.value;if(ts===null||ts===void 0){try{var TS=window.__DCI_TECH_STORE__;if(TS&&TS.currentTechStatus)ts=TS.currentTechStatus()}catch(e){}if(ts===null||ts===void 0)ts=m.techStatus}return Number(ts)===1}),kt=F(()=>{var ts=bt.value;if(ts===null||ts===void 0){try{var TS=window.__DCI_TECH_STORE__;if(TS&&TS.currentTechStatus)ts=TS.currentTechStatus()}catch(e){}if(ts===null||ts===void 0)ts=m.techStatus}return ts!==null&&ts!==void 0&&Number(ts)===0}),lt=F(()=>{var ts=bt.value;if(ts===null||ts===void 0){try{var TS=window.__DCI_TECH_STORE__;if(TS&&TS.currentTechStatus)ts=TS.currentTechStatus()}catch(e){}if(ts===null||ts===void 0)ts=m.techStatus}return Number(ts)===2}),mt=F(()=>{var ts=bt.value;if(ts===null||ts===void 0){try{var TS=window.__DCI_TECH_STORE__;if(TS&&TS.currentTechStatus)ts=TS.currentTechStatus()}catch(e){}if(ts===null||ts===void 0)ts=m.techStatus}return Number(ts)===3}),ot=F(()=>{const r=j.value,t2=jt.value;return r&&t2?"DCI注册中心、DCI®技术服务中心":r?"DCI注册中心":t2?"DCI®技术服务中心":"暂无"})',
  "profile tech lifecycle flags",
);

mustReplace(
  PROFILE,
  "function Z(){_.value=\"apply\"}function ge(){_.value=\"list\",se()}",
  'function Z(){_.value="apply"}function Zt(){_.value="applyTech"}function ge(){_.value="list";se();refreshTech()}function refreshTech(){try{var TS=window.__DCI_TECH_STORE__;if(TS&&TS.currentTechStatus){var ts=TS.currentTechStatus();bt.value=ts;m.techStatus=ts}}catch(e){}}',
  "profile Zt + ge refresh tech",
);

// refresh tech status inside se()
mustReplace(
  PROFILE,
  "if(mu){m.auditStatus=mu.auditStatus===null||mu.auditStatus===void 0?null:Number(mu.auditStatus);m.techStatus=mu.techStatus===null||mu.techStatus===void 0?null:Number(mu.techStatus);if(b.value===null&&m.auditStatus!==null)b.value=m.auditStatus}",
  "if(mu){m.auditStatus=mu.auditStatus===null||mu.auditStatus===void 0?null:Number(mu.auditStatus);m.techStatus=mu.techStatus===null||mu.techStatus===void 0?null:Number(mu.techStatus);try{var TS=window.__DCI_TECH_STORE__;if(TS&&TS.currentTechStatus){var ts=TS.currentTechStatus();bt.value=ts;m.techStatus=ts}}catch(e2){}if(b.value===null&&m.auditStatus!==null)b.value=m.auditStatus}",
  "profile se sync tech store",
);

// query action=applyTech
mustReplace(
  PROFILE,
  'Ue(()=>[M.query.tab,M.query.action],([l,e])=>{l==="open"?(x.value="open",e==="apply"?_.value="apply":_.value="list"):x.value="info"},{immediate:!0})',
  'Ue(()=>[M.query.tab,M.query.action],([l,e])=>{l==="open"?(x.value="open",e==="applyTech"?(_.value="applyTech"):e==="apply"?(_.value="apply"):(_.value="list")):x.value="info"},{immediate:!0})',
  "profile query applyTech",
);

// Embed branch: apply | applyTech | list
mustReplace(
  PROFILE,
  '_.value==="apply"?(u(),c("div",ba,[t(Me,{embedded:!0,onBack:ge})])):(u(),c("div",wa,',
  '_.value==="apply"?(u(),c("div",ba,[t(Me,{embedded:!0,onBack:ge})])):_.value==="applyTech"?(u(),c("div",{key:0,class:"embedded-apply-wrap embedded-tech-apply-wrap",ref:e=>{try{var T=window.__DCI_TECH_APPLY__;if(!e){T&&T.unmount&&T.unmount();return}T&&T.mount&&T.mount(e,{onBack:ge})}catch(err){}}})):(u(),c("div",wa,',
  "profile embed tech apply",
);

// Replace tech card bottom actions (approved / pending / reject / withdraw / apply)
const oldTechBottom = `a("div",{class:"card-bottom"},[jt.value?(u(),c("div",{key:0,class:"action-link cursor-pointer flex-row align-center",onClick:e[52]||(e[52]=s=>{var M=window.__DCI_MOCK__;M&&M.openTechWorkbench?M.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\/$/,"")+"/desk","_blank")})},[e[53]||(e[53]=a("span",null,"进入工作台",-1)),e[54]||(e[54]=a("span",{class:"arrow"},"→",-1))])):(u(),c("div",{key:1,class:"action-link disabled flex-row align-center"},[e[55]||(e[55]=a("span",null,"敬请期待",-1))]))])`;

const newTechBottom = `a("div",{class:"card-bottom"},[jt.value?(u(),c("div",{key:0,class:"action-link cursor-pointer flex-row align-center",onClick:e[52]||(e[52]=s=>{var M=window.__DCI_MOCK__;M&&M.openTechWorkbench?M.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\/$/,"")+"/desk","_blank")})},[e[53]||(e[53]=a("span",null,"进入工作台",-1)),e[54]||(e[54]=a("span",{class:"arrow"},"→",-1))])):kt.value?(u(),c("div",{key:1,class:"action-link cursor-pointer flex-row align-center",onClick:Zt},[e[57]||(e[57]=a("span",null,"查看申请进度",-1)),e[58]||(e[58]=a("span",{class:"arrow"},"→",-1))])):(u(),c("div",{key:2,class:"action-link cursor-pointer flex-row align-center",onClick:Zt},[a("span",null,k(lt.value||mt.value?"重新申请":"申请接入技术服务中心"),1),e[59]||(e[59]=a("span",{class:"arrow"},"→",-1))]))])`;

mustReplace(PROFILE, oldTechBottom, newTechBottom, "tech card CTAs");

// Tech card status badge: show for reviewing / rejected / withdrawn too
mustReplace(
  PROFILE,
  'jt.value?(u(),c("div",{key:0,class:"status-badge-wrap"},[a("span",{class:"status-tag approved"},"已通过")])):N("",!0)',
  'jt.value?(u(),c("div",{key:0,class:"status-badge-wrap"},[a("span",{class:"status-tag approved"},"已通过")])):kt.value?(u(),c("div",{key:1,class:"status-badge-wrap"},[a("span",{class:"status-tag auditing"},"审核中")])):lt.value?(u(),c("div",{key:2,class:"status-badge-wrap"},[a("span",{class:"status-tag rejected"},"未通过")])):mt.value?(u(),c("div",{key:3,class:"status-badge-wrap"},[a("span",{class:"status-tag revoked"},"已撤回")])):(u(),c("div",{key:4,class:"status-badge-wrap"},[a("span",{class:"status-tag not-opened"},"未开通")]))',
  "tech card status badges",
);

// ——— Header: allow applyTech when not tech-approved (even if reg approved) ———
mustReplace(
  HEADER,
  'tt.value?(g(),j(k,{key:0,command:"techWorkbench",class:"portal-menu-item"},{default:d(()=>[...t[20]||(t[20]=[e("span",null,"技术服务中心工作台",-1)])]),_:1})):q.value?D("",!0):(g(),j(k,{key:1,command:"applyTech",class:"portal-menu-item"},{default:d(()=>[...t[14]||(t[14]=[e("span",null,"申请接入技术服务中心",-1)])]),_:1}))',
  'tt.value?(g(),j(k,{key:0,command:"techWorkbench",class:"portal-menu-item"},{default:d(()=>[...t[20]||(t[20]=[e("span",null,"技术服务中心工作台",-1)])]),_:1})):(g(),j(k,{key:1,command:"applyTech",class:"portal-menu-item"},{default:d(()=>[...t[14]||(t[14]=[e("span",null,"申请接入技术服务中心",-1)])]),_:1}))',
  "header always show applyTech when not tech",
);

mustReplace(
  HEADER,
  'case"applyTech":s.push("/user/profile?tab=open");break;',
  'case"applyTech":s.push({path:"/user/profile",query:{tab:"open",action:"applyTech"}});break;',
  "header applyTech deep-link",
);

// ——— CSS ———
{
  let css = fs.readFileSync(OVERRIDES, "utf8");
  const marker = "/* ===== tech-apply open form ===== */";
  if (!css.includes(marker)) {
    css += `
${marker}
.embedded-tech-apply-wrap { min-height: 420px; }
.tech-apply-root { position: relative; }
.tech-apply-root .tech-back-btn {
  border: none; background: transparent; cursor: pointer;
  font-size: 18px; line-height: 1; margin-right: 8px; color: #4e5969;
}
.tech-apply-root .tech-input,
.tech-apply-root .tech-textarea {
  width: 100%; box-sizing: border-box;
  border: 1px solid #dcdfe6; border-radius: 4px;
  padding: 8px 12px; font-size: 14px; color: #303133;
  background: #fff;
}
.tech-apply-root .tech-textarea { resize: vertical; min-height: 72px; }
.tech-textarea-wrap { position: relative; width: 100%; }
.tech-textarea-counter {
  position: absolute; right: 8px; bottom: 6px;
  font-size: 12px; color: #909399;
}
.tech-apply-row {
  display: flex; align-items: flex-start; margin-bottom: 18px;
}
.tech-apply-row .el-form-item__label {
  width: 140px; flex-shrink: 0; text-align: right;
  padding-right: 12px; line-height: 32px; color: #606266;
}
.tech-apply-row .el-form-item__content { flex: 1; min-width: 0; }
.tech-req { color: #f56c6c; margin-right: 4px; }
.tech-upload-btn { position: relative; overflow: hidden; cursor: pointer; }
.tech-upload-hint { margin-top: 6px; font-size: 12px; color: #909399; }
.tech-form-error { color: #f56c6c; margin: 8px 0 12px; font-size: 13px; }
.tech-toast {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  z-index: 4000; background: #303133; color: #fff;
  padding: 10px 18px; border-radius: 6px; font-size: 13px;
  box-shadow: 0 6px 16px rgba(0,0,0,.18);
}
.tech-hist-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  z-index: 3000; display: flex; align-items: center; justify-content: center;
}
.tech-hist-dialog {
  width: min(850px, 92vw); max-height: 80vh; background: #fff;
  border-radius: 8px; display: flex; flex-direction: column;
  box-shadow: 0 12px 32px rgba(0,0,0,.18);
}
.tech-hist-dialog__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #ebeef5; font-weight: 600;
}
.tech-hist-close { border: none; background: transparent; font-size: 22px; cursor: pointer; color: #909399; }
.tech-hist-dialog__body { padding: 16px 18px; overflow: auto; }
.tech-hist-dialog__footer { padding: 12px 18px; border-top: 1px solid #ebeef5; text-align: right; }
.tech-hist-empty { color: #909399; text-align: center; padding: 32px 0; }
.tech-hist-card { border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
.tech-hist-summary {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border: none; background: #fafafa; cursor: pointer; text-align: left;
}
.tech-hist-summary__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.tech-hist-org { font-weight: 600; color: #303133; }
.tech-hist-meta { font-size: 12px; color: #909399; }
.tech-hist-status { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
.tech-hist-status--success { background: #e8f8ef; color: #00b42a; }
.tech-hist-status--warning { background: #fff7e8; color: #ff7d00; }
.tech-hist-status--danger { background: #ffece8; color: #f53f3f; }
.tech-hist-status--info { background: #f2f3f5; color: #86909c; }
.tech-hist-detail { padding: 12px 14px 16px; background: #fff; }
.tech-hist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.tech-hist-grid .full { grid-column: 1 / -1; }
.tech-hist-grid label { display: block; font-size: 12px; color: #909399; margin-bottom: 4px; }
.status-tag.reviewing { background: #fff7e8 !important; color: #ff7d00 !important; }
.status-tag.rejected { background: #ffece8 !important; color: #f53f3f !important; }
.status-tag.withdrawn { background: #f2f3f5 !important; color: #86909c !important; }
`;
    fs.writeFileSync(OVERRIDES, css, "utf8");
    console.log("OK overrides tech-apply css");
  } else {
    console.log("SKIP overrides tech-apply css");
  }
}

for (const f of [PROFILE, HEADER]) {
  execSync(`node --check "${f}"`, { stdio: "pipe" });
  console.log("SYNTAX OK", path.basename(f));
}

console.log("DONE patch-tech-open-apply");
