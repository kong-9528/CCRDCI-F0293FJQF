/**
 * Wire allocation details to DciEntityDetail + safe back to /dciCodeManage/allocation
 * + mock applyDoc *Info payloads aligned with reference pages.
 */
import fs from "node:fs";
import path from "node:path";

const jsDir = "apps/ops-dci/mirror/static/js";
const BACK = "/dciCodeManage/allocation";

const wrappers = [
  { file: "softRdetails-C7nosZyJ.js", name: "DciSoftRdetails", entity: "soft", code: "R", api: "f as fetchInfo", empty: "未查询到软件 R 码详情", scope: "data-v-a517a32b" },
  { file: "softCdetails-ykzNbHOg.js", name: "DciSoftCdetails", entity: "soft", code: "C", api: "h as fetchInfo", empty: "未查询到软件 C 码详情", scope: "data-v-7ab47905" },
  { file: "softXdetails-Bzn_5q9r.js", name: "DciSoftXdetails", entity: "soft", code: "X", api: "i as fetchInfo", empty: "未查询到软件 X 码详情", scope: "data-v-softx01" },
  { file: "datasetRdetails-dqAwL1B4.js", name: "DciDatasetRdetails", entity: "dataset", code: "R", api: "j as fetchInfo", empty: "未查询到数据集 R 码详情", scope: "data-v-2cc6c920", note: "dataset API has no rInfo; reuse cInfo export j as placeholder — mock will answer /dataset/rInfo too" },
  { file: "datasetCdetails-CgojRYpN.js", name: "DciDatasetCdetails", entity: "dataset", code: "C", api: "j as fetchInfo", empty: "未查询到数据集 C 码详情", scope: "data-v-datasetc" },
  { file: "datasetXdetails-ybN1I1YA.js", name: "DciDatasetXdetails", entity: "dataset", code: "X", api: "k as fetchInfo", empty: "未查询到数据集 X 码详情", scope: "data-v-datasetx" },
  { file: "opusXdetails-Cld5NkTY.js", name: "DciOpusXdetails", entity: "opus", code: "X", api: "e as fetchInfo", empty: "未查询到作品 X 码详情", scope: "data-v-opusx01" },
];

