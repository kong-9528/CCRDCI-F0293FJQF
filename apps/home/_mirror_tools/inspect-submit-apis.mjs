import fs from "fs";

const reg = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);
const auth = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const ri = reg.indexOf("function S()");
console.log("REGISTER S:\n", reg.slice(ri, ri + 550));

const mi = auth.indexOf("function me()");
console.log("\nFORGOT me:\n", auth.slice(mi, mi + 450));

// also find register API import W
console.log("\nreg has W(l)", reg.includes("W(l)"));
console.log("auth has Qe(", auth.includes("Qe("));
