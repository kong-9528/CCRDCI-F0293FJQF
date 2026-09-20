import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");

for (const s of [
  "is-forgot-mode",
  '_.value==="forgot"',
  "forgot-root",
  "function Ue(",
  "function Pe(",
  "function Ze2(",
  "function me(",
  "密码重置成功",
  "演示",
  "width:750",
  "750px",
]) {
  console.log(s, t.includes(s));
}

// class binding for forgot mode
const idx = t.indexOf("is-forgot-mode");
console.log("\nis-forgot-mode context:\n", t.slice(Math.max(0, idx - 120), idx + 80));

// ensure login left width still
const css = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/overrides.css",
  "utf8",
);
console.log("\noverrides left 350", css.includes("350"));
console.log("overrides 750", css.includes("750"));