function wrapperSrc(w) {
  // dataset R: no rInfo in codeManage exports — call via custom fetch using axios from index is hard.
  // Use k (xInfo) only for X; for R use j (cInfo) path but we'll intercept mock by URL from a tiny inline fetch.
  const apiImport = w.entity === "dataset" && w.code === "R"
    ? null
    : w.api;

  if (w.entity === "dataset" && w.code === "R") {
    return `import{d as defineComponent,u as useRoute,a as useRouter,r as ref,G as onMounted,f as resolveComponent,o as openBlock,c as createElementBlock,h as createElementVNode,i as createVNode,j as withCtx,y as createTextVNode,a6 as ElMessage,a8 as request,_ as _export_sfc}from"./index-DsYmzmNg.js";import Detail from"./DciEntityDetail.js";import"../css/DciEntityDetail.css";
const _hoisted_1={class:"ded-alloc"};
const _hoisted_2={class:"header-bar"};
function fetchInfo(id){return request({url:"/dci/applyDoc/dataset/rInfo/"+id,method:"get"})}
const Comp=defineComponent({name:${JSON.stringify(w.name)},setup(){
  const route=useRoute(),router=useRouter(),loading=ref(!0),info=ref({});
  function back(){
    var target=${JSON.stringify(BACK)};
    try{
      var r=router&&typeof router.replace==="function"?router:null;
      if(r){
        var p=r.replace(target);
        if(p&&typeof p.catch==="function")p.catch(function(){location.assign(target)});
        return;
      }
    }catch(e){}
    location.assign(target);
  }
  async function load(){
    const id=route.params.id;
    if(!id){ElMessage.warning("缺少主键参数");loading.value=!1;return}
    loading.value=!0;
    try{const res=await fetchInfo(id);info.value=(res&&res.data)||{}}catch{info.value={}}
    finally{loading.value=!1}
  }
  onMounted(load);
  return(ctx,cache)=>{
    const ElButton=resolveComponent("el-button");
    return openBlock(),createElementBlock("div",_hoisted_1,[
      createElementVNode("div",_hoisted_2,[
        createVNode(ElButton,{onClick:back,class:"back-btn",type:"default"},{default:withCtx(()=>[createTextVNode("\\u2190 \\u8fd4\\u56de")]),_:1})
      ]),
      createVNode(Detail,{
        detail:info.value,
        loading:loading.value,
        "entity-type":"dataset",
        "code-type":"R",
        "show-title":true,
        "empty-text":${JSON.stringify(w.empty)}
      },null,8,["detail","loading"])
    ]);
  }
}});
export default _export_sfc(Comp,[["__scopeId",${JSON.stringify(w.scope)}]]);
`.replace("\\u2190 \\u8fd4\\u56de", "\u2190 \u8fd4\u56de");
  }

  return `import{d as defineComponent,u as useRoute,a as useRouter,r as ref,G as onMounted,f as resolveComponent,o as openBlock,c as createElementBlock,h as createElementVNode,i as createVNode,j as withCtx,y as createTextVNode,a6 as ElMessage,_ as _export_sfc}from"./index-DsYmzmNg.js";import{${apiImport}}from"./codeManage-CIC4UakA.js";import Detail from"./DciEntityDetail.js";import"../css/DciEntityDetail.css";
const _hoisted_1={class:"ded-alloc"};
const _hoisted_2={class:"header-bar"};
const Comp=defineComponent({name:${JSON.stringify(w.name)},setup(){
  const route=useRoute(),router=useRouter(),loading=ref(!0),info=ref({});
  function back(){
    var target=${JSON.stringify(BACK)};
    try{
      var r=router&&typeof router.replace==="function"?router:null;
      if(r){
        var p=r.replace(target);
        if(p&&typeof p.catch==="function")p.catch(function(){location.assign(target)});
        return;
      }
    }catch(e){}
    location.assign(target);
  }
  async function load(){
    const id=route.params.id;
    if(!id){ElMessage.warning("缺少主键参数");loading.value=!1;return}
    loading.value=!0;
    try{const res=await fetchInfo(id);info.value=(res&&res.data)||{}}catch{info.value={}}
    finally{loading.value=!1}
  }
  onMounted(load);
  return(ctx,cache)=>{
    const ElButton=resolveComponent("el-button");
    return openBlock(),createElementBlock("div",_hoisted_1,[
      createElementVNode("div",_hoisted_2,[
        createVNode(ElButton,{onClick:back,class:"back-btn",type:"default"},{default:withCtx(()=>[createTextVNode(${JSON.stringify("\u2190 \u8fd4\u56de")})]),_:1})
      ]),
      createVNode(Detail,{
        detail:info.value,
        loading:loading.value,
        "entity-type":${JSON.stringify(w.entity)},
        "code-type":${JSON.stringify(w.code)},
        "show-title":true,
        "empty-text":${JSON.stringify(w.empty)}
      },null,8,["detail","loading"])
    ]);
  }
}});
export default _export_sfc(Comp,[["__scopeId",${JSON.stringify(w.scope)}]]);
`;
}

for (const w of wrappers) {
  fs.writeFileSync(path.join(jsDir, w.file), wrapperSrc(w), "utf8");
  console.log("rewrote", w.file);
}

// Fix DciEntityDetail render ref binding
{
  const f = path.join(jsDir, "DciEntityDetail.js");
  let s = fs.readFileSync(f, "utf8");
  s = s.replace(
    'return openBlock(), createElementBlock("div", { class: "ded-page", ref_key: "root", ref: root });',
    'return openBlock(), createElementBlock("div", { class: "ded-page", ref: root });',
  );
  fs.writeFileSync(f, s, "utf8");
  console.log("fixed DciEntityDetail ref");
}

