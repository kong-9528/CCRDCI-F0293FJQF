const fs = require("fs");
const p = "apps/home/mirror/static/js/statistics-D1aA8P2b.js";
let s = fs.readFileSync(p, "utf8");

const oldLegend =
  'legend:{bottom:0,icon:"circle",itemWidth:8,itemHeight:8,itemGap:24,textStyle:{color:"#4e5969",fontSize:13},data:b},grid:{left:"3%",right:"4%",top:"6%",bottom:"15%",containLabel:!0}';
const newLegend =
  'legend:{bottom:4,left:"center",icon:"circle",itemWidth:8,itemHeight:8,itemGap:14,textStyle:{color:"#4e5969",fontSize:12},data:b},grid:{left:"3%",right:"4%",top:"8%",bottom:"22%",containLabel:!0}';

if (!s.includes(oldLegend)) {
  console.log("legend pattern missing");
  process.exit(1);
}
s = s.replace(oldLegend, newLegend);
s = s.split(",S[2]||(S[2]=Nh())").join(',S[2]||(S[2]=Nh(" "))');
s = s.split(",S[5]||(S[5]=Nh())").join(',S[5]||(S[5]=Nh(" "))');
fs.writeFileSync(p, s);
console.log("ok", s.includes('bottom:"22%"'));
