import{a9 as useDictHost,r as ref}from"./index-DsYmzmNg.js";
const FALLBACK={
  sys_normal_disable:[
    {label:"正常",value:"0",elTagType:"success",elTagClass:""},
    {label:"停用",value:"1",elTagType:"danger",elTagClass:""}
  ]
};
function useDictFallback(...types){
  const out={};
  for(const t of types){
    const rows=FALLBACK[t]||[];
    out[t]=ref(rows.map(r=>({...r})));
  }
  return out;
}
export function c(...types){
  try{
    if(typeof useDictHost==="function"){
      const hit=useDictHost(...types);
      if(hit&&typeof hit==="object") return hit;
    }
  }catch(e){}
  return useDictFallback(...types);
}
