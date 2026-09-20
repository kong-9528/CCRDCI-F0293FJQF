import fs from "fs";

const files = [
  "register-CvP1VOMb.js",
  "index-BiQimQRe.js",
  "login-C3yLEQUn.js",
  "index-CsmZrPeY.js",
  "index-CTKcd-BI.js",
];

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";

for (const f of files) {
  const t = fs.readFileSync(dir + f, "utf8");
  console.log("\n====", f, "====");
  const re =
    /.{0,30}data:image\/gif;base64,"\+[^;]{0,80}/g;
  let m;
  while ((m = re.exec(t))) console.log("ASSIGN:", m[0]);
  // find function wrappers
  const re2 = /function [A-Za-z_$]+\(\)\{[^}]{0,200}data:image\/gif;base64[^}]{0,120}\}/g;
  while ((m = re2.exec(t))) console.log("FN:", m[0].slice(0, 220));
  // arrow/then patterns
  const re3 = /\.then\([^)]{0,40}=>\{[^}]{0,160}data:image\/gif;base64[^}]{0,100}\}/g;
  while ((m = re3.exec(t))) console.log("THEN:", m[0].slice(0, 240));
}
