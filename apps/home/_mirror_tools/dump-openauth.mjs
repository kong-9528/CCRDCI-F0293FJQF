import fs from "fs";

function dump(file, needle, times = 6) {
  const t = fs.readFileSync(file, "utf8");
  console.log("\n########", file.split("/").pop());
  let from = 0;
  let n = 0;
  while (n < times) {
    const i = t.indexOf(needle, from);
    if (i < 0) break;
    console.log("---", needle, i);
    console.log(t.slice(Math.max(0, i - 120), i + 200));
    from = i + needle.length;
    n++;
  }
}

dump(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/portal-CGcjgAeB.js",
  "onOpenAuth",
);
dump(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js",
  "onOpenAuth",
);
dump(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-LZ7b_aDw.js",
  "register",
  8,
);
dump(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "function q",
  3,
);
