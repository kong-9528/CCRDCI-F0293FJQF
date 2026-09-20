import fs from "fs";

const js = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

const keys = [
  "dci-portal-header",
  "register-layout",
  "dci-portal-banner",
  "portal-header",
  "brand-title",
  "返回首页",
  "PortalHeader",
  "openAuth",
];
for (const k of keys) console.log(k, js.indexOf(k));

const i = js.indexOf('o("header"');
console.log("\nHEADER BLOCK:\n", js.slice(i, i + 700));

// find how home pages import header
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of ["index-_fJendd7.js", "index-LZ7b_aDw.js", "portal-CGcjgAeB.js", "index-D8JrnKcV.js"]) {
  const t = fs.readFileSync(`${dir}/${f}`, "utf8");
  console.log("\n===", f, "===");
  console.log("portal-header", t.includes("portal-header"));
  console.log("PortalHeader / _fJendd7", t.includes("_fJendd7") || t.includes("portal-header-wrapper"));
  const m = t.match(/from"\.\/index-_fJendd7[^"]*"/);
  console.log("import header", m && m[0]);
}
