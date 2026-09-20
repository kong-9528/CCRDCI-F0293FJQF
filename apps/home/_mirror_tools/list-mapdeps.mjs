import fs from "fs";

const main = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);

const start = main.indexOf("const __vite__mapDeps");
const arrStart = main.indexOf("m.f||(m.f=[", start);
const arrEnd = main.indexOf("]),", arrStart);
const raw = main.slice(arrStart + "m.f||(m.f=[".length, arrEnd);
const files = [...raw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const want = [
  "register-CvP1VOMb.js",
  "register-BOtQW-KH.css",
  "passwordRule-CK9dJiC2.js",
  "index-_fJendd7.js",
  "index--ISO3lnV.css",
  "index-BiQimQRe.js",
  "index-CLvhJbpp.css",
];
for (const w of want) {
  const i = files.indexOf(`static/js/${w}`) >= 0
    ? files.indexOf(`static/js/${w}`)
    : files.indexOf(`static/css/${w}`);
  // try both
  let idx = files.findIndex((f) => f.endsWith("/" + w) || f.endsWith(w));
  console.log(idx, files[idx] || "MISSING " + w);
}

console.log("\ncurrent register mapDeps call:");
const c = main.indexOf('import("./register-CvP1VOMb.js")');
console.log(main.slice(c, c + 80));
