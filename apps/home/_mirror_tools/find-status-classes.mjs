import fs from "fs";
const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js",
  "utf8",
);
for (const n of ["_a=", "Va=", "Sa=", "Ia=", "Da=", "status"]) {
  const i = t.indexOf(n);
  console.log(n, t.slice(i, i + 80));
}
