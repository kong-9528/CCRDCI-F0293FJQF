import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
let js = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!js.includes(from)) throw new Error(`MISSING: ${label}\n${from.slice(0, 160)}`);
  const n = js.split(from).length - 1;
  if (n !== 1) console.warn("WARN count", n, label);
  js = js.split(from).join(to);
  console.log("OK", label, "x" + n);
}

// Form default slot was STABLE (_:1) so ft changes didn't re-render fields.
// Use DYNAMIC (_:2) so step switch updates fields.
mustReplace(
  '8,["loading","disabled"])])]))]),_:1},8,["model","rules"]',
  '8,["loading","disabled"])])]))]),_:2},8,["model","rules","key"]',
  "forgot form slot DYNAMIC",
);

// Also key the form by step so Element Plus remounts cleanly between steps
mustReplace(
  'l(K,{ref_key:"forgotFormRef",ref:W,model:i.value,rules:Se.value,class:"pure-form",size:"large",onSubmit:A(me,["prevent"])}',
  'l(K,{ref_key:"forgotFormRef",ref:W,key:ft.value===1?"forgot-form-1":"forgot-form-2",model:i.value,rules:Se.value,class:"pure-form",size:"large",onSubmit:A(me,["prevent"])}',
  "forgot form key by step",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK");

// Audit full forgot flow
const t = fs.readFileSync(path, "utf8");
const checks = [
  ["ft ref", "ft=c(1)"],
  ["step rules", "ft.value===1?{phoneNumber"],
  ["me step1→2", "ft.value=2"],
  ["me mock success", "密码重置成功"],
  ["Ue back", "function Ue(){ft.value=1}"],
  ["back bind", "onClick:Ue"],
  ["step1 ui", 'key:"forgot-step1"'],
  ["step2 ui", 'key:"forgot-step2"'],
  ["dynamic slot", "])]))]),_:2},8,[\"model\",\"rules\""],
  ["form key", "forgot-form-1"],
  ["SMS mock", "演示"],
  ["no e60 back", !t.includes('forgot-back-link",onClick:e[60]')],
];
for (const [n, v] of checks) {
  const ok = typeof v === "boolean" ? v : t.includes(v);
  console.log(ok ? "OK" : "MISS", n);
}
