import fs from "fs";

const jsDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";
const main = fs.readFileSync(jsDir + "index-DA8BAxJb.js", "utf8");
const i = main.indexOf("function J3e()");
console.log("J3e head:", main.slice(i, i + 100));
console.log("has demo1 png header in dataURL:", main.includes("data:image/png;base64,iVBORw0KGgo"));
console.log("cycles 2:", (main.slice(i, i + 50000).match(/data:image\/png;base64,/g) || []).length);
console.log("no remote captchaImage call:", !main.includes('url:"/captchaImage"'));

const files = [
  "register-CvP1VOMb.js",
  "index-BiQimQRe.js",
  "login-C3yLEQUn.js",
  "index-CsmZrPeY.js",
  "index-CTKcd-BI.js",
];
for (const f of files) {
  const t = fs.readFileSync(jsDir + f, "utf8");
  const left = t.includes('"data:image/gif;base64,"+');
  const around = t.indexOf(".uuid");
  // find img assignment near captcha
  const m = t.match(/\w+\.value=[^=,\n]{0,40}\.img[^;]{0,40}/g);
  const m2 = t.match(/\w+\.value=[a-z](?=[,;})])/g);
  console.log("\n" + f);
  console.log("  leftover gif prefix:", left);
  console.log("  img assigns:", m && m.slice(0, 3));
}

// quick node syntax check on small files
import { execSync } from "child_process";
for (const f of ["register-CvP1VOMb.js", "index-CTKcd-BI.js"]) {
  try {
    execSync(`node --check "${jsDir}${f}"`, { stdio: "pipe" });
    console.log("syntax OK", f);
  } catch (e) {
    console.log("syntax FAIL", f, String(e.stderr || e));
  }
}
