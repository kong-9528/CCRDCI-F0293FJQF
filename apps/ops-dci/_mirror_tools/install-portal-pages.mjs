/**
 * Install 门户管理 into ops-dci by remapping live compiled chunks onto the
 * host Vue runtime (index-DsYmzmNg.js) + mock store/API/menu wiring.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mirrorJs = path.join(root, "mirror/static/js");
const mirrorCss = path.join(root, "mirror/static/css");
const captureDir = path.join(root, "_mirror_tools/_portal_capture");
const jsonPath = path.join(mirrorJs, "ops-mock-store.json");
const storeJsPath = path.join(mirrorJs, "ops-mock-store.js");
const apiPath = path.join(mirrorJs, "ops-mock-api.js");
const indexHtml = path.join(root, "mirror/index.html");
const mainIdx = path.join(mirrorJs, "index-DsYmzmNg.js");
const spaFallback = path.join(root, "_mirror_tools/spa-fallback.mjs");

fs.mkdirSync(mirrorCss, { recursive: true });

// ── seed data (captured from live) ─────────────────────────────────
const NAV_LIST = [
  { id: "1", title: "首页", columnType: "COMPONENT", componentCode: "HOME", routePath: "/", externalUrl: null, target: "_self", sortOrder: 1, isVisible: 1, status: "ACTIVE", description: "官方门户首页" },
  { id: "2112378438006984706", title: "DCI体系", columnType: "COMPONENT", componentCode: "DCI_SYSTEM", routePath: "/dci/system", externalUrl: null, target: "_self", sortOrder: 2, isVisible: 1, status: "0", description: null },
  { id: "3", title: "DCI标准", columnType: "COMPONENT", componentCode: "DCI_STANDARD", routePath: "/dci/standard", externalUrl: null, target: "_blank", sortOrder: 3, isVisible: 1, status: "ACTIVE", description: "DCI标准体系说明" },
  { id: "4", title: "DCI注册中心", columnType: "COMPONENT", componentCode: "DCI_REGORG", routePath: "/dci/regorg/portal", externalUrl: null, target: "_self", sortOrder: 4, isVisible: 1, status: "ACTIVE", description: "DCI注册中心门户申请" },
  { id: "5", title: "DCI生态", columnType: "COMPONENT", componentCode: "DCI_ECO", routePath: "/dci/eco", externalUrl: null, target: "_self", sortOrder: 5, isVisible: 1, status: "ACTIVE", description: "DCI可信生态伙伴" },
  { id: "6", title: "DCI实验室", columnType: "COMPONENT", componentCode: "DCI_LAB", routePath: "/dci/lab", externalUrl: null, target: "_self", sortOrder: 6, isVisible: 1, status: "ACTIVE", description: "DCI联合实验室" },
  { id: "7", title: "DCI查询", columnType: "COMPONENT", componentCode: "DCI_QUERY", routePath: "/dci/query", externalUrl: null, target: "_self", sortOrder: 7, isVisible: 1, status: "ACTIVE", description: "DCI权威凭证查验弹窗/页面" },
  { id: "8", title: "常见问题", columnType: "COMPONENT", componentCode: "DCI_FAQ", routePath: "/dci/faq", externalUrl: null, target: "_self", sortOrder: 8, isVisible: 1, status: "ACTIVE", description: "常见问题解答" },
  { id: "9", title: "联系我们", columnType: "COMPONENT", componentCode: "CONTACT_US", routePath: "/dci/contact", externalUrl: null, target: "_self", sortOrder: 9, isVisible: 1, status: "ACTIVE", description: "联系我们官方信息" },
  { id: "10", title: "DCI®技术服务中心", columnType: "COMPONENT", componentCode: "DCI_TECH_CENTER", routePath: "/dci/tech-center", externalUrl: null, target: "_self", sortOrder: 10, isVisible: 1, status: "0", description: "技术服务中心" },
];

const ARTICLES = [
  { id: "1001", category: "FAQ", title: "什么是 DCI 数字版权唯一标识符？", content: "DCI (Digital Copyright Identifier) 是数字空间中唯一的版权身份证和权益凭证，由中国版权保护中心统一发码与管理，实现版权的可信存照与全网确权。", summary: null, coverImage: null, sortOrder: 1, status: "PUBLISHED", auditStatus: "PASS", createdAt: "2026-10-12 17:23:25", updatedAt: "2026-10-24 05:03:54" },
  { id: "1002", category: "FAQ", title: "DCI 体系是什么？", content: "DCI体系是以DCI国家标准为引领，以标准化标识为基础手段，以AI、区块链等新技术的系统集成应用为驱动，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。", summary: null, coverImage: null, sortOrder: 2, status: "PUBLISHED", auditStatus: "PASS", createdAt: "2026-10-12 17:23:25", updatedAt: "2026-10-12 17:23:25" },
  { id: "1003", category: "FAQ", title: "如何申请成为 DCI 注册中心？", content: "具备互联网平台运营资格与数据治理能力的企事业单位，均可通过主页“如何申请成为 DCI 注册中心”在线提交主体资质材料，经评估认证后签订合作协议。", summary: null, coverImage: null, sortOrder: 3, status: "PUBLISHED", auditStatus: "PASS", createdAt: "2026-10-12 17:23:25", updatedAt: "2026-10-12 17:23:25" },
  { id: "1004", category: "FAQ", title: "DCI 存照凭证具备司法法律效力吗？", content: "具备。DCI 体系融合了区块链不可篡改技术与国家级时间戳校验，存储结果直接对接司法存证链，在知识产权维权诉讼中具备权威证据效力。", summary: null, coverImage: null, sortOrder: 4, status: "PUBLISHED", auditStatus: "PASS", createdAt: "2026-10-12 17:23:25", updatedAt: "2026-10-12 17:23:25" },
  { id: "1005", category: "FAQ", title: "DCI 申领业务都支持哪些作品？", content: "著作权法规定的作品均支持，包括文字作品；音乐、戏剧、曲艺、舞蹈作品；美术、建筑作品；摄影作品；视听作品；计算机软件；符合作品特征的其他智力成果（如数据集、AI生成内容等）。", summary: null, coverImage: null, sortOrder: 5, status: "PUBLISHED", auditStatus: "PASS", createdAt: "2026-10-12 17:23:25", updatedAt: "2026-10-12 17:23:25" },
];

const CONTENTS = {
  "1": [
    { id: "101", navId: "1", contentKey: "hero", title: "DCI（数字版权唯一标识符）", subTitle: "权益凭证", textContent: "——数字空间唯一“版权身份证”和“权益凭证”", imageUrl: null, linkUrl: null, sortOrder: 1, status: "0" },
    { id: "102", navId: "1", contentKey: "system_intro", title: "DCI体系", subTitle: null, textContent: "DCI体系是以DCI国家标准为引领，以标准化标识为基础手段，以AI、区块链等新技术的系统集成应用为驱动，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。", imageUrl: null, linkUrl: null, sortOrder: 2, status: "0" },
    { id: "105", navId: "1", contentKey: "banner_2", title: "DCI体系4.0(全球版权数据中心)", subTitle: null, textContent: "——AI时代的版权可信数智基础设施", imageUrl: null, linkUrl: null, sortOrder: 2, status: "0" },
    { id: "103", navId: "1", contentKey: "standard_intro", title: "DCI标准", subTitle: null, textContent: "DCI体系始终以标准为创新引领，逐步构建以DCI国家标准为核心的版权标准体系，并面向音视图文等各垂直领域数字生态及AI新业态新场景开展贯标试点应用。", imageUrl: null, linkUrl: null, sortOrder: 3, status: "ACTIVE" },
    { id: "104", navId: "1", contentKey: "regorg_intro", title: "DCI注册中心——DCI可信生态合作伙伴", subTitle: null, textContent: "DCI注册中心是经DCI管理中心评估认证，负责DCI业务的标准化落地与数据运营", imageUrl: null, linkUrl: null, sortOrder: 4, status: "0" },
  ],
  "2112378438006984706": [
    { id: "201", navId: "2112378438006984706", contentKey: "banner", title: "DCI体系4.0(全球版权数据中心)", subTitle: null, textContent: "——AI时代的版权可信数智基础设施", imageUrl: null, linkUrl: null, sortOrder: 1, status: "0" },
    { id: "202", navId: "2112378438006984706", contentKey: "system_desc", title: "DCI体系", subTitle: null, textContent: "DCI体系是以DCI国家标准为引领，以标准化标识为基础手段，以AI、区块链等新技术的系统集成应用为驱动，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。", imageUrl: null, linkUrl: null, sortOrder: 2, status: "ACTIVE" },
    { id: "203", navId: "2112378438006984706", contentKey: "history_1", title: "DCI体系1.0 (2011-2017)", subTitle: "2011-2017", textContent: "提出DCI体系概念、研制核心标准。", imageUrl: null, linkUrl: null, sortOrder: 3, status: "ACTIVE" },
    { id: "204", navId: "2112378438006984706", contentKey: "history_2", title: "DCI体系2.0 (2018-2021)", subTitle: "2018-2021", textContent: "面向内容创作终端与发布源头，聚力推进关键技术能力研发集成及版权服务基础设施建设。", imageUrl: null, linkUrl: null, sortOrder: 4, status: "ACTIVE" },
    { id: "205", navId: "2112378438006984706", contentKey: "history_3", title: "DCI体系3.0 (2022-2024)", subTitle: "2022-2024", textContent: "以 “区块链 +”“人工智能 +” 融合应用为驱动，联合各伙伴单位共建数字版权链（DCI 体系 3.0），聚焦研发孵化平台级版权智能化可信服务能力，夯实数字版权服务技术底座。", imageUrl: null, linkUrl: null, sortOrder: 5, status: "ACTIVE" },
    { id: "206", navId: "2112378438006984706", contentKey: "history_4", title: "DCI体系4.0 (2025-)", subTitle: "2025-", textContent: "以DCI国家标准发布实施为契机，以AI等新技术在版权领域的集成创新应用为驱动，打造全球版权数据中心1.0，探索构建AI时代的版权可信数据基础设施和版权全生命周期解决方案。", imageUrl: null, linkUrl: null, sortOrder: 6, status: "ACTIVE" },
  ],
  "3": [
    { id: "301", navId: "3", contentKey: "standard_desc", title: "DCI标准体系", subTitle: null, textContent: "DCI体系始终以标准为创新引领，逐步构建以DCI国家标准为核心的版权标准体系，并面向音视图文等各垂直领域数字生态及AI新业态新场景开展贯标试点应用。", imageUrl: null, linkUrl: null, sortOrder: 1, status: "ACTIVE" },
    { id: "302", navId: "3", contentKey: "dci_intro", title: "DCI", subTitle: null, textContent: "DCI，英文全称Digital Copyright Identifier，中文名称为数字版权唯一标识符。是数字网络环境下用于唯一标识和描述权利人对其符合作品特征的智力成果享有权益的一组字符，适用于版权创造、运用、保护、管理、服务等全生命周期的标识体系构建与数据互操作。", imageUrl: null, linkUrl: null, sortOrder: 2, status: "ACTIVE" },
    { id: "303", navId: "3", contentKey: "national_standard", title: "国家标准", subTitle: null, textContent: "《GB/T 45913-2025数字版权唯一标识符（DCI）》国家标准由国家市场监督管理总局和国标委共同发布2025年11月1日起正式实施。", imageUrl: null, linkUrl: null, sortOrder: 3, status: "ACTIVE" },
    { id: "304", navId: "3", contentKey: "industry_standard", title: "行业标准", subTitle: null, textContent: "行业标准体系覆盖数字版权核心元数据规范、标识编码与解析、版权资产跨链流通及全网监测保护技术标准。", imageUrl: null, linkUrl: null, sortOrder: 4, status: "ACTIVE" },
  ],
  "4": [
    { id: "401", navId: "4", contentKey: "banner", title: "DCI注册中心", subTitle: "——DCI可信生态合作伙伴", textContent: "DCI注册中心是经DCI管理中心评估认证的DCI可信生态合作伙伴，负责 DCI 业务的标准化落地与数据运营。", imageUrl: null, linkUrl: null, sortOrder: 1, status: "0" },
    { id: "402", navId: "4", contentKey: "apply_intro", title: "如何申请成为DCI注册中心", subTitle: null, textContent: "具备互联网平台运营资格与数据治理能力的企事业单位，均可通过主页“如何申请成为 DCI 注册中心”在线提交主体资质材料，经评估认证后签订合作协议。", imageUrl: null, linkUrl: null, sortOrder: 2, status: "ACTIVE" },
    { id: "403", navId: "4", contentKey: "regorg_duty", title: "DCI注册中心职责", subTitle: null, textContent: "DCI注册中心是经DCI管理中心评估认证的DCI可信生态合作伙伴，负责 DCI 业务的标准化落地与数据运营。", imageUrl: null, linkUrl: null, sortOrder: 3, status: "ACTIVE" },
  ],
  "5": [
    { id: "501", navId: "5", contentKey: "eco_desc", title: "DCI可信生态伙伴", subTitle: null, textContent: "秉承“共建、共治、共享”理念，共同构建DCI可信生态。", imageUrl: null, linkUrl: null, sortOrder: 1, status: "ACTIVE" },
  ],
  "6": [
    { id: "601", navId: "6", contentKey: "lab_desc", title: "DCI联合实验室", subTitle: null, textContent: "DCI技术研究与应用联合实验室，探索AI时代的数字版权技术前沿。", imageUrl: null, linkUrl: null, sortOrder: 1, status: "ACTIVE" },
    { id: "602", navId: "6", contentKey: "banner", title: "DCI技术研究与应用联合实验室", subTitle: null, textContent: "探索AI时代的数字版权技术前沿", imageUrl: null, linkUrl: null, sortOrder: 1, status: "ACTIVE" },
    { id: "603", navId: "6", contentKey: "lab_direction", title: "DCI实验室科研方向", subTitle: null, textContent: "作为版权科技的倡导者、践行者和传播者，DCI实验室始终坚持“共建、共治、共享”的核心理念。", imageUrl: null, linkUrl: null, sortOrder: 3, status: "ACTIVE" },
    { id: "604", navId: "6", contentKey: "lab_result", title: "DCI实验室核心科研成果", subTitle: null, textContent: "版权智能能力，研发攻关版权登记智能辅助审核能力。", imageUrl: null, linkUrl: null, sortOrder: 4, status: "0" },
  ],
  "7": [],
  "8": [],
  "9": [],
  "10": [
    { id: "1001c", navId: "10", contentKey: "banner", title: "DCI®技术服务中心", subTitle: null, textContent: "以DCI国家标准为引领，以DCI体系4.0（全球版权数据中心）版权数智基础设施为底层支撑，基于DCI可信版权数据构建的技术服务支撑能力", imageUrl: null, linkUrl: null, sortOrder: 1, status: "0" },
    { id: "1002c", navId: "10", contentKey: "verify_section", title: "版权核验", subTitle: null, textContent: "基于DCI国家标准和全球版权数据中心的可信版权数据，面向机构提供版权核验标准化服务", imageUrl: null, linkUrl: null, sortOrder: 2, status: "0" },
    { id: "1003c", navId: "10", contentKey: "verify_card_1", title: "DCI核验", subTitle: null, textContent: "对提供的DCI码或作品样本进行核验，确认DCI码的真实性和有效性。", imageUrl: null, linkUrl: null, sortOrder: 3, status: "ACTIVE" },
  ],
};

fs.mkdirSync(captureDir, { recursive: true });
fs.writeFileSync(
  path.join(captureDir, "portal-data.json"),
  JSON.stringify({ nav: NAV_LIST, articles: ARTICLES, contents: CONTENTS }, null, 2),
);

function ok100(data, msg = "查询成功") {
  return {
    code: 1000000,
    msg,
    data,
    success: true,
    traceId: "",
    timestamp: new Date().toISOString(),
  };
}
function page(rows, total) {
  return {
    code: 1000000,
    msg: "成功",
    rows,
    total: String(total != null ? total : rows.length),
  };
}

// ── 1) shims ───────────────────────────────────────────────────────
const vueShim = `/* live vue.runtime letter exports → ops index-DsYmzmNg */
import{c as _C,i as _D,k as _Dt,y as _E,d as _O,S as _Q,n as _S,G as _W,z as _Y,f as _Z,D as __t,t as _an,h as _b,N as _ct,l as _d,F as _m,o as _q,j as _st,T as _u,m as _x,x as _y,r as _yt}from"./index-DsYmzmNg.js";
const _noop=()=>{};
export{_C as C,_D as D,_Dt as Dt,_E as E,_noop as Lt,_noop as N,_O as O,_Q as Q,_S as S,_W as W,_Y as Y,_Z as Z,__t as _t,_an as an,_b as b,_ct as ct,_d as d,_noop as ft,_noop as i,_m as m,_q as q,_st as st,_u as u,_x as x,_y as y,_yt as yt};
`;
fs.writeFileSync(path.join(mirrorJs, "vue-runtime-ops-shim.js"), vueShim);

const portalApi = `import{a8 as e}from"./index-DsYmzmNg.js";
function t(t){return e({url:"/dci/portal/nav/list",method:"get",params:t})}
function n(t){return e({url:"/dci/portal/nav/"+t,method:"get"})}
function r(t){return e({url:"/dci/portal/nav",method:"post",data:t})}
function i(t){return e({url:"/dci/portal/nav/"+t,method:"delete"})}
function a(t){return e({url:"/dci/portal/nav/"+t+"/contents",method:"get"})}
function o(t){return e({url:"/dci/portal/nav/content",method:"post",data:t})}
function s(t){return e({url:"/dci/portal/nav/content/"+t,method:"delete"})}
function c(t){return e({url:"/dci/portal/block/list",method:"get",params:t})}
function l(t){return e({url:"/dci/portal/block/save",method:"post",data:t})}
function u(t){return e({url:"/dci/portal/article/list",method:"get",params:t})}
function d(t){return e({url:"/dci/portal/article",method:"post",data:t})}
function f(t){return e({url:"/dci/portal/article/"+t,method:"delete"})}
function p(t,n){return e({url:"/dci/portal/article/"+t+"/audit",method:"put",params:{status:n}})}
export{n as a,c,d,l as f,i,t as l,s as n,a as o,r as p,f as r,u as s,p as t,o as u};
`;
fs.writeFileSync(path.join(mirrorJs, "portal-api-ops.js"), portalApi);

const msgShim = `function pick(){
  const EP=window.ElementPlus||window.ELEMENT||{};
  return {
    Message: EP.ElMessage||window.ElMessage||null,
    MessageBox: EP.ElMessageBox||window.ElMessageBox||null
  };
}
function toast(type,msg){
  const {Message}=pick();
  if(Message&&typeof Message[type]==="function") return Message[type](msg);
  if(Message&&typeof Message==="function") return Message({type,message:msg});
  console.log("[portal]",type,msg);
}
export const t={
  success(m){toast("success",m)},
  warning(m){toast("warning",m)},
  error(m){toast("error",m)},
  info(m){toast("info",m)}
};
`;
fs.writeFileSync(path.join(mirrorJs, "portal-message-shim.js"), msgShim);

const msgboxShim = `function pickBox(){
  const EP=window.ElementPlus||window.ELEMENT||{};
  return EP.ElMessageBox||window.ElMessageBox||null;
}
export const R={
  confirm(msg,title,opts){
    const box=pickBox();
    if(box&&typeof box.confirm==="function") return box.confirm(msg,title||"提示",opts||{});
    return window.confirm((title?title+"\\n":"")+msg)?Promise.resolve("confirm"):Promise.reject("cancel");
  }
};
`;
fs.writeFileSync(path.join(mirrorJs, "portal-msgbox-shim.js"), msgboxShim);

const usedictShim = `import{a9 as useDict}from"./index-DsYmzmNg.js";
export{useDict as c};
`;
fs.writeFileSync(path.join(mirrorJs, "portal-usedict-shim.js"), usedictShim);

const pluginHelper = fs.readFileSync(
  path.join(captureDir, "_plugin-vue_export-helper-BDNMzG2s.js"),
  "utf8",
);
fs.writeFileSync(path.join(mirrorJs, "_plugin-vue_export-helper-BDNMzG2s.js"), pluginHelper);

// ── 2) remap live nav/article chunks ───────────────────────────────
function remapChunk(srcName, outName, replacements) {
  let src = fs.readFileSync(path.join(captureDir, srcName), "utf8");
  for (const [from, to] of replacements) {
    if (!src.includes(from)) {
      console.warn("warn: pattern not found in", srcName, from.slice(0, 80));
    }
    src = src.split(from).join(to);
  }
  fs.writeFileSync(path.join(mirrorJs, outName), src);
  console.log("wrote", outName);
}

remapChunk("nav-DJE1X9l6.js", "nav-opsPortal.js", [
  [
    'from"./vue.runtime.esm-bundler-BBGdfCsq.js"',
    'from"./vue-runtime-ops-shim.js"',
  ],
  ['from"./message-BHVgpfkV.js"', 'from"./portal-message-shim.js"'],
  ['from"./router-B9xMDN7Y.js"', 'from"./portal-msgbox-shim.js"'],
  ['from"./index-iqoS587T.js"', 'from"./portal-usedict-shim.js"'],
  ['from"./portal-roTwjFkg.js"', 'from"./portal-api-ops.js"'],
]);

// Drop「快捷选择系统预设」row in 新增内容条目 dialog
{
  const navOut = path.join(mirrorJs, "nav-opsPortal.js");
  let navBody = fs.readFileSync(navOut, "utf8");
  const marker = "快捷选择系统预设";
  const mi = navBody.indexOf(marker);
  if (mi >= 0) {
    const start = navBody.lastIndexOf("!X.value.id&&ke.value.length>0?", mi);
    let end = -1;
    for (let j = mi; j < navBody.length - 12; j++) {
      if (navBody.startsWith(":o(", j)) {
        const slice = navBody.slice(j, j + 16);
        if (slice.includes("!0)")) {
          end = j + slice.indexOf("!0)") + 3;
          break;
        }
      }
    }
    if (start >= 0 && end > start) {
      navBody =
        navBody.slice(0, start) + "o(" + "``" + ",!0)" + navBody.slice(end);
      fs.writeFileSync(navOut, navBody);
      console.log("stripped nav preset quick-select");
    }
  }
}

remapChunk("article-CamFXJY1.js", "article-opsPortal.js", [
  [
    'from"./vue.runtime.esm-bundler-BBGdfCsq.js"',
    'from"./vue-runtime-ops-shim.js"',
  ],
  ['from"./message-BHVgpfkV.js"', 'from"./portal-message-shim.js"'],
  ['from"./router-B9xMDN7Y.js"', 'from"./portal-msgbox-shim.js"'],
  ['from"./portal-roTwjFkg.js"', 'from"./portal-api-ops.js"'],
]);

const navCss = fs.readFileSync(path.join(captureDir, "nav-D2b_j7ZF.css"), "utf8");
fs.writeFileSync(path.join(mirrorCss, "nav-opsPortal.css"), navCss);
const artCssPath = path.join(captureDir, "article-B5PpyEKX.css");
fs.writeFileSync(
  path.join(mirrorCss, "article-opsPortal.css"),
  fs.existsSync(artCssPath) ? fs.readFileSync(artCssPath, "utf8") : "",
);

// ── 3) import map ──────────────────────────────────────────────────
let idx = fs.readFileSync(mainIdx, "utf8");
if (!idx.includes("dci/portal/nav/index.vue")) {
  const needle = '"../../views/dci/bizConsult/index.vue"';
  if (!idx.includes(needle)) throw new Error("bizConsult import map entry missing");
  idx = idx.replace(
    needle,
    '"../../views/dci/portal/nav/index.vue":()=>Pe(()=>import("./nav-opsPortal.js"),__vite__mapDeps([])),"../../views/dci/portal/article/index.vue":()=>Pe(()=>import("./article-opsPortal.js"),__vite__mapDeps([])),' +
      needle,
  );
  // Also register CSS side-effect via injecting link in pages? Vite mapDeps empty is ok;
  // inject CSS import at top of remapped chunks instead.
  fs.writeFileSync(mainIdx, idx);
  console.log("patched import map");
} else {
  console.log("import map already has portal");
}

// Ensure CSS loads with pages
for (const [jsName, cssHref] of [
  ["nav-opsPortal.js", "../css/nav-opsPortal.css"],
  ["article-opsPortal.js", "../css/article-opsPortal.css"],
]) {
  const p = path.join(mirrorJs, jsName);
  let body = fs.readFileSync(p, "utf8");
  if (!body.includes(cssHref) && !body.includes("nav-opsPortal.css") && !body.includes("article-opsPortal.css")) {
    body =
      `(()=>{try{const l=document.createElement("link");l.rel="stylesheet";l.href=new URL("${cssHref}",import.meta.url).href;document.head.appendChild(l)}catch{}})();\n` +
      body;
    fs.writeFileSync(p, body);
  }
}

// ── 4) store + menu ────────────────────────────────────────────────
const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
store["GET /api/v1/dciManage/dci/portal/nav/list"] = ok100(NAV_LIST);
for (const row of NAV_LIST) {
  store[`GET /api/v1/dciManage/dci/portal/nav/${row.id}`] = ok100(row);
  store[`GET /api/v1/dciManage/dci/portal/nav/${row.id}/contents`] = ok100(
    CONTENTS[row.id] || [],
  );
}
store["GET /api/v1/dciManage/dci/portal/article/list"] = page(ARTICLES);
store["GET /api/v1/dciManage/dci/portal/article/list?pageNum=1&pageSize=10"] =
  page(ARTICLES);
store[
  "GET /api/v1/dciManage/dci/portal/article/list?pageNum=1&pageSize=10&category=FAQ"
] = page(ARTICLES);

// dict for sys_normal_disable (0=正常, 1=停用) — RuoYi shape
const dictRows = [
  { dictLabel: "正常", dictValue: "0", listClass: "success", cssClass: "", status: "0", default: true },
  { dictLabel: "停用", dictValue: "1", listClass: "danger", cssClass: "", status: "0", default: false },
];
store["GET /api/v1/dciManage/system/dict/data/type/sys_normal_disable"] = {
  code: 1000000,
  msg: "查询成功",
  data: dictRows,
  success: true,
};
store["GET /system/dict/data/type/sys_normal_disable"] = {
  code: 1000000,
  msg: "查询成功",
  data: dictRows,
  success: true,
};

const portalMenu = {
  name: "Portal",
  path: "/portal",
  hidden: false,
  redirect: "noRedirect",
  component: "Layout",
  alwaysShow: true,
  meta: { title: "门户管理", icon: "guide", noCache: false, link: null },
  children: [
    {
      name: "Account",
      path: "account",
      hidden: false,
      component: "dci/account/index",
      meta: { title: "门户用户管理", icon: "#", noCache: false, link: null },
    },
    {
      name: "BizConsult",
      path: "bizConsult",
      hidden: false,
      component: "dci/bizConsult/index",
      meta: { title: "业务咨询管理", icon: "#", noCache: false, link: null },
    },
    {
      name: "Nav",
      path: "nav",
      hidden: false,
      component: "dci/portal/nav/index",
      meta: { title: "栏目管理", icon: "#", noCache: false, link: null },
    },
    {
      name: "Article",
      path: "article",
      hidden: false,
      component: "dci/portal/article/index",
      meta: { title: "内容编辑管理", icon: "#", noCache: false, link: null },
    },
  ],
};

const routersKey = Object.keys(store).find((k) => k.includes("getRouters"));
if (!routersKey) throw new Error("getRouters missing");
const routers = store[routersKey];
let replaced = false;
routers.data = (routers.data || []).map((n) => {
  const title = (n.meta && n.meta.title) || "";
  const p = String(n.path || "");
  if (
    p === "/contentManag" ||
    p === "/portal" ||
    title === "门户内容管理" ||
    title === "门户管理"
  ) {
    replaced = true;
    return portalMenu;
  }
  return n;
});
if (!replaced) {
  const sysIdx = routers.data.findIndex(
    (n) => n.path === "/system" || (n.meta && n.meta.title === "系统管理"),
  );
  if (sysIdx >= 0) routers.data.splice(sysIdx, 0, portalMenu);
  else routers.data.push(portalMenu);
}

fs.writeFileSync(jsonPath, JSON.stringify(store));
fs.writeFileSync(
  storeJsPath,
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n",
);
console.log("updated mock store + menu");

// ── 5) mock API handlers ───────────────────────────────────────────
let api = fs.readFileSync(apiPath, "utf8");
if (!api.includes("portalNavMockHandle")) {
  const helper = `
  function portalOk100(data, msg) {
    return { code: 1000000, msg: msg || "成功", data: data === undefined ? null : data, success: true, traceId: "", timestamp: new Date().toISOString() };
  }
  function portalPage(rows, total) {
    return { code: 1000000, msg: "成功", rows: rows || [], total: String(total != null ? total : (rows || []).length) };
  }
  function ensurePortalStore() {
    var store = window.__OPS_MOCK_STORE__ || {};
    if (!store.__portalNavList) {
      var hit = store["GET /api/v1/dciManage/dci/portal/nav/list"];
      store.__portalNavList = (hit && hit.data) ? JSON.parse(JSON.stringify(hit.data)) : [];
    }
    if (!store.__portalContents) {
      store.__portalContents = {};
      for (var k in store) {
        if (!Object.prototype.hasOwnProperty.call(store, k)) continue;
        var m = k.match(/\\/dci\\/portal\\/nav\\/([^/]+)\\/contents$/);
        if (m && store[k] && store[k].data) store.__portalContents[m[1]] = JSON.parse(JSON.stringify(store[k].data));
      }
    }
    if (!store.__portalArticles) {
      var ahit = store["GET /api/v1/dciManage/dci/portal/article/list"];
      store.__portalArticles = (ahit && ahit.rows) ? JSON.parse(JSON.stringify(ahit.rows)) : [];
    }
    return store;
  }
  function portalNavMockHandle(method, path, data, rawUrl) {
    if (path.indexOf("/dci/portal/") !== 0 && path.indexOf("/system/dict/data/type/sys_normal_disable") !== 0) return null;
    var store = ensurePortalStore();
    var m = String(method || "GET").toUpperCase();
    if ((path === "/system/dict/data/type/sys_normal_disable" || path === "/api/v1/dciManage/system/dict/data/type/sys_normal_disable") && m === "GET") {
      return portalOk100([
        { dictLabel: "正常", dictValue: "0", listClass: "success", cssClass: "", status: "0" },
        { dictLabel: "停用", dictValue: "1", listClass: "danger", cssClass: "", status: "0" }
      ]);
    }
    if (path.indexOf("/dci/portal/") !== 0) return null;
    if (path === "/dci/portal/nav/list" && m === "GET") {
      return portalOk100(store.__portalNavList.slice());
    }
    var navOne = path.match(/^\\/dci\\/portal\\/nav\\/([^/]+)$/);
    if (navOne && m === "GET") {
      var id = decodeURIComponent(navOne[1]);
      for (var i = 0; i < store.__portalNavList.length; i++) {
        if (String(store.__portalNavList[i].id) === id) return portalOk100(store.__portalNavList[i]);
      }
      return portalOk100(null);
    }
    if (path === "/dci/portal/nav" && m === "POST") {
      var row = Object.assign({}, data || {});
      if (!row.id) row.id = String(Date.now());
      var found = false;
      for (var j = 0; j < store.__portalNavList.length; j++) {
        if (String(store.__portalNavList[j].id) === String(row.id)) {
          store.__portalNavList[j] = Object.assign({}, store.__portalNavList[j], row);
          found = true; break;
        }
      }
      if (!found) store.__portalNavList.push(row);
      store["GET /api/v1/dciManage/dci/portal/nav/list"] = portalOk100(store.__portalNavList);
      return portalOk100(row, "保存成功");
    }
    if (navOne && m === "DELETE") {
      var did = decodeURIComponent(navOne[1]);
      store.__portalNavList = store.__portalNavList.filter(function (r) { return String(r.id) !== did; });
      delete store.__portalContents[did];
      store["GET /api/v1/dciManage/dci/portal/nav/list"] = portalOk100(store.__portalNavList);
      return portalOk100(null, "删除成功");
    }
    var contents = path.match(/^\\/dci\\/portal\\/nav\\/([^/]+)\\/contents$/);
    if (contents && m === "GET") {
      var cid = decodeURIComponent(contents[1]);
      return portalOk100((store.__portalContents[cid] || []).slice());
    }
    if (path === "/dci/portal/nav/content" && m === "POST") {
      var c = Object.assign({}, data || {});
      if (!c.id) c.id = String(Date.now());
      var nid = String(c.navId || "");
      if (!store.__portalContents[nid]) store.__portalContents[nid] = [];
      var clist = store.__portalContents[nid];
      var cfound = false;
      for (var x = 0; x < clist.length; x++) {
        if (String(clist[x].id) === String(c.id)) { clist[x] = Object.assign({}, clist[x], c); cfound = true; break; }
      }
      if (!cfound) clist.push(c);
      return portalOk100(c, "保存成功");
    }
    var cdel = path.match(/^\\/dci\\/portal\\/nav\\/content\\/([^/]+)$/);
    if (cdel && m === "DELETE") {
      var cdid = decodeURIComponent(cdel[1]);
      Object.keys(store.__portalContents).forEach(function (k) {
        store.__portalContents[k] = (store.__portalContents[k] || []).filter(function (r) { return String(r.id) !== cdid; });
      });
      return portalOk100(null, "删除成功");
    }
    if (path === "/dci/portal/article/list" && m === "GET") {
      var qTitle = parsedSearchParam(rawUrl, "title");
      var qStatus = parsedSearchParam(rawUrl, "status");
      var qAudit = parsedSearchParam(rawUrl, "auditStatus");
      var qCat = parsedSearchParam(rawUrl, "category") || "FAQ";
      var list = store.__portalArticles.slice();
      if (qCat) list = list.filter(function (r) { return r.category === qCat; });
      if (qTitle) list = list.filter(function (r) { return String(r.title || "").indexOf(qTitle) >= 0; });
      if (qStatus) list = list.filter(function (r) { return r.status === qStatus; });
      if (qAudit) list = list.filter(function (r) { return r.auditStatus === qAudit; });
      return portalPage(list, list.length);
    }
    if (path === "/dci/portal/article" && m === "POST") {
      var art = Object.assign({}, data || {});
      if (!art.id) {
        art.id = String(Date.now());
        art.status = art.status || "DRAFT";
        art.auditStatus = art.auditStatus || "PENDING";
        art.createdAt = new Date().toISOString().replace("T", " ").slice(0, 19);
      }
      art.updatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
      var af = false;
      for (var ai = 0; ai < store.__portalArticles.length; ai++) {
        if (String(store.__portalArticles[ai].id) === String(art.id)) {
          store.__portalArticles[ai] = Object.assign({}, store.__portalArticles[ai], art, {
            status: "DRAFT",
            auditStatus: "PENDING"
          });
          af = true; break;
        }
      }
      if (!af) store.__portalArticles.push(art);
      return portalOk100(art, "保存成功");
    }
    var adel = path.match(/^\\/dci\\/portal\\/article\\/([^/]+)$/);
    if (adel && m === "DELETE") {
      var adid = decodeURIComponent(adel[1]);
      store.__portalArticles = store.__portalArticles.filter(function (r) { return String(r.id) !== adid; });
      return portalOk100(null, "删除成功");
    }
    var aaudit = path.match(/^\\/dci\\/portal\\/article\\/([^/]+)\\/audit$/);
    if (aaudit && (m === "PUT" || m === "POST")) {
      var aaid = decodeURIComponent(aaudit[1]);
      var st = parsedSearchParam(rawUrl, "status") || (data && data.status) || "PUBLISHED";
      for (var aj = 0; aj < store.__portalArticles.length; aj++) {
        if (String(store.__portalArticles[aj].id) === aaid) {
          if (st === "PUBLISHED") {
            store.__portalArticles[aj].status = "PUBLISHED";
            store.__portalArticles[aj].auditStatus = "PASS";
          } else if (st === "OFFLINE") {
            store.__portalArticles[aj].status = "OFFLINE";
          } else {
            store.__portalArticles[aj].status = st;
          }
          return portalOk100(store.__portalArticles[aj], "操作成功");
        }
      }
      return portalOk100(null);
    }
    if (path === "/dci/portal/block/list" && m === "GET") return portalOk100([]);
    if (path === "/dci/portal/block/save" && m === "POST") return portalOk100(data || {}, "保存成功");
    return null;
  }
