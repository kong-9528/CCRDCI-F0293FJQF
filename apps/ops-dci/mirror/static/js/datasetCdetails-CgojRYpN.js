import{d as defineComponent,u as useRoute,a as useRouter,r as ref,G as onMounted,f as resolveComponent,o as openBlock,c as createElementBlock,h as createElementVNode,i as createVNode,j as withCtx,y as createTextVNode,a6 as ElMessage,_ as _export_sfc}from"./index-DsYmzmNg.js";import{j as fetchInfo}from"./codeManage-CIC4UakA.js";import Detail from"./DciEntityDetail.js";import"../css/DciEntityDetail.css";
const _hoisted_1={class:"ded-alloc"};
const _hoisted_2={class:"header-bar"};
const Comp=defineComponent({name:"DciDatasetCdetails",setup(){
  const route=useRoute(),router=useRouter(),loading=ref(!0),info=ref({});
  function back(){
    var target="/dciCodeManage/allocation";
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
        createVNode(ElButton,{onClick:back,class:"back-btn",type:"default"},{default:withCtx(()=>[createTextVNode("← 返回")]),_:1})
      ]),
      createVNode(Detail,{
        detail:info.value,
        loading:loading.value,
        "entity-type":"dataset",
        "code-type":"C",
        "show-title":true,
        "empty-text":"未查询到数据集 C 码详情"
      },null,8,["detail","loading"])
    ]);
  }
}});
export default _export_sfc(Comp,[["__scopeId","data-v-datasetc"]]);
