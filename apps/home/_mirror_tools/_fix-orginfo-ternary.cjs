const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

const bad = ':x("",!0):S.value&&A.value';
if (!s.includes(bad)) {
  console.error("bad pattern missing");
  const i = s.indexOf("撤回申请 ");
  console.log(JSON.stringify(s.slice(i, i + 200)));
  process.exit(1);
}
s = s.replace(bad, ":S.value&&A.value");

const old = "Je(async()=>{await Ve(),ee(),Te()})";
const neu =
  'Je(async()=>{await Ve(),ee(),Te();try{if(window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.subscribe==="function"){window.__DCI_ORGINFO_DEMO__.subscribe(function(){ee()})}}catch(_d){}})';
if (!s.includes(old)) {
  console.error("mount missing");
  process.exit(1);
}
s = s.replace(old, neu);

// Use full-width container for withdraw (La style key) - swap Ua to use submit-btn full width
// Make sure withdraw uses class submit-btn which is full width
fs.writeFileSync(p, s);
console.log("fixed");
