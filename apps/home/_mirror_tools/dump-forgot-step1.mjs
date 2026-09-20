import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const a = t.indexOf('key:"forgot-step1"');
const endMarker = '])):(v(),h(j,{key:"forgot-step2"}';
const end = t.indexOf(endMarker, a);
const step1 = t.slice(a, end + endMarker.length);
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/dump-forgot-step1.txt",
  step1,
  "utf8",
);

// Find structure: count createVNode for form items
console.log("step1 length", step1.length);
console.log("tail:", step1.slice(-120));

// Extract from prop smsCode to end
const sms = step1.indexOf('prop:"smsCode"');
console.log("\nsms→end:\n", step1.slice(sms, sms + 600));

// After patch, form default should be: [ ternary ]
// Find what comes after step2 block ends
const s2 = t.indexOf('key:"forgot-step2"');
const after = t.indexOf("])])],_:1},8,[\"model\",\"rules\"]", s2);
const after2 = t.indexOf("switch-register-row", s2);
console.log("\nafter step2 to footer:\n", t.slice(s2 + 800, after2 + 80));
