import fs from "fs";
import { execSync } from "child_process";

const p =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/patch-mock-account-center.mjs";
let t = fs.readFileSync(p, "utf8");

const a =
  'onClick:e[52]||(e[52]=s=>window.open("https://www.ccopyright.com.cn/","_blank"))';
const b =
  'onClick:e[52]||(e[52]=s=>{var M=window.__DCI_MOCK__;M&&M.openTechWorkbench?M.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\\\/$/,"")+"/desk","_blank")})';

if (t.includes(a)) {
  t = t.split(a).join(b);
  console.log("OK replaced techDynamic CTA in patch script");
} else if (t.includes("openTechWorkbench")) {
  console.log("OK patch script already has openTechWorkbench in techDynamic");
} else {
  console.log("MISS e[52] context:");
  const i = t.indexOf("e[52]");
  console.log(t.slice(i, i + 150));
}

if (!t.includes("wire-customer-workbench.mjs")) {
  t = t.replace(
    'console.log("DONE mock auth patches");',
    `console.log("DONE mock auth patches");
// Keep customer workbench wiring in sync (idempotent)
try {
  execSync('node "' + pathDir + '/wire-customer-workbench.mjs"', { stdio: "inherit" });
} catch (e) {
  console.warn("wire-customer-workbench skipped", e && e.message);
}
`.replace(
      "pathDir",
      '"c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools"',
    ),
  );
  // Fix botched replace - do it cleanly
  t = fs.readFileSync(p, "utf8");
  if (t.includes(a)) t = t.split(a).join(b);
  const marker = 'console.log("DONE mock auth patches");';
  if (!t.includes("wire-customer-workbench.mjs")) {
    t = t.replace(
      marker,
      marker +
        `\ntry {\n  execSync('node "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/wire-customer-workbench.mjs"', { stdio: "inherit" });\n} catch (e) {\n  console.warn("wire-customer-workbench skipped", e && e.message);\n}\n`,
    );
  }
}

fs.writeFileSync(p, t, "utf8");
console.log("written");
