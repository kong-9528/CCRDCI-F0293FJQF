import{d as m,r as u,e as k,f as l,X as C,Y as w,o as r,c as d,h as _,i as c,w as i,k as D,ay as b,j as R,A as p,ae as O,a9 as T,_ as j}from"./index-DA8BAxJb.js";import{g as N}from"./user-BAzQI6ks.js";

const U={class:"identity-container"};
const V={class:"main-card"};
const A={class:"card-header flex-row align-center"};
const E={class:"header-icon flex-col justify-center align-center"};

const FALLBACK_TYPES=["原始分配","授权分配","其他"];
const FALLBACK_APIS=["实名信息接口","实名信息修改接口","DCI申领数据同步接口","DCI撤销数据同步接口"];

function splitList(v){
  if(!v)return[];
  if(Array.isArray(v))return v.map(String).map(s=>s.trim()).filter(Boolean);
  return String(v).split(/[,，]/).map(s=>s.trim()).filter(Boolean);
}

function isConfiguredDemo(){
  try{
    const demo=window.__DCI_RCX_DEMO__;
    if(!demo||typeof demo.getModeId!=="function")return null;
    const id=demo.getModeId();
    return id==="configured"||id==="coded"||id==="basic"||id==="full";
  }catch(e){
    return null;
  }
}

function resolveView(apiData){
  const raw=apiData||{};
  const demoFlag=isConfiguredDemo();
  const demo=window.__DCI_RCX_DEMO__||{};
  // Demo switcher drives the whole identity board in real time
  if(demoFlag===false){
    return{orgCode:"",codeTypes:[],dataApis:[]};
  }
  if(demoFlag===true){
    return{
      orgCode:raw.orgCode||raw.dciRegOrgCode||"ANT",
      codeTypes:(demo.ALL_CODE_TYPES||FALLBACK_TYPES).slice(),
      dataApis:(demo.ALL_DATA_APIS||FALLBACK_APIS).slice()
    };
  }
  const types=splitList(raw.dciCodeType||raw.dciCodeTypes);
  const apis=splitList(raw.dciDataInterface||raw.dciDataInterfaces);
  if(!(raw.orgCode||types.length||apis.length)){
    return{orgCode:"",codeTypes:[],dataApis:[]};
  }
  return{
    orgCode:raw.orgCode||raw.dciRegOrgCode||"ANT",
    codeTypes:types.length?types:(demo.ALL_CODE_TYPES||FALLBACK_TYPES).slice(),
    dataApis:apis.length?apis:(demo.ALL_DATA_APIS||FALLBACK_APIS).slice()
  };
}

const X=m({name:"RegOrgIdentity"});
const Y=m({...X,setup(){
  const f=u(!1);
  const o=u({});
  const view=u({orgCode:"",codeTypes:[],dataApis:[]});
  let unsub=null;

  function syncView(){
    view.value=resolveView(o.value);
  }

  async function v(opts){
    var a;
    const silent=opts&&opts.silent;
    if(!silent)f.value=!0;
    try{
      const t=await N();
      const s=(((a=t.data)==null?void 0:a.user)||t.data||{}).userId;
      let e;
      s&&(e=await O(s));
      (!e||!e.data)&&(e=await T());
      if(e&&e.data)o.value=Object.assign({},e.data);
    }catch(t){
      console.error("获取标识信息失败:",t);
    }finally{
      if(!silent)f.value=!1;
      syncView();
    }
  }

  function onDemoChange(){
    // Immediate UI update from demo mode — do not wait for network
    syncView();
    v({silent:!0});
  }

  return k(()=>{
    syncView();
    v();
    try{
      if(window.__DCI_RCX_DEMO__&&typeof window.__DCI_RCX_DEMO__.subscribe==="function"){
        unsub=window.__DCI_RCX_DEMO__.subscribe(onDemoChange);
      }else{
        window.addEventListener("dci-rcx-demo-change",onDemoChange);
      }
    }catch(e){}
  }),(a,t)=>{
    const n=l("el-icon");
    const e=l("el-descriptions-item");
    const h=l("el-descriptions");
    const x=C("loading");
    const vv=view.value;
    return w((r(),d("div",U,[
      _("div",V,[
        _("div",A,[
          _("div",E,[c(n,null,{default:i(()=>[c(D(b))]),_:1})]),
          t[0]||(t[0]=_("span",{class:"header-title"},"DCI注册中心标识",-1))
        ]),
        c(h,{column:1,border:"",class:"custom-descriptions",key:"id-desc-"+vv.orgCode+"-"+vv.codeTypes.length+"-"+vv.dataApis.length},{default:i(()=>[
          c(e,{label:"DCI注册中心标识码"},{default:i(()=>[
            vv.orgCode
              ?(r(),d("span",{key:"code-"+vv.orgCode,class:"id-code-text"},p(vv.orgCode),1))
              :(r(),d("span",{key:"code-empty",class:"id-empty"},"（未配置）"))
          ]),_:2}),
          c(e,{label:"DCI码类型"},{default:i(()=>[
            vv.codeTypes.length
              ?(r(),d("div",{key:"types-"+vv.codeTypes.join("|"),class:"id-tag-group"},
                vv.codeTypes.map((label,idx)=>_("span",{key:idx,class:"id-field-tag"},label))
              ))
              :(r(),d("span",{key:"types-empty",class:"id-empty"},"（未配置）"))
          ]),_:2}),
          c(e,{label:"DCI数据接口"},{default:i(()=>[
            vv.dataApis.length
              ?(r(),d("div",{key:"apis-"+vv.dataApis.join("|"),class:"id-tag-group"},
                vv.dataApis.map((label,idx)=>_("span",{key:idx,class:"id-field-tag id-field-tag--api"},label))
              ))
              :(r(),d("span",{key:"apis-empty",class:"id-empty"},"（未配置）"))
          ]),_:2})
        ]),_:2})
      ])
    ])),[[x,f.value]]);
  };
}});

const G=j(Y,[["__scopeId","data-v-a064fe05"]]);
export{G as default};
