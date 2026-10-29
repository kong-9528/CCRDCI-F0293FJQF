/**
 * Remove native `import "...css"` from detail wrappers — breaks on COS static hosting.
 * Styles are injected by DciEntityDetail.js via <link>.
 */
import fs from "node:fs";

const files = [
  "apps/ops-dci/mirror/static/js/opusRdetails-BcBlhLGL.js",
  "apps/ops-dci/mirror/static/js/opusCdetails-CAAKRZHF.js",
  "apps/ops-dci/mirror/static/js/opusXdetails-Cld5NkTY.js",
  "apps/ops-dci/mirror/static/js/softRdetails-C7nosZyJ.js",
  "apps/ops-dci/mirror/static/js/softCdetails-ykzNbHOg.js",
  "apps/ops-dci/mirror/static/js/softXdetails-Bzn_5q9r.js",
  "apps/ops-dci/mirror/static/js/datasetRdetails-dqAwL1B4.js",
  "apps/ops-dci/mirror/static/js/datasetCdetails-CgojRYpN.js",
  "apps/ops-dci/mirror/static/js/datasetXdetails-ybN1I1YA.js",
];

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const next = s.replace(/;import"\.\.\/css\/DciEntityDetail\.css"/g, ";");
  if (next === s) {
    console.log("NO CHANGE", f);
  } else {
    fs.writeFileSync(f, next, "utf8");
    console.log("patched", f);
  }
}
