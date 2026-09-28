const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

// 1) Resolve OfficeBuilding icon (different from apporg CopyDocument)
if (!s.includes('Oi=h("OfficeBuilding")')) {
  if (!s.includes('F=h("el-icon")')) {
    console.error("el-icon resolve missing");
    process.exit(1);
  }
  s = s.replace('F=h("el-icon")', 'F=h("el-icon"),Oi=h("OfficeBuilding")');
  console.log("OfficeBuilding resolve added");
} else {
  console.log("OfficeBuilding already resolved");
}

// 2) Insert header-icon-wrapper before title
const oldHdr =
  'm("div",sa,[I.embedded?(o(),p(d,{key:0,class:"back-open-btn",icon:"ArrowLeft",onClick:Oe},{default:t(()=>[...e[18]||(e[18]=[s("返回开通管理",-1)])]),_:1})):x("",!0),m("span",da,i(Ce.value),1)])';
const newHdr =
  'm("div",sa,[I.embedded?(o(),p(d,{key:0,class:"back-open-btn",icon:"ArrowLeft",onClick:Oe},{default:t(()=>[...e[18]||(e[18]=[s("返回开通管理",-1)])]),_:1})):x("",!0),m("div",{class:"header-icon-wrapper"},[l(F,null,{default:t(()=>[l(Oi)]),_:1})]),m("span",da,i(Ce.value),1)])';

if (s.includes('class:"header-icon-wrapper"')) {
  console.log("header-icon-wrapper already present");
} else if (!s.includes(oldHdr)) {
  console.error("header pattern missing");
  process.exit(1);
} else {
  s = s.replace(oldHdr, newHdr);
  console.log("header icon inserted");
}

fs.writeFileSync(p, s);
console.log("ok");
