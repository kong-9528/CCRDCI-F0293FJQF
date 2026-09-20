import fs from "fs";

const js = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js",
  "utf8",
);

// Pretty-ish dump of template section
const start = js.indexOf("return T(),M");
console.log(js.slice(start, start + 3500));
