import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 160)}`);
  js = js.split(from).join(to);
  console.log("OK", label);
}

// Back on mousedown+prevent: avoid input blur validation stealing the click
mustReplace(
  "function Ue(){ft.value=1}",
  'function Ue(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}',
  "Ue prevent",
);

// Bind mousedown (with prevent) instead of click — runs before blur
mustReplace(
  's("span",{class:"forgot-back-link",onClick:Ue},"上一步")',
  's("span",{class:"forgot-back-link",onMousedown:A(Ue,["prevent","stop"]),onClick:A(Ue,["prevent","stop"])},"上一步")',
  "back mousedown+click",
);

// Move 上一步 OUT of form: remove from forgot-step-actions, only keep reset button there;
// put back link above footer (sibling of form), only visible on step 2.

// Current step2 actions block:
const oldActions =
  's("div",{class:"forgot-step-actions"},[s("span",{class:"forgot-back-link",onMousedown:A(Ue,["prevent","stop"]),onClick:A(Ue,["prevent","stop"])},"上一步"),l(x,{type:"primary",class:"login-main-btn",nativeType:"button",loading:f.value,disabled:!(String(i.value.newPassword||"").length&&String(i.value.confirmPassword||"").length),onClick:me},{default:a(()=>[...e[63]||(e[63]=[m("重置密码",-1)])]),_:1},8,["loading","disabled"])])';

const newActions =
  'l(x,{type:"primary",class:"login-main-btn",nativeType:"button",loading:f.value,disabled:!(String(i.value.newPassword||"").length&&String(i.value.confirmPassword||"").length),onClick:me},{default:a(()=>[...e[63]||(e[63]=[m("重置密码",-1)])]),_:1},8,["loading","disabled"])';

mustReplace(oldActions, newActions, "actions: only reset btn inside form");

// Insert back link between form and footer, only on step 2
mustReplace(
  '8,["model","rules","key"])]),s("div",Ks,[e[59]||(e[59]=s("span",null,"记起密码了？",-1))',
  '8,["model","rules","key"])]),ft.value===2?(v(),h("div",{key:"forgot-back",class:"forgot-step-actions"},[s("span",{class:"forgot-back-link",onMousedown:A(Ue,["prevent","stop"]),onClick:A(Ue,["prevent","stop"])},"上一步")])):G("",!0),s("div",Ks,[e[59]||(e[59]=s("span",null,"记起密码了？",-1))',
  "back link outside form",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK");

const t = fs.readFileSync(path, "utf8");
console.log("outside form", t.includes('key:"forgot-back"'));
console.log("mousedown", t.includes("onMousedown:A(Ue"));
console.log("inside actions still has 上一步?", /forgot-step-actions"\},\[s\("span",\{class:"forgot-back-link"/.test(t));
