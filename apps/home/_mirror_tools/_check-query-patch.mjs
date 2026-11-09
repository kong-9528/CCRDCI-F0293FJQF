import fs from "node:fs";
const s = fs.readFileSync("apps/home/mirror/static/js/index-BZ7-YeMc.js", "utf8");
console.log({
  renderHead: s.includes("__renderResultHead"),
  buildRows: s.includes("__buildFieldRows"),
  placeholder: s.includes("请输入DCI码或登记证书编号"),
  oldHardcode: s.includes('cell-label"},"作品类型：'),
});
