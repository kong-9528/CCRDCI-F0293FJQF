const fs = require("fs");
const file = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(file, "utf8");

// History dialog wrongly binds attachments to current form; use each record's files.
const old =
  'l(g,{label:"合同附件",span:2},{default:t(()=>[a.value.contractFileList.length>0?(o(),c("div",Ya,[(o(!0),c(B,null,$(a.value.contractFileList,(z,qe)=>(o(),c("div",{key:qe,style:{display:"inline-flex","align-items":"center","margin-right":"16px"}},[l(F,{class:"margin-right-4"},{default:t(()=>[l(N(W))]),_:1}),m("span",Ja,i(z.name),1),l(d,{type:"primary",link:"",size:"small",onClick:at=>Q(z)},{default:t(()=>[...e[35]||(e[35]=[s("下载查看",-1)])]),_:1},8,["onClick"])]))),128))])):(o(),c("span",Wa,"-"))]),_:1})';

const neu =
  'l(g,{label:"合同附件",span:2},{default:t(()=>{const _fl=(n.contractFileList&&n.contractFileList.length?n.contractFileList:typeof n.contractFiles=="string"&&n.contractFiles?n.contractFiles.split(",").filter(Boolean).map(u=>({name:(u.split("/").pop()||"合同附件.pdf"),url:u})):a.value.contractFileList||[]);return[_fl.length>0?(o(),c("div",Ya,[(o(!0),c(B,null,$(_fl,(z,qe)=>(o(),c("div",{key:qe,style:{display:"inline-flex","align-items":"center","margin-right":"16px"}},[l(F,{class:"margin-right-4"},{default:t(()=>[l(N(W))]),_:1}),m("span",Ja,i(z.name),1),l(d,{type:"primary",link:"",size:"small",onClick:at=>Q(z)},{default:t(()=>[...e[35]||(e[35]=[s("下载查看",-1)])]),_:1},8,["onClick"])]))),128))])):(o(),c("span",Wa,"-"))]})})';

if (s.includes("_fl=(n.contractFileList")) {
  console.log("SKIP already patched hist files");
} else if (!s.includes(old)) {
  console.error("NOT FOUND hist files block");
  const i = s.indexOf('label:"合同附件",span:2');
  console.log(s.slice(i, i + 500));
  process.exit(1);
} else {
  s = s.replace(old, neu);
  fs.writeFileSync(file, s);
  console.log("OK hist files use record list");
}
