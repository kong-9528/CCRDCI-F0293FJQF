import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// static class consts near forgot
for (const name of ["Ns=", "zs=", "Ms=", "Es=", "Ts=", "Ls=", "Xs=", "Ks=", "Ds=", "Is=", "Fs="]) {
  const i = t.indexOf("const " + name) >= 0 ? t.indexOf("const " + name) : t.indexOf("," + name);
  const j = t.indexOf(name + "{");
  console.log(name, j, t.slice(j, j + 80));
}

// mode switch to forgot - reset fields?
const i = t.indexOf('fe(()=>D.initialMode');
console.log("\nmode watch:\n", t.slice(i, i + 350));
const j = t.indexOf("function q(");
console.log("\nq():\n", t.slice(j, j + 400));
