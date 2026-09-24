import{d as U,b as G,r as p,e as J,ae as Q,f as u,o as r,c as b,h as t,n as k,w as c,j as _,p as E,i as o,A as S,E as d,av as W,_ as X}from"./index-DA8BAxJb.js";

const Y={class:"apikey-container"};
const Z={class:"header-area"};
const ee={class:"main-card"};
const te={key:0,style:{"min-height":"200px"}};
const ae={key:1,class:"empty-state"};
const se={key:2,class:"key-info-state"};
const ce={class:"key-cards-wrapper"};
const ie={class:"key-card"};
const de={class:"key-card-header"};
const ue={class:"key-value"};
const re={class:"key-card"};
const ye={class:"key-card-header"};
const ve={class:"key-value"};
const pe={class:"key-card"};
const fe={class:"key-card-header"};
const me={class:"key-value"};
const Ke={class:"input-with-button"};
const ke={class:"input-with-button"};
const _e={style:{"margin-top":"16px","margin-bottom":"8px"}};
const ge={class:"dialog-footer"};

const Se=U({name:"ApiKeyManage"});
const be=U({...Se,setup(Ee){
  const N=G();
  const C=p(!0);
  const f=p(!1);
  const l=p({});
  const m=p(!1);
  const K=p(!1);
  const A=p("创建API key");
  const h=p(!1);
  const n=p({accessKey:"",accessSecret:"",dataEncrypKey:""});

  J(()=>{M()});

  function M(){
    C.value=!0;
    Q(N.id).then(a=>{
      (a.code===200||a.code===1e6)&&a.data?(l.value=a.data,f.value=!0):f.value=!1;
    }).catch(()=>{f.value=!1}).finally(()=>{C.value=!1});
  }

  function v(a,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"){
    let s="";
    for(let y=0;y<a;y++)s+=e.charAt(Math.floor(Math.random()*e.length));
    return s;
  }
  function I(){
    const a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let e="AK";
    for(let s=0;s<30;s++)e+=a.charAt(Math.floor(Math.random()*a.length));
    return e;
  }
  function P(){
    var a,e;
    A.value="创建API key";
    n.value={
      id:(a=l.value)==null?void 0:a.id,
      accessKey:((e=l.value)==null?void 0:e.accessKey)||I(),
      accessSecret:"SK"+v(30),
      dataEncrypKey:"DEK"+v(29)
    };
    K.value=!0;
  }
  function $(){
    var a,e,s,y;
    A.value="编辑API key";
    n.value={
      id:(a=l.value)==null?void 0:a.id,
      accessKey:((e=l.value)==null?void 0:e.accessKey)||I(),
      accessSecret:((s=l.value)==null?void 0:s.accessSecret)||"SK"+v(30),
      dataEncrypKey:((y=l.value)==null?void 0:y.dataEncrypKey)||"DEK"+v(29)
    };
    K.value=!0;
  }
  function H(){n.value.accessSecret="SK"+v(30),d.success("已生成 SK")}
  function R(){n.value.dataEncrypKey="DEK"+v(29),d.success("已生成 DEK")}
  function j(){n.value.accessSecret="SK"+v(30),n.value.dataEncrypKey="DEK"+v(29),d.success("已重新生成 SK 和 DEK")}
  async function z(){
    var a,e;
    if(!n.value.accessKey){d.warning("AK 未生成，无法保存");return}
    if(!n.value.accessSecret||!n.value.dataEncrypKey){d.warning("请先点击右侧魔法棒按钮生成 SK 和 DEK");return}
    h.value=!0;
    try{
      const s=await W(n.value);
      s.code===200||s.code===1e6?(d.success("保存成功"),l.value={...l.value,...n.value},f.value=!0,K.value=!1,M()):d.error(s.msg||"保存失败");
    }catch(s){
      const y=((e=(a=s==null?void 0:s.response)==null?void 0:a.data)==null?void 0:e.msg)||(s==null?void 0:s.message)||"保存失败（接口不存在，请确保后台 dci-manage 服务已编译并重启）";
      d.error(y);
    }finally{h.value=!1}
  }
  function B(a){
    const e=document.createElement("textarea");
    e.value=a;e.style.position="fixed";e.style.opacity="0";
    document.body.appendChild(e);e.focus();e.select();
    try{document.execCommand("copy")?d.success("复制成功"):d.error("复制失败")}catch{d.error("复制失败")}
    document.body.removeChild(e);
  }
  function x(a){
    a&&(navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(a).then(()=>{d.success("复制成功")}).catch(()=>{B(a)}):B(a));
  }
  function T(a){return a?a.length<=8?a.slice(0,4)+"****":a.slice(0,8)+"*".repeat(25):""}

  return(a,e)=>{
    const s=u("el-button"),g=u("el-icon"),D=u("CopyDocument"),F=u("View"),L=u("Hide"),V=u("el-input"),w=u("el-form-item"),O=u("el-form"),q=u("el-dialog");
    return r(),b("div",Y,[
      t("div",Z,[
        e[10]||(e[10]=t("div",{class:"title-box"},[
          t("h2",{class:"title"},"API key管理")
        ],-1)),
        t("div",{class:"header-actions"},[
          f.value
            ?(r(),k(s,{key:0,type:"primary",icon:"Edit",class:"edit-btn",onClick:$},{
              default:c(()=>[...e[15]||(e[15]=[_("编辑",-1)])]),
              _:1
            }))
            :C.value?E("",!0):(r(),k(s,{key:1,type:"primary",class:"create-btn",icon:"Plus",onClick:P},{
              default:c(()=>[...e[9]||(e[9]=[_("配置 API key",-1)])]),
              _:1
            }))
        ])
      ]),
      e[24]||(e[24]=t("div",{class:"apikey-notice"},[
        t("div",{class:"apikey-notice__item"},[
          t("span",{class:"apikey-notice__label"},"安全提醒"),
          t("span",{class:"apikey-notice__text"},"API Key（含 AK、SK、DEK）属于重要访问凭证，请妥善保管并仅限授权人员使用；请勿通过即时通讯、邮件明文或代码仓库等方式对外泄露。如发生泄露或疑似盗用，请立即重新生成密钥并同步更新业务系统配置。")
        ])
      ],-1)),
      t("div",ee,[
        C.value?(r(),b("div",te)):f.value?(r(),b("div",se,[
          t("div",ce,[
            t("div",ie,[
              t("div",de,[
                e[16]||(e[16]=t("span",{class:"key-label"},"AK",-1)),
                l.value.accessKey?(r(),k(g,{key:0,class:"copy-icon",onClick:e[0]||(e[0]=i=>x(l.value.accessKey))},{default:c(()=>[o(D)]),_:1})):E("",!0)
              ]),
              t("div",ue,S(l.value.accessKey||"未生成"),1)
            ]),
            t("div",re,[
              t("div",ye,[
                e[17]||(e[17]=t("span",{class:"key-label"},"SK",-1)),
                l.value.accessSecret?(r(),k(g,{key:0,class:"copy-icon",onClick:e[1]||(e[1]=i=>x(l.value.accessSecret))},{default:c(()=>[o(D)]),_:1})):E("",!0)
              ]),
              t("div",ve,S(l.value.accessSecret?m.value?l.value.accessSecret:T(l.value.accessSecret):"未生成"),1)
            ]),
            t("div",pe,[
              t("div",fe,[
                e[18]||(e[18]=t("span",{class:"key-label"},"DEK",-1)),
                l.value.dataEncrypKey?(r(),k(g,{key:0,class:"copy-icon",onClick:e[2]||(e[2]=i=>x(l.value.dataEncrypKey))},{default:c(()=>[o(D)]),_:1})):E("",!0)
              ]),
              t("div",me,S(l.value.dataEncrypKey?m.value?l.value.dataEncrypKey:T(l.value.dataEncrypKey):"未生成"),1)
            ])
          ]),
          t("div",{class:"show-secret-action",onClick:e[3]||(e[3]=i=>m.value=!m.value)},[
            o(g,null,{default:c(()=>[m.value?(r(),k(F,{key:0})):(r(),k(L,{key:1}))]),_:1}),
            t("span",null,S(m.value?"隐藏密钥":"显示密钥"),1)
          ])
        ])):(r(),b("div",ae,[
          e[12]||(e[12]=t("p",{class:"empty-title"},"暂未配置 API key",-1)),
          e[13]||(e[13]=t("p",{class:"empty-desc"},"平台审核通过后系统将自动生成 AK，您也可以手动配置 SK 和 DEK。",-1))
        ]))
      ]),
      o(q,{
        title:A.value,
        modelValue:K.value,
        "onUpdate:modelValue":e[8]||(e[8]=i=>K.value=i),
        width:"500px",
        "append-to-body":"",
        class:"custom-key-dialog"
      },{
        footer:c(()=>[t("div",ge,[
          o(s,{onClick:e[7]||(e[7]=i=>K.value=!1)},{default:c(()=>[...e[21]||(e[21]=[_("取消",-1)])]),_:1}),
          o(s,{type:"primary",onClick:z,loading:h.value},{default:c(()=>[...e[22]||(e[22]=[_("确定",-1)])]),_:1},8,["loading"])
        ])]),
        default:c(()=>[
          e[23]||(e[23]=t("div",{class:"dialog-subtitle"}," 系统将自动生成 AK，点击按钮生成 SK / DEK ",-1)),
          o(O,{model:n.value,"label-position":"top"},{default:c(()=>[
            o(w,{label:"AK",class:"bold-label"},{default:c(()=>[
              o(V,{modelValue:n.value.accessKey,"onUpdate:modelValue":e[4]||(e[4]=i=>n.value.accessKey=i),disabled:"",placeholder:"系统自动生成"},null,8,["modelValue"]),
              e[19]||(e[19]=t("div",{class:"form-helper-text"},"AK 由系统自动生成，不可变更。",-1))
            ]),_:1}),
            o(w,{label:"SK",class:"bold-label"},{default:c(()=>[
              t("div",Ke,[
                o(V,{modelValue:n.value.accessSecret,"onUpdate:modelValue":e[5]||(e[5]=i=>n.value.accessSecret=i),readonly:"",placeholder:"点击右侧按钮生成 SK"},null,8,["modelValue"]),
                o(s,{onClick:H,icon:"MagicStick",class:"gen-btn",type:"default"})
              ])
            ]),_:1}),
            o(w,{label:"DEK",class:"bold-label"},{default:c(()=>[
              t("div",ke,[
                o(V,{modelValue:n.value.dataEncrypKey,"onUpdate:modelValue":e[6]||(e[6]=i=>n.value.dataEncrypKey=i),readonly:"",placeholder:"点击右侧按钮生成 DEK"},null,8,["modelValue"]),
                o(s,{onClick:R,icon:"MagicStick",class:"gen-btn",type:"default"})
              ])
            ]),_:1}),
            t("div",_e,[
              o(s,{class:"regen-all-btn",icon:"MagicStick",style:{width:"100%",height:"38px","border-radius":"6px","font-weight":"500"},onClick:j},{
                default:c(()=>[...e[20]||(e[20]=[_(" 重新生成 SK / DEK ",-1)])]),
                _:1
              })
            ])
          ]),_:1},8,["model"])
        ]),
        _:1
      },8,["title","modelValue"])
    ]);
  };
}});

const Ae=X(be,[["__scopeId","data-v-e2ba1a5f"]]);
export{Ae as default};
