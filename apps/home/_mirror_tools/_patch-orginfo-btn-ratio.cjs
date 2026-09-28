const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

const old =
  'style:{height:"48px","border-radius":"24px",padding:"0 32px","font-size":"16px","font-weight":"500"},onClick:we';
const neu =
  'style:{height:"48px","border-radius":"4px",padding:"0 20px","font-size":"15px","font-weight":"500","flex-shrink":"0"},onClick:we';

if (!s.includes(old)) {
  if (s.includes('"flex-shrink":"0"},onClick:we')) {
    console.log("cancel btn already patched");
  } else {
    console.error("cancel btn style pattern missing");
    process.exit(1);
  }
} else {
  s = s.replace(old, neu);
  fs.writeFileSync(p, s);
  console.log("cancel btn narrowed");
}
