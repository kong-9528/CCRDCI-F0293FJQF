import fs from "node:fs";

const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");

const keys = [
  "relatedRegNo",
  "dciCode",
  "caseName",
  "ownerName",
  "registerName",
  "regOrgName",
  "applyOrgName",
  "dciApplyTime",
  "caseCategory",
  "dciStatus",
  "query-result",
  "result-item",
  "登记号",
  "DCI码",
  "著作权人",
  "作品名称",
  "作品类别",
  "公告",
  "noticeType",
  "announcement",
  "listByDciCodeAndKeyword",
];

for (const key of keys) {
  let i = -1;
  let n = 0;
  while ((i = s.indexOf(key, i + 1)) >= 0 && n < 4) {
    console.log("\n==", key, n, "@", i);
    console.log(s.slice(Math.max(0, i - 100), i + 220));
    n++;
  }
}
