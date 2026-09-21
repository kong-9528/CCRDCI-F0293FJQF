import fs from "fs";
const h = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-_fJendd7.js",
  "utf8",
);
const i = h.indexOf('command:"profile"');
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_menu-block.txt",
  h.slice(i - 120, i + 2200),
);
console.log("wrote", i);
