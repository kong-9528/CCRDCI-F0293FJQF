import fs from "fs";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const t = fs.readFileSync(path, "utf8");
console.log("len", t.length);
console.log("Ze2 fn", t.includes("function Ze2()"));
console.log("Se1", t.includes("const Se1="));
console.log("Se2", t.includes("const Se2="));
console.log("forgot-verify", t.includes("forgot-verify"));
console.log("forgot-setpwd", t.includes("forgot-setpwd"));
console.log("forgot-back", t.includes("forgot-back"));
console.log("下一步", t.includes('m("下一步"'));
console.log("重置密码 btn", t.includes('m("重置密码"'));

const i = t.indexOf('_.value==="forgot"?');
console.log("forgot ternary at", i);
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_forgot-slice.txt",
  t.slice(i, i + 2500),
  "utf8",
);
console.log("wrote slice");

// Find Ze2 function
const z = t.indexOf("function Ze2()");
console.log("Ze2 at", z);
if (z > 0) console.log(t.slice(z, z + 400));
