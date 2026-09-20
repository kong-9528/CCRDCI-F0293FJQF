import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-D8JrnKcV.js",
  "utf8",
);

// I = PortalHeader, v = PortalFooter, C = Auth dialog
for (const name of ["I", "v", "C"]) {
  let idx = 0;
  let n = 0;
  while ((idx = t.indexOf(`s(${name}`, idx)) >= 0 && n < 3) {
    // also try r(
    idx++;
  }
  idx = 0;
  n = 0;
  while ((idx = t.indexOf(`(${name},`, idx)) >= 0 && n < 8) {
    const ctx = t.slice(Math.max(0, idx - 2), idx + 180);
    if (ctx.startsWith("r(") || ctx.includes(`s(${name}`) || ctx.startsWith(",(")) {
      console.log(`use ${name}:`, ctx.replace(/\n/g, " "));
      n++;
    }
    idx += 2;
  }
}

console.log("\n--- return template start ---");
const ret = t.indexOf("return(i,e)") >= 0 ? t.indexOf("return(i,e)") : t.indexOf("return(");
// find setup return render
const ri = t.lastIndexOf("return(", t.indexOf("el-") > 0 ? t.length : t.length);
const renderStart = t.indexOf("},(i,e)=>") >= 0
  ? t.indexOf("},(i,e)=>")
  : t.search(/\},\([a-z],e\)=>\{/);
console.log("renderStart", renderStart);
console.log(t.slice(renderStart, renderStart + 500));
