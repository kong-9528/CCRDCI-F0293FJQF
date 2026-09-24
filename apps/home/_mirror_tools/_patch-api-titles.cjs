const fs = require("fs");
const p = "apps/home/mirror/static/js/statistics-D1aA8P2b.js";
let s = fs.readFileSync(p, "utf8");

const marker = 'const b=J2("el-tag"),x=Q2("loading")';
if (!s.includes(marker)) {
  console.error("marker not found");
  process.exit(1);
}
s = s.replace(
  marker,
  'const b=J2("el-tag"),x=Q2("loading"),elIcon=J2("el-icon"),TrendIcon=J2("TrendCharts")'
);

const oldRow =
  'Zt("div",rY,[S[0]||(S[0]=Zt("h2",{class:"title"},"调用统计",-1)),i.value?(nm(),eI(b,{key:0,type:"info",effect:"plain",class:"org-tag"},{default:rI(()=>[Nh(" DCI注册中心标识码："+yi(i.value),1)]),_:1})):aI("",!0)])';

const newRow =
  'Zt("div",rY,[Zt("div",{class:"header-left"},[Zt("div",{class:"header-icon-wrapper"},[eI(elIcon,null,{default:rI(()=>[eI(TrendIcon)]),_:1})]),S[0]||(S[0]=Zt("span",{class:"header-title"},"调用统计",-1))]),i.value?(nm(),eI(b,{key:0,type:"info",effect:"plain",class:"org-tag"},{default:rI(()=>[Nh(" DCI注册中心标识码："+yi(i.value),1)]),_:1})):aI("",!0)])';

if (!s.includes(oldRow)) {
  const i = s.indexOf("调用统计");
  console.error("OLD ROW NOT FOUND");
  console.error(JSON.stringify(s.slice(i - 120, i + 280)));
  process.exit(1);
}
s = s.replace(oldRow, newRow);
s = s.replace('rY={class:"title-row"}', 'rY={class:"title-row"}');
fs.writeFileSync(p, s);
console.log("stats ok");
