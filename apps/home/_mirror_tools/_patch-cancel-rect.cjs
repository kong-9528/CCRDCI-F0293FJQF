const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

// Give cancel the same structural class family as submit, keep secondary look via plain default type
const old =
  'l(d,{style:{height:"48px","border-radius":"4px",padding:"0 20px","font-size":"15px","font-weight":"500","flex-shrink":"0"},onClick:we},{default:t(()=>[...e[31]||(e[31]=[s(" 取消申请 ",-1)])]),_:1})';
const neu =
  'l(d,{class:"cancel-btn",style:{height:"48px","border-radius":"4px",padding:"0 20px","font-size":"15px","font-weight":"500","flex-shrink":"0"},onClick:we},{default:t(()=>[...e[31]||(e[31]=[s(" 取消申请 ",-1)])]),_:1})';

if (s.includes('class:"cancel-btn"')) {
  console.log("cancel-btn class already present");
} else if (!s.includes(old)) {
  console.error("cancel btn pattern missing");
  process.exit(1);
} else {
  s = s.replace(old, neu);
  fs.writeFileSync(p, s);
  console.log("cancel-btn class added");
}
