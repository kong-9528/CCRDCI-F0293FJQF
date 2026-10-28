import fs from "node:fs";

for (const [name, file] of [
  ["opus", "opus-DCRymxdq.js"],
  ["soft", "soft-D-V6yNun.js"],
  ["dataset", "dataset-cXmRoDti.js"],
]) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${file}`, "utf8");
  // find table column for DCI码 with link+copy
  const re = /label:"DCI码"[\s\S]{0,800}?DocumentCopy|label:"DCI码"[\s\S]{0,800}?CopyDocument/;
  const m = s.match(re);
  console.log("\n====", name, "====");
  if (!m) {
    // broader
    const i = s.indexOf('label:"DCI码",align:"center"');
    console.log(i >= 0 ? s.slice(i, i + 550) : "not found center");
    const j = [...s.matchAll(/label:"DCI码"/g)].map((x) => x.index);
    for (const idx of j) {
      const snip = s.slice(idx, idx + 200);
      if (snip.includes("el-link") || snip.includes("CopyDocument") || snip.includes("onClick")) {
        console.log(s.slice(idx, idx + 550));
      }
    }
  } else {
    console.log(m[0]);
  }
}

// list css files
for (const name of fs.readdirSync("apps/ops-dci/mirror/static/css")) {
  if (/^(opus|soft|dataset)-.*\.css$/.test(name) && !/detail|Detail|qDetails|Rq|Cq|Xq/i.test(name)) {
    console.log("css", name);
  }
}
