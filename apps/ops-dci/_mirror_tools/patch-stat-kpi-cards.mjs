/**
 * Expand StatOrg KPI cards 2→4 and StatOwner KPI cards 1→4.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const orgPath = path.join(root, "mirror/static/js/org-BBVj6u8M.js");
const ownerPath = path.join(root, "mirror/static/js/owner-fg193Azo.js");
const orgCssPath = path.join(root, "mirror/static/css/org-CdZjyJkZ.css");
const ownerCssPath = path.join(root, "mirror/static/css/owner-3vb1_CY6.css");

function mustReplace(src, from, to, label) {
  if (!src.includes(from)) {
    throw new Error(`[${label}] pattern not found:\n${from.slice(0, 160)}`);
  }
  return src.replace(from, to);
}

// ---------- Org page ----------
let org = fs.readFileSync(orgPath, "utf8");

org = mustReplace(
  org,
  `const ae={class:"kpi-card blue"},le={class:"kpi-value"},oe={class:"kpi-card green"},se={class:"kpi-value"},`,
  `const ae={class:"kpi-card blue"},le={class:"kpi-value"},oe={class:"kpi-card green"},se={class:"kpi-value"},fe={class:"kpi-card orange"},ge={class:"kpi-value"},he={class:"kpi-card purple"},Ce={class:"kpi-value"},`,
  "org-const",
);

// T=m(9) is 新增注册中心; R is 新增申领平台 — add totals after them
org = mustReplace(
  org,
  `T=m(9),R=m(12)`,
  `T=m(9),R=m(12),TT=m(38),RT=m(24)`,
  "org-refs",
);

const orgOldKpi = `n(a,{gutter:16,class:"kpi-row"},{default:d(()=>[n(o,{span:12},{default:d(()=>[l("div",ae,[e[3]||(e[3]=l("div",{class:"kpi-label"},"新增DCI注册中心数",-1)),l("div",le,[z(V(S(T.value))+" ",1),e[2]||(e[2]=l("span",{class:"kpi-unit"},"家",-1))])])]),_:1}),n(o,{span:12},{default:d(()=>[l("div",oe,[e[5]||(e[5]=l("div",{class:"kpi-label"},"新增DCI申领平台数",-1)),l("div",se,[z(V(S(R.value))+" ",1),e[4]||(e[4]=l("span",{class:"kpi-unit"},"个",-1))])])]),_:1})]),_:1})`;

const orgNewKpi = `n(a,{gutter:16,class:"kpi-row"},{default:d(()=>[n(o,{span:6},{default:d(()=>[l("div",ae,[e[3]||(e[3]=l("div",{class:"kpi-label"},"DCI注册中心总数",-1)),l("div",le,[z(V(S(TT.value))+" ",1),e[2]||(e[2]=l("span",{class:"kpi-unit"},"家",-1))])])]),_:1}),n(o,{span:6},{default:d(()=>[l("div",oe,[e[5]||(e[5]=l("div",{class:"kpi-label"},"新增DCI注册中心",-1)),l("div",se,[z(V(S(T.value))+" ",1),e[4]||(e[4]=l("span",{class:"kpi-unit"},"家",-1))])])]),_:1}),n(o,{span:6},{default:d(()=>[l("div",fe,[e[11]||(e[11]=l("div",{class:"kpi-label"},"DCI申领平台总数",-1)),l("div",ge,[z(V(S(RT.value))+" ",1),e[10]||(e[10]=l("span",{class:"kpi-unit"},"个",-1))])])]),_:1}),n(o,{span:6},{default:d(()=>[l("div",he,[e[13]||(e[13]=l("div",{class:"kpi-label"},"新增DCI申领平台",-1)),l("div",Ce,[z(V(S(R.value))+" ",1),e[12]||(e[12]=l("span",{class:"kpi-unit"},"个",-1))])])]),_:1})]),_:1})`;

org = mustReplace(org, orgOldKpi, orgNewKpi, "org-kpi-template");

const orgOldLoad = `const a={startDate:e&&e[0]?e[0]:void 0,endDate:e&&e[1]?e[1]:void 0,orgCode:o},[s,i,u,C]=await Promise.allSettled([G(a),Q(a),H(a),J(a)]);s.status==="fulfilled"&&s.value.data&&(T.value=Number(s.value.data.value||s.value.data.count||0)),i.status==="fulfilled"&&i.value.data&&(R.value=Number(i.value.data.value||i.value.data.count||0)),`;

const orgNewLoad = `const a={startDate:e&&e[0]?e[0]:void 0,endDate:e&&e[1]?e[1]:void 0,orgCode:o},tot={orgCode:o},[s,i,u,C,sTot,iTot]=await Promise.allSettled([G(a),Q(a),H(a),J(a),G(tot),Q(tot)]);s.status==="fulfilled"&&s.value.data&&(T.value=Number(s.value.data.value||s.value.data.count||0)),i.status==="fulfilled"&&i.value.data&&(R.value=Number(i.value.data.value||i.value.data.count||0)),sTot.status==="fulfilled"&&sTot.value.data&&(TT.value=Number(sTot.value.data.value||sTot.value.data.count||0)),iTot.status==="fulfilled"&&iTot.value.data&&(RT.value=Number(iTot.value.data.value||iTot.value.data.count||0)),`;

org = mustReplace(org, orgOldLoad, orgNewLoad, "org-load");

fs.writeFileSync(orgPath, org, "utf8");
console.log("patched", orgPath);

// ---------- Owner page ----------
let owner = fs.readFileSync(ownerPath, "utf8");

owner = mustReplace(
  owner,
  `import{l as b}from"./opusDwcrStat-B6RQlrr8.js";`,
  `import{l as b,d as Y}from"./opusDwcrStat-B6RQlrr8.js";`,
  "owner-import",
);

owner = mustReplace(
  owner,
  `const C={class:"kpi-card blue"},R={class:"kpi-value"},B={class:"chart-card"},`,
  `const C={class:"kpi-card blue"},R={class:"kpi-value"},P={class:"kpi-card green"},A={class:"kpi-value"},F={class:"kpi-card orange"},I={class:"kpi-value"},L={class:"kpi-card purple"},$={class:"kpi-value"},B={class:"chart-card"},`,
  "owner-const",
);

owner = mustReplace(
  owner,
  `const c=f(3),l=f();`,
  `const c=f(3),ot=f(90),pt=f(56),gt=f(34),l=f();`,
  "owner-refs",
);

const ownerOldKpi = `i(r,{gutter:16,class:"kpi-row"},{default:s(()=>[i(t,{span:12},{default:s(()=>[n("div",C,[e[1]||(e[1]=n("div",{class:"kpi-label"},"新增著作权人",-1)),n("div",R,[S(D(m(c.value))+" ",1),e[0]||(e[0]=n("span",{class:"kpi-unit"},"位",-1))])])]),_:1})]),_:1})`;

const ownerNewKpi = `i(r,{gutter:16,class:"kpi-row"},{default:s(()=>[i(t,{span:6},{default:s(()=>[n("div",C,[e[1]||(e[1]=n("div",{class:"kpi-label"},"著作权人总数",-1)),n("div",R,[S(D(m(ot.value))+" ",1),e[0]||(e[0]=n("span",{class:"kpi-unit"},"位",-1))])])]),_:1}),i(t,{span:6},{default:s(()=>[n("div",P,[e[4]||(e[4]=n("div",{class:"kpi-label"},"个人总数",-1)),n("div",A,[S(D(m(pt.value))+" ",1),e[3]||(e[3]=n("span",{class:"kpi-unit"},"位",-1))])])]),_:1}),i(t,{span:6},{default:s(()=>[n("div",F,[e[6]||(e[6]=n("div",{class:"kpi-label"},"机构总数",-1)),n("div",I,[S(D(m(gt.value))+" ",1),e[5]||(e[5]=n("span",{class:"kpi-unit"},"位",-1))])])]),_:1}),i(t,{span:6},{default:s(()=>[n("div",L,[e[8]||(e[8]=n("div",{class:"kpi-label"},"新增著作权人",-1)),n("div",$ ,[S(D(m(c.value))+" ",1),e[7]||(e[7]=n("span",{class:"kpi-unit"},"位",-1))])])]),_:1})]),_:1})`.replace(
  "$ ,[",
  "$,[",
);

owner = mustReplace(owner, ownerOldKpi, ownerNewKpi, "owner-kpi-template");

const ownerOldLoad = `async function v(a){const{dateRange:e}=a||{};try{const t={startDate:e&&e[0]?e[0]:void 0,endDate:e&&e[1]?e[1]:void 0},r=await b(t);r.data&&(w(r.data),c.value=r.data.reduce((y,u)=>y+Number(u.value||u.count||0),0))}catch(t){console.error("加载权利人数据失败:",t)}}`;

const ownerNewLoad = `async function v(a){const{dateRange:e}=a||{};try{const t={startDate:e&&e[0]?e[0]:void 0,endDate:e&&e[1]?e[1]:void 0},[r,j]=await Promise.allSettled([b(t),Y({})]);if(r.status==="fulfilled"&&r.value.data){const y=r.value.data;w(y),c.value=y.reduce((u,x)=>u+Number(x.value||x.count||0),0)}const tot=j.status==="fulfilled"&&j.value.data?j.value.data:r.status==="fulfilled"&&r.value.data?r.value.data:null;if(tot){const pick=(y,u)=>{const x=tot.find(E=>(E.name||"").includes(u));return Number(x&&(x.value||x.count)||0)};pt.value=pick(tot,"个人"),gt.value=pick(tot,"机构"),ot.value=pt.value+gt.value}}catch(t){console.error("加载权利人数据失败:",t)}}`;

owner = mustReplace(owner, ownerOldLoad, ownerNewLoad, "owner-load");

fs.writeFileSync(ownerPath, owner, "utf8");
console.log("patched", ownerPath);

// ---------- CSS ----------
let orgCss = fs.readFileSync(orgCssPath, "utf8");
if (!orgCss.includes(".kpi-card.purple")) {
  orgCss = orgCss.replace(
    `.kpi-card.orange[data-v-0e261c55]{border-top-color:#e6a23c}`,
    `.kpi-card.orange[data-v-0e261c55]{border-top-color:#e6a23c}.kpi-card.purple[data-v-0e261c55]{border-top-color:#9b6bff}`,
  );
  fs.writeFileSync(orgCssPath, orgCss, "utf8");
  console.log("patched", orgCssPath);
}

let ownerCss = fs.readFileSync(ownerCssPath, "utf8");
if (!ownerCss.includes(".kpi-card.green")) {
  ownerCss = ownerCss.replace(
    `.kpi-card[data-v-7f1f4576]{background:#fff;border-radius:8px;padding:16px 24px;box-shadow:0 1px 3px #0000000d;border-top:4px solid #0075c1}`,
    `.kpi-card[data-v-7f1f4576]{background:#fff;border-radius:8px;padding:16px 24px;box-shadow:0 1px 3px #0000000d;border-top:4px solid #0075c1}.kpi-card.green[data-v-7f1f4576]{border-top-color:#5ad8a6}.kpi-card.orange[data-v-7f1f4576]{border-top-color:#e6a23c}.kpi-card.purple[data-v-7f1f4576]{border-top-color:#9b6bff}`,
  );
  fs.writeFileSync(ownerCssPath, ownerCss, "utf8");
  console.log("patched", ownerCssPath);
}

console.log("done");
