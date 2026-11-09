import fs from "node:fs";

const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
for (const key of ["例如", "登记", "证书", "tip", "RQZ", "数字版权"]) {
  let i = -1;
  let n = 0;
  while ((i = s.indexOf(key, i + 1)) >= 0 && n < 5) {
    console.log("\n==", key, n);
    console.log(s.slice(Math.max(0, i - 60), i + 180));
    n++;
  }
}

// full mock hit object
const mock = fs.readFileSync("apps/home/mirror/static/js/dci-mock-api.js", "utf8");
const j = mock.indexOf("mock-apply-doc-tip-1");
console.log("\n==== hit object ====");
console.log(mock.slice(j - 20, j + 900));
