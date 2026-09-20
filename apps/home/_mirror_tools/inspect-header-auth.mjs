import fs from "fs";

const header = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-_fJendd7.js",
  "utf8",
);

for (const k of ["openAuth", "注册", "register", "emit("]) {
  let from = 0;
  let n = 0;
  while (n < 6) {
    const i = header.indexOf(k, from);
    if (i < 0) break;
    console.log("\n===", k, i, "===");
    console.log(header.slice(Math.max(0, i - 80), i + 140));
    from = i + k.length;
    n++;
  }
}

const portal = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/portal-CGcjgAeB.js",
  "utf8",
);
console.log("\nportal openAuth?", portal.includes("openAuth"));
const i = portal.indexOf("注册");
console.log(portal.slice(Math.max(0, i - 100), i + 150));
