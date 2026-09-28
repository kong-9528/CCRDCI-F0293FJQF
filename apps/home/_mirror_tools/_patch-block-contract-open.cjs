const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");
const old =
  'typeof e=="string"&&(e.startsWith("http://")||e.startsWith("https://")?window.open(e,"_blank"):downloadContractFile(e)';
const neu =
  'typeof e=="string"&&(e.startsWith("http://")||e.startsWith("https://")?(console.warn("[demo] blocked external contract url",e),U.warning("演示环境不打开外部文件链接")):downloadContractFile(e)';
if (!s.includes(old)) {
  if (s.includes("blocked external contract url")) console.log("already patched");
  else {
    console.error("pattern missing");
    process.exit(1);
  }
} else {
  s = s.replace(old, neu);
  fs.writeFileSync(p, s);
  console.log("info contract external open blocked");
}
