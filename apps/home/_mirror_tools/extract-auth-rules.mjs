import fs from "fs";

const css = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/index-CLvhJbpp.css",
  "utf8",
);

// Split roughly by } and keep rules mentioning auth/login/register/form
const parts = css.split("}");
const interesting = [];
for (const part of parts) {
  const chunk = part + "}";
  if (
    /auth-card|login-|register|form-content|form-label|form-input|form-group|portal-auth|sms-|captcha|pure-form/.test(
      chunk,
    )
  ) {
    interesting.push(chunk.replace(/\{/g, "{\n  ").replace(/;/g, ";\n  ").replace(/\n  \}/g, "\n}"));
  }
}
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/auth-rules.txt",
  interesting.join("\n\n"),
);
console.log("rules", interesting.length);

const reg = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/register-BOtQW-KH.css",
  "utf8",
);
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/register-raw.css",
  reg.replace(/\{/g, "{\n  ").replace(/;/g, ";\n  ").replace(/\n  \}/g, "\n}\n"),
);
console.log("register len", reg.length);
