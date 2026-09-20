import fs from "fs";
import path from "path";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of fs.readdirSync(dir)) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (!t.includes("auth-dialog-pixel-perfect") && !t.includes("is-login-mode") && !t.includes("tab-switcher-track")) {
    continue;
  }
  console.log("FILE", f, t.length);
  const idx = t.indexOf("auth-dialog-pixel-perfect");
  if (idx >= 0) console.log("ctx", t.slice(idx - 120, idx + 180));
  const hits = [...t.matchAll(/width:\s*(\d{3,4})/g)].map((m) => m[1]);
  console.log("widths near file unique", [...new Set(hits)].slice(0, 30));
  // register routing
  for (const key of ["is-register-mode", "go-register", "/register", "register-layout", "path:\"/register"]) {
    if (t.includes(key)) console.log("has", key);
  }
}
