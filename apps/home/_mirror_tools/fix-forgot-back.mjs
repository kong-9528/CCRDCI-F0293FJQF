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
  console.log("OK", label);
}

// Two independent forms: blur on step2 fields cannot block an outside back link.
// Use plain click (nativeType N/A) — simpler and reliable.
mustReplace(
  's("span",{class:"forgot-back-link",onMousedown:A(Ue,["prevent","stop"]),onClick:A(Ue,["prevent","stop"])},"上一步")',
  's("a",{href:"javascript:;",class:"forgot-back-link",onClick:A(Ue,["prevent"])},"上一步")',
  "back as anchor click",
);

fs.writeFileSync(path, js, "utf8");
execSync(`node --check "${path}"`, { stdio: "inherit" });
console.log("SYNTAX OK");
