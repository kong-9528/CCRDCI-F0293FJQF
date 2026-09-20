import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 180)}`);
  const n = js.split(from).length - 1;
  if (n !== 1) console.warn("WARN count", n, label);
  js = js.split(from).join(to);
  console.log("OK", label);
}

// Match working "去登录" pattern: span + cached arrow calling handler
mustReplace(
  's("button",{type:"button",class:"forgot-back-link",onClick:Ue},"上一步")',
  's("span",{class:"forgot-back-link",onClick:e[96]||(e[96]=(r)=>Ue(r))},"上一步")',
  "back like go-login span",
);

// Keep Ue without noisy logs (but keep functional)
mustReplace(
  'function Ue(o){o&&(o.preventDefault(),o.stopPropagation());console.log("[forgot] back",ft.value);ft.value=1;console.log("[forgot] after",ft.value)}',
  "function Ue(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}",
  "Ue clean",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK");
