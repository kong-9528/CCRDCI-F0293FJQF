const fs = require("fs");
const s = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/ops-dci/mirror/static/js/index-BKOQxITV.js",
  "utf8",
);
const hits = [];
for (const re of [/dciCodeDetail/g, /listByDci/g, /applyDoc/g, /keyword/g]) {
  let m;
  while ((m = re.exec(s))) hits.push({ re: re.source, i: m.index });
}
hits.forEach((h) => {
  console.log("---", h.re, h.i);
  console.log(s.slice(Math.max(0, h.i - 80), h.i + 120));
});
