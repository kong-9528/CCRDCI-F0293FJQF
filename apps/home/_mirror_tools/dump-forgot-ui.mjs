import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);

const start = t.indexOf('_.value==="forgot"?(v(),h(j,{key:2}');
const endMarker = ')):G("",!0)';
const end = t.indexOf(endMarker, start) + endMarker.length;
const block = t.slice(start, end);
const out =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_forgot-ui.txt";
fs.writeFileSync(out, block, "utf8");
console.log({ start, end, len: block.length, head: block.slice(0, 80), tail: block.slice(-80) });
