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

// 1) Rename shadowed back handler (SMS login also declares function Ue)
mustReplace(
  "function ie(){q(\"forgot\")}function Ue(o){o&&(o.preventDefault(),o.stopPropagation());console.log(\"[forgot] back\",ft.value);ft.value=1;console.log(\"[forgot] after\",ft.value)}",
  'function ie(){q("forgot")}function Ht(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}',
  "rename Ue→Ht back",
);

// If debug already cleaned differently, try clean version
if (js.includes("function Ue(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}")) {
  mustReplace(
    "function ie(){q(\"forgot\")}function Ue(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}",
    'function ie(){q("forgot")}function Ht(o){o&&(o.preventDefault(),o.stopPropagation()),ft.value=1}',
    "rename Ue→Ht back (clean)",
  );
}

// 2) Wire back link like 去登录 (span + cached handler), call Ht
if (js.includes('s("button",{type:"button",class:"forgot-back-link",onClick:Ue},"上一步")')) {
  mustReplace(
    's("button",{type:"button",class:"forgot-back-link",onClick:Ue},"上一步")',
    's("span",{class:"forgot-back-link",onClick:e[96]||(e[96]=r=>Ht(r))},"上一步")',
    "back span→Ht",
  );
} else if (js.includes('onClick:e[96]||(e[96]=(r)=>Ue(r))')) {
  mustReplace(
    'onClick:e[96]||(e[96]=(r)=>Ue(r))',
    'onClick:e[96]||(e[96]=r=>Ht(r))',
    "back e96→Ht",
  );
} else if (js.includes('class:"forgot-back-link",onClick:Ue')) {
  mustReplace(
    'class:"forgot-back-link",onClick:Ue',
    'class:"forgot-back-link",onClick:e[96]||(e[96]=r=>Ht(r))',
    "back onClick→Ht",
  );
}

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });

const t = fs.readFileSync(path, "utf8");
const checks = [
  ["Ht fn", "function Ht("],
  ["back uses Ht", "r=>Ht(r)"],
  ["SMS Ue kept", "function Ue(){if(C.value>0)"],
  ["no back onClick:Ue", !t.includes('forgot-back-link",onClick:Ue')],
  ["only one back Ht", (t.match(/function Ht\(/g) || []).length === 1],
];
for (const [n, v] of checks) {
  console.log((typeof v === "boolean" ? v : t.includes(v)) ? "OK" : "MISS", n);
}
