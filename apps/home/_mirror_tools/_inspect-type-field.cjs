const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/info-0k0-BfNc.js", "utf8");
const i = s.indexOf('label:"DCI注册中心类型"');
console.log(JSON.stringify(s.slice(i, i + 700)));
console.log("\n--- O ---");
console.log(s.slice(s.indexOf("O=E(()=>"), s.indexOf("O=E(()=>") + 120));
