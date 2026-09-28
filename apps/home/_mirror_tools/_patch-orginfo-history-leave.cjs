const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

const oldLeave =
  'leaveHistory:()=>{try{const _q=Object.assign({},he.query||{});delete _q.view;ke.replace({path:he.path,query:_q})}catch(e){}}';
const newLeave =
  'leaveHistory:()=>{try{ke.replace({path:he.path,query:{}})}catch(e){}}';

if (!s.includes(oldLeave)) {
  if (s.includes(newLeave)) console.log("leave already cleaned");
  else {
    console.error("leaveHistory not found");
    process.exit(1);
  }
} else {
  s = s.replace(oldLeave, newLeave);
  fs.writeFileSync(p, s);
  console.log("leaveHistory clears query");
}
