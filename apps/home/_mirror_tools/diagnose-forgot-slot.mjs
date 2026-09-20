import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const i = t.indexOf('ref_key:"forgotFormRef"');
console.log(t.slice(i, i + 200));
console.log("\n---\n");

// find the form closing with _:1 after forgot steps
const j = t.indexOf('key:"forgot-step2"');
const k = t.indexOf(',_:1},8,["model","rules"]', j);
console.log("form slot flag at", k, t.slice(k - 30, k + 40));

// How many _:1 on forgot form
const forgotBlock = t.slice(i, t.indexOf("记起密码了", i) + 80);
console.log("\nflags in forgot block:");
const re = /_:(\d)/g;
let m;
while ((m = re.exec(forgotBlock))) {
  console.log("  _:" + m[1], "at", m.index, forgotBlock.slice(m.index - 40, m.index + 30));
}
