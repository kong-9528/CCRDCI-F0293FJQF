import fs from "fs";

const bi = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);
console.log("780", bi.includes('width:"780px"'));
console.log("700", bi.includes('width:"700px"'));
console.log("q(register)", bi.includes('q("register")'));
console.log("push /register", bi.includes('push("/register")'));
console.log("de();re.push", bi.includes("de();re.push"));

const hdr = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-_fJendd7.js",
  "utf8",
);
console.log("hdr R(register)", hdr.includes('R("register")'));
console.log("hdr push register", hdr.includes('push("/register")'));

const lz = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js",
  "utf8",
);
console.log("lz function R", lz.includes('function R(i="login"){w.value=i,c.value=!0}'));
console.log("lz w.value=register", lz.includes('w.value="register",c.value=!0'));