`;
  if (!api.includes("function handle(method, rawUrl, body)")) {
    throw new Error("handle() not found");
  }
  api = api.replace(
    "function handle(method, rawUrl, body)",
    helper + "\n  function handle(method, rawUrl, body)",
  );
  api = api.replace(
    "function handle(method, rawUrl, body) {\n    var m = String(method || \"GET\").toUpperCase();\n    var path = apiPath(rawUrl);\n    var data = parseBody(body);",
    "function handle(method, rawUrl, body) {\n    var m = String(method || \"GET\").toUpperCase();\n    var path = apiPath(rawUrl);\n    var data = parseBody(body);\n    var portalHit = portalNavMockHandle(m, path, data, rawUrl);\n    if (portalHit) return portalHit;",
  );
  fs.writeFileSync(apiPath, api);
  console.log("patched ops-mock-api.js");
} else {
  console.log("ops-mock-api already has portal handlers");
}

// ── 6) spa-fallback ────────────────────────────────────────────────
let spa = fs.readFileSync(spaFallback, "utf8");
const portalRoutes = [
  "portal",
  "portal/nav",
  "portal/article",
  "portal/account",
  "portal/bizConsult",
];
for (const route of portalRoutes) {
  if (!spa.includes('"' + route + '"')) {
    spa = spa.replace(
      '  "contentManag",',
      '  "contentManag",\n  "' + route + '",',
    );
  }
}
fs.writeFileSync(spaFallback, spa);

// ── 7) cache bust ──────────────────────────────────────────────────
let html = fs.readFileSync(indexHtml, "utf8");
html = html.replace(
  /ops-mock-store\.js(\?v=[^"]*)?/,
  "ops-mock-store.js?v=portal-20261118b",
);
html = html.replace(
  /ops-mock-api\.js(\?v=[^"]*)?/,
  "ops-mock-api.js?v=portal-20261118b",
);
fs.writeFileSync(indexHtml, html);

console.log("install-portal-pages done");
