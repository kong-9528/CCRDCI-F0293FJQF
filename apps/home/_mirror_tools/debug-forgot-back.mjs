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

// Debug + robust back: button outside form, no modifiers helper
mustReplace(
  "function Ue(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}",
  'function Ue(o){o&&(o.preventDefault(),o.stopPropagation());console.log("[forgot] back",ft.value);ft.value=1;console.log("[forgot] after",ft.value)}',
  "Ue debug log",
);

mustReplace(
  's("a",{href:"javascript:;",class:"forgot-back-link",onClick:A(Ue,["prevent"])},"上一步")',
  's("button",{type:"button",class:"forgot-back-link",onClick:Ue},"上一步")',
  "back as button",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK");
