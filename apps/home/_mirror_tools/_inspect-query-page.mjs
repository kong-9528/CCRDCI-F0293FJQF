import fs from "node:fs";

const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
console.log("len", s.length);

for (const key of [
  "请输入DCI",
  "placeholder",
  "dciCode",
  "keyword",
  "listByDciCode",
  "登记",
]) {
  let i = -1;
  let n = 0;
  while ((i = s.indexOf(key, i + 1)) >= 0 && n < 6) {
    console.log("\n==", key, n, i);
    console.log(s.slice(Math.max(0, i - 80), i + 200));
    n++;
  }
}

const mock = fs.readFileSync("apps/home/mirror/static/js/dci-mock-api.js", "utf8");
const j = mock.indexOf("listByDciCodeAndKeyword");
console.log("\n==== mock ====");
console.log(mock.slice(j - 40, j + 800));
