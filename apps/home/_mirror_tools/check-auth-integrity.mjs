import fs from "fs";
import { execSync } from "child_process";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");

console.log("bytes", Buffer.byteLength(t));
console.log("chars", t.length);
console.log("starts", t.slice(0, 120));
console.log("ends", t.slice(-200));

try {
  execSync(`node --check "${path}"`, { stdio: "pipe" });
  console.log("SYNTAX OK");
} catch (e) {
  console.log("SYNTAX FAIL", String(e.stderr || e.message).slice(0, 500));
}

// Se2 variants
for (const s of [
  "const Se1=",
  "Se2=H",
  "Se2=",
  "rules:Se1",
  "rules:Se2",
  "ref:ue",
  "ref:W",
  "forgotPwdRef",
  "forgotVerifyRef",
  "export",
  "login",
  "register",
]) {
  console.log(s, t.includes(s), t.indexOf(s));
}

// Count exports / key markers
console.log("A as openAuth?", /export\{[^}]*A[^}]*\}/.test(t.slice(-500)));
console.log("tail markers", t.slice(-500));
