import fs from "fs";

const main = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);

// Find captcha-related API helpers
for (const needle of [
  "captchaImage",
  "/code",
  "getCode",
  "captchaEnabled",
  "captcha/get",
  "url:\"/captcha",
  "url:\"/code",
]) {
  let i = 0;
  let n = 0;
  while ((i = main.indexOf(needle, i)) >= 0 && n < 3) {
    console.log("\n", needle, "@", i);
    console.log(main.slice(Math.max(0, i - 80), i + 120).replace(/\n/g, " "));
    i += needle.length;
    n++;
  }
}

// Also check what O/Le/pe/ve/Y are imported as in each file - the captcha fetch fn
const files = {
  "register-CvP1VOMb.js": "O()",
  "index-BiQimQRe.js": "Le()",
  "login-C3yLEQUn.js": "pe()",
  "index-CsmZrPeY.js": "ve()",
  "index-CTKcd-BI.js": "Y()",
};