// opusR: full-row + back
{
  const f = path.join(jsDir, "opusRdetails-BcBlhLGL.js");
  let s = fs.readFileSync(f, "utf8");
  s = s.replace('ws={class:"info-item"}', 'ws={class:"info-item full-row"}');
  if (!s.includes("goBack") && s.includes("const D=vs();ms();")) {
    s = s.replace("const D=vs();ms();", "const D=vs(),$router=ms();");
    s = s.replace(
      "async function ds()",
      `function goBack(){try{var p=$router.replace?$router.replace(${JSON.stringify(BACK)}):$router.push(${JSON.stringify(BACK)});p&&p.catch&&p.catch(function(){location.assign(${JSON.stringify(BACK)})})}catch(e){location.assign(${JSON.stringify(BACK)})}}async function ds()`,
    );
    const rootOpen = 'a("div",Ds,[';
    const idx = s.indexOf(rootOpen);
    if (idx >= 0) {
      const inject =
        'd(c("el-button"),{onClick:goBack,class:"back-btn",style:{"margin-bottom":"12px"}},{default:r(()=>[f("\u2190 \u8fd4\u56de")]),_:1}),';
      s = s.slice(0, idx + rootOpen.length) + inject + s.slice(idx + rootOpen.length);
    }
  } else if (s.includes("goBack")) {
    s = s.replace(
      /function goBack\(\)\{[\s\S]*?\}async function ds/,
      `function goBack(){try{var p=$router.replace?$router.replace(${JSON.stringify(BACK)}):$router.push(${JSON.stringify(BACK)});p&&p.catch&&p.catch(function(){location.assign(${JSON.stringify(BACK)})})}catch(e){location.assign(${JSON.stringify(BACK)})}}async function ds`,
    );
  }
  fs.writeFileSync(f, s, "utf8");
  console.log("patched opusR");
}

// opusC: replace with wrapper using DciEntityDetail for consistent layout
{
  const body = `import{d as defineComponent,u as useRoute,a as useRouter,r as ref,G as onMounted,f as resolveComponent,o as openBlock,c as createElementBlock,h as createElementVNode,i as createVNode,j as withCtx,y as createTextVNode,a6 as ElMessage,_ as _export_sfc}from"./index-DsYmzmNg.js";import{b as fetchInfo}from"./codeManage-CIC4UakA.js";import Detail from"./DciEntityDetail.js";import"../css/DciEntityDetail.css";
const _hoisted_1={class:"ded-alloc"};
const _hoisted_2={class:"header-bar"};
const Comp=defineComponent({name:"DciOpusCdetails",setup(){
  const route=useRoute(),router=useRouter(),loading=ref(!0),info=ref({});
  function back(){
    var target=${JSON.stringify(BACK)};
    try{
      var r=router&&typeof router.replace==="function"?router:null;
      if(r){
        var p=r.replace(target);
        if(p&&typeof p.catch==="function")p.catch(function(){location.assign(target)});
        return;
      }
    }catch(e){}
    location.assign(target);
  }
  async function load(){
    const id=route.params.id;
    if(!id){ElMessage.warning("缺少主键参数");loading.value=!1;return}
    loading.value=!0;
    try{const res=await fetchInfo(id);info.value=(res&&res.data)||{}}catch{info.value={}}
    finally{loading.value=!1}
  }
  onMounted(load);
  return(ctx,cache)=>{
    const ElButton=resolveComponent("el-button");
    return openBlock(),createElementBlock("div",_hoisted_1,[
      createElementVNode("div",_hoisted_2,[
        createVNode(ElButton,{onClick:back,class:"back-btn",type:"default"},{default:withCtx(()=>[createTextVNode(${JSON.stringify("\u2190 \u8fd4\u56de")})]),_:1})
      ]),
      createVNode(Detail,{
        detail:info.value,
        loading:loading.value,
        "entity-type":"opus",
        "code-type":"C",
        "show-title":true,
        "empty-text":"未查询到作品 C 码详情"
      },null,8,["detail","loading"])
    ]);
  }
}});
export default _export_sfc(Comp,[["__scopeId","data-v-opusc"]]);
`;
  fs.writeFileSync(path.join(jsDir, "opusCdetails-CAAKRZHF.js"), body, "utf8");
  console.log("rewrote opusCdetails");
}

// opusRdetails CSS full-row
{
  const f = "apps/ops-dci/mirror/static/css/opusRdetails-Dd5tLsqF.css";
  let css = fs.readFileSync(f, "utf8");
  if (!css.includes("full-row")) {
    css += `.info-item.full-row[data-v-c50cba18]{grid-column:1/-1}`;
    fs.writeFileSync(f, css, "utf8");
    console.log("opusR css full-row");
  }
}

console.log("done wrappers");
