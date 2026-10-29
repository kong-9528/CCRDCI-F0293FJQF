import fs from "node:fs";
import path from "node:path";

const dir = "apps/ops-dci/mirror/static/js";
const files = fs.readdirSync(dir).filter((f) => /^(opus|soft|dataset)-.*\.js$/.test(f));
console.log(files);

for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  console.log("\n====", f);
  const i = s.indexOf("handleExport");
  console.log(
    "handleExport",
    i >= 0 ? s.slice(Math.max(0, i - 80), i + 450) : "NONE",
  );
  const j = s.indexOf("codeManage:export");
  console.log(
    "export perm",
    j >= 0 ? s.slice(j - 120, j + 200) : "NONE",
  );
  // find prop + nearby class
  for (const key of ["caseCategoryCode", "dciStatus", "dciCodeType"]) {
    const idx = s.indexOf(`prop:"${key}"`);
    if (idx < 0) {
      console.log(key, "no prop");
      continue;
    }
    const chunk = s.slice(idx, idx + 350);
    const cm = chunk.match(/class:"([^"]+)"/);
    console.log(key, "class=", cm ? cm[1] : "?", "chunk=", chunk.slice(0, 200));
  }
  // list columns near table
  const tIdx = s.indexOf('label:"序号"');
  if (tIdx >= 0) {
    const part = s.slice(tIdx, tIdx + 1800);
    console.log(
      "table labels",
      [...part.matchAll(/label:"([^"]+)"/g)].map((x) => x[1]),
    );
  }
}

// inspect download helper ax from index
const idx = fs.readFileSync(path.join(dir, "index-DsYmzmNg.js"), "utf8");
const axExport = idx.match(/ax as [^,}]+|[^,{]+ as ax/);
console.log("\nax aliases", axExport);
// find definition of download - often near blob download
const blobIdx = idx.indexOf("application/vnd.openxmlformats");
console.log("xlsx mime", blobIdx, blobIdx >= 0 ? idx.slice(blobIdx - 200, blobIdx + 200) : "");
const dlIdx = idx.search(/function\s+\w+\s*\(\s*url\s*,\s*params/);
console.log("url,params fn", dlIdx);

// search for applyDoc/export string
const exportUrlIdx = idx.indexOf("applyDoc/export");
console.log("index applyDoc/export", exportUrlIdx);

for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  console.log(f, "applyDoc/export?", s.includes("applyDoc/export"), "export?", [...s.matchAll(/["`][^"`]*export[^"`]*["`]/g)].slice(0, 8).map((x) => x[0]));
}

const utils = fs.readFileSync(path.join(dir, "dciCodeManageUtils-EpDHrTiS.js"), "utf8");
console.log("\nutils export snippets:");
const uIdx = utils.indexOf("export");
console.log(utils.slice(0, 800));
console.log("---");
console.log([...utils.matchAll(/\/dci\/[^"']+/g)].map((x) => x[0]));
