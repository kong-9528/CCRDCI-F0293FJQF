const fs = require("fs");

const htmlPath = "apps/home/mirror/index.html";
const jsPath = "apps/home/mirror/static/js/index-DA8BAxJb.js";

// 1) index.html initial title
let html = fs.readFileSync(htmlPath, "utf8");
if (html.includes("<title>DCI管理中心</title>")) {
  html = html.replace(
    "<title>DCI管理中心</title>",
    "<title>数字版权唯一标识符</title>"
  );
  fs.writeFileSync(htmlPath, html);
  console.log("OK index.html title");
} else if (html.includes("<title>数字版权唯一标识符</title>")) {
  console.log("index.html already patched");
} else {
  console.warn("WARN index.html title unexpected");
}

// 2) settings default title + path-aware document.title
let s = fs.readFileSync(jsPath, "utf8");

const oldZv = 'const zv={title:"DCI管理中心"';
const newZv = 'const zv={title:"数字版权唯一标识符"';
if (s.includes(oldZv)) {
  s = s.replace(oldZv, newZv);
  console.log("OK zv.title");
} else if (s.includes(newZv)) {
  console.log("zv.title already patched");
} else {
  console.error("FAIL zv.title not found");
  process.exit(1);
}

const oldUfe =
  'function ufe(){const e=ma();e.dynamicTitle?document.title=e.title+" - "+zv.title:document.title=zv.title}';
const newUfe =
  'function ufe(){const e=ma();const _p=(typeof location!=="undefined"&&location.pathname)||"";const _wb=/^\\/(dashboard|dci\\/(info-management|api-management|dciapi|org-info|regorg-info))(\\/|$)/.test(_p);const _base=_wb?"DCI注册中心":"数字版权唯一标识符";e.dynamicTitle?document.title=e.title+" - "+_base:document.title=_base}';

if (s.includes(newUfe)) {
  console.log("ufe already patched");
} else if (s.includes(oldUfe)) {
  s = s.replace(oldUfe, newUfe);
  console.log("OK ufe()");
} else {
  const i = s.indexOf("function ufe()");
  console.error("FAIL ufe not found", i >= 0 ? s.slice(i, i + 180) : "n/a");
  process.exit(1);
}

// 3) Ensure every navigation refreshes title (portal public pages too)
const oldAfter = "mo.afterEach(()=>{Qa.done()})";
const newAfter =
  'mo.afterEach((to)=>{Qa.done();try{ma().setTitle((to.meta&&to.meta.title)||"")}catch(_e){try{ufe()}catch(_e2){}}})';

if (s.includes(newAfter)) {
  console.log("afterEach already patched");
} else if (s.includes(oldAfter)) {
  s = s.replace(oldAfter, newAfter);
  console.log("OK afterEach title sync");
} else {
  const i = s.indexOf("mo.afterEach");
  console.warn("WARN afterEach unexpected", i >= 0 ? s.slice(i, i + 80) : "n/a");
}

fs.writeFileSync(jsPath, s);
console.log("DONE");
