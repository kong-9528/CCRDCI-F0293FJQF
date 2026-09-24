const fs = require("fs");
const p = "apps/home/mirror/static/js/statistics-D1aA8P2b.js";
let s = fs.readFileSync(p, "utf8");

// Find current y() — may already have debug logs
const start = s.indexOf("async function y()");
if (start < 0) {
  console.error("y() not found");
  process.exit(1);
}
// y() ends at "function m()" which follows
const end = s.indexOf("function m()", start);
if (end < 0) {
  console.error("m() not found after y()");
  process.exit(1);
}

const neu = `async function y(){
t.value=!0;
try{
  // Demo: always show fixed mock metrics/chart, independent of account / orgCode
  let org="";
  try{
    const S=await nI(e.id);
    if(S&&(S.code===200||S.code===1e6)&&S.data)org=S.data.orgCode||S.data.dciRegOrgCode||"";
  }catch(_e){}
  if(!org){
    try{
      const M=window.__DCI_MOCK__;
      const u=M&&M.currentUser&&M.currentUser();
      if(u&&(u.username==="mayi"||u.username==="mayi2"))org="ANT";
      else if(u)org="ORG-"+String(u.username||"DEMO").toUpperCase();
    }catch(_e2){}
  }
  if(!org)org="ANT";
  i.value=org;

  const dates=[];
  const now=new Date;
  for(let w=29;w>=0;w--){
    const T=new Date(now);
    T.setDate(T.getDate()-w);
    const A=String(T.getMonth()+1).padStart(2,"0");
    const C=String(T.getDate()).padStart(2,"0");
    dates.push(A+"/"+C);
  }
  function series(name,color,base){
    const data=[];
    for(let k=0;k<30;k++)data.push(base+(k%7));
    return{name:name,color:color,data:data};
  }
  o.value=42;
  s.value="12%";
  l.value="up";
  u.value=1280;
  f.value="8%";
  h.value="up";
  v.value=15600;
  d(dates,[
    series("实名信息接口","#165dff",10),
    series("实名信息修改接口","#d97706",6),
    series("DCI申领数据同步接口","#1e40af",8),
    series("DCI撤销数据同步接口","#38bdf8",4)
  ]);
}catch(_){
  console.warn("调用统计演示数据写入失败",_);
}finally{
  t.value=!1;
}}`;

s = s.slice(0, start) + neu + s.slice(end);
fs.writeFileSync(p, s);
console.log("hardcoded stats metrics ok");
