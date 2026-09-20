import fs from "fs";
import path from "path";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".css"));

for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const keys = [
    "login-title",
    "login-tab",
    "login-subtitle",
    "auth-card",
    "is-login",
    "is-register",
    "portal-auth",
    "form-content",
    "register-layout",
    "register-title",
    "register-card",
    "el-dialog",
    "短信",
  ];
  const hit = keys.filter((k) => text.includes(k));
  if (hit.length) console.log(f, "=>", hit.join(", "));
}
