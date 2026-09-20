import fs from "fs";

const bi = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

// Find register mode section between is-register / 账号注册
const start = bi.indexOf('_.value==="register"');
console.log("start", start);
console.log(bi.slice(start, start + 2500));
