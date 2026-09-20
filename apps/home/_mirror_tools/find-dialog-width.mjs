import fs from "fs";

const css = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/index-CLvhJbpp.css",
  "utf8",
);

const parts = css.split("}");
for (const part of parts) {
  if (/el-dialog|auth-dialog|login-dialog|dialog.*width|width:.*px.*auth|portal-auth-modal|auth-modal/.test(part)) {
    console.log((part + "}").slice(0, 300));
    console.log("---");
  }
}

// also search for width near auth
const m = [...css.matchAll(/[^{}]*auth[^{}]*\{[^}]+\}/gi)];
console.log("\ncount auth blocks", m.length);
for (const x of m.slice(0, 15)) console.log(x[0].slice(0, 220), "\n---");
