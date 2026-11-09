import fs from "node:fs";
const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
console.log("renderHead count", s.split("__renderResultHead").length - 1);
console.log("buildFieldRows count", s.split("__buildFieldRows").length - 1);
console.log("old logo head", s.includes('alt:"DCI"},null,8,Fe),t("span",He,k(l.dciCode)'));
console.log("works name hardcode", s.includes('cell-label"},"作品名称：'));
console.log("DCI分配日期 hardcode", s.includes("DCI分配日期"));
const i = s.indexOf("result-card");
console.log("around result-card:\n", s.slice(i - 80, i + 500));
