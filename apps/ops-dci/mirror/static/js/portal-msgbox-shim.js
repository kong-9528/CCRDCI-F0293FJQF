function resolveBox(){
  try{
    const app=document.querySelector("#app")&&document.querySelector("#app").__vue_app__;
    const gp=app&&app.config&&app.config.globalProperties;
    if(gp){
      if(gp.$msgbox&&typeof gp.$msgbox.confirm==="function") return gp.$msgbox;
      if(gp.$confirm) return {confirm:(m,t,o)=>gp.$confirm(m,t,o)};
      if(gp.$modal&&typeof gp.$modal.confirm==="function"){
        return {confirm:(m,t,o)=>gp.$modal.confirm(m)};
      }
    }
  }catch(e){}
  const EP=window.ElementPlus||window.ELEMENT||{};
  return EP.ElMessageBox||window.ElMessageBox||null;
}
export const R={
  confirm(msg,title,opts){
    const box=resolveBox();
    if(box&&typeof box.confirm==="function"){
      try{return box.confirm(msg,title||"提示",opts||{})}catch(e){}
    }
    return window.confirm((title?title+"\n":"")+msg)?Promise.resolve("confirm"):Promise.reject("cancel");
  }
};
