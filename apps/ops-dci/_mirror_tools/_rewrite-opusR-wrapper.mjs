import fs from "node:fs";

const BACK = "/dciCodeManage/allocation";
const body = `import{d as defineComponent,u as useRoute,a as useRouter,r as ref,G as onMounted,f as resolveComponent,o as openBlock,c as createElementBlock,h as createElementVNode,i as createVNode,j as withCtx,y as createTextVNode,a6 as ElMessage,_ as _export_sfc}from"./index-DsYmzmNg.js";import{g as fetchInfo}from"./codeManage-CIC4UakA.js";import Detail from"./DciEntityDetail.js";import"../css/DciEntityDetail.css";
const _hoisted_1={class:"ded-alloc"};
const _hoisted_2={class:"header-bar"};
const Comp=defineComponent({name:"DciOpusRdetails",setup(){
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
    if(!id){ElMessage.warning(${JSON.stringify("\u7f3a\u5c11\u4e3b\u952e\u53c2\u6570")});loading.value=!1;return}
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
        "code-type":"R",
        "show-title":true,
        "empty-text":${JSON.stringify("\u672a\u67e5\u8be2\u5230\u4f5c\u54c1 R \u7801\u8be6\u60c5")}
      },null,8,["detail","loading"])
    ]);
  }
}});
export default _export_sfc(Comp,[["__scopeId","data-v-c50cba18"]]);
`;
fs.writeFileSync("apps/ops-dci/mirror/static/js/opusRdetails-BcBlhLGL.js", body, "utf8");
console.log("rewrote opusR wrapper");

// Fix softR warning encoding if garbled
const soft = "apps/ops-dci/mirror/static/js/softRdetails-C7nosZyJ.js";
let s = fs.readFileSync(soft, "utf8");
s = s.replace(
  /ElMessage\.warning\("[^"]+"\)/,
  `ElMessage.warning(${JSON.stringify("\u7f3a\u5c11\u4e3b\u952e\u53c2\u6570")})`,
);
fs.writeFileSync(soft, s, "utf8");
console.log("fixed softR warning");
