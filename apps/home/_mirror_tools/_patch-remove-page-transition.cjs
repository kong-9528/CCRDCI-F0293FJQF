const fs = require("fs");
const path = "apps/home/mirror/static/js/index-DA8BAxJb.js";
const s = fs.readFileSync(path, "utf8");

const old =
  'G(Gn,{name:"fade-transform",mode:"out-in"},{default:Z(()=>[(S(),re(nE,{include:u(n).cachedViews},[i.meta.link?oe("",!0):(S(),re(pt(s),{key:i.path}))],1032,["include"]))]),_:2},1024)';

const neu =
  '(S(),re(nE,{include:u(n).cachedViews},[i.meta.link?oe("",!0):(S(),re(pt(s),{key:i.path}))],1032,["include"]))';

if (!s.includes(old)) {
  const i = s.indexOf('name:"fade-transform"');
  console.log("exact old not found; context:");
  console.log(s.slice(i - 120, i + 350));
  process.exit(1);
}

fs.writeFileSync(path, s.replace(old, neu));
console.log("patched ok, remaining fade-transform", (fs.readFileSync(path, "utf8").split("fade-transform").length - 1));
