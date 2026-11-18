import{a6 as ElMessage}from"./index-DsYmzmNg.js";
function toast(type,msg){
  try{
    if(ElMessage&&typeof ElMessage[type]==="function") return ElMessage[type](msg);
    if(typeof ElMessage==="function") return ElMessage({type,message:msg});
  }catch(e){}
  const EP=window.ElementPlus||{};
  const M=EP.ElMessage||window.ElMessage;
  if(M&&typeof M[type]==="function") return M[type](msg);
  console.log("[portal]",type,msg);
}
export const t={
  success(m){toast("success",m)},
  warning(m){toast("warning",m)},
  error(m){toast("error",m)},
  info(m){toast("info",m)}
};
