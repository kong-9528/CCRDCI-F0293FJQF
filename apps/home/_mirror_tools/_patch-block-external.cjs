const fs = require("fs");
const p = "apps/home/mirror/static/js/index-DA8BAxJb.js";
let s = fs.readFileSync(p, "utf8");

// Force-disable RuoYi repeatSubmit guard (source of「数据正在处理，请勿重复提交」)
const old =
  'const t=(e.headers||{}).isToken===!1,n=(e.headers||{}).repeatSubmit===!1,o=(e.headers||{}).interval||1e3;';
const neu =
  'const t=(e.headers||{}).isToken===!1,n=!0,o=(e.headers||{}).interval||1e3;';
if (!s.includes(old)) {
  if (s.includes(neu)) {
    console.log("repeatSubmit already disabled");
  } else {
    console.error("repeatSubmit pattern not found");
    process.exit(1);
  }
} else {
  s = s.replace(old, neu);
  console.log("repeatSubmit disabled");
}

// Neutralize external copyright site open → no external navigation
const oldOpen = 'case"applyTech":window.open("https://www.ccopyright.com.cn/","_blank");break;';
const newOpen =
  'case"applyTech":try{window.__DCI_MOCK__&&console.info("[demo] applyTech: external site blocked")}catch(_e){}break;';
if (s.includes(oldOpen)) {
  s = s.replace(oldOpen, newOpen);
  console.log("ccopyright window.open blocked");
} else if (s.includes("applyTech: external site blocked")) {
  console.log("ccopyright already blocked");
} else {
  console.warn("ccopyright pattern missing (skip)");
}

fs.writeFileSync(p, s);
console.log("ok", p);
