import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js",
  "utf8",
);
let i = 0,
  n = 0;
while ((i = t.indexOf("ue", i)) >= 0 && n < 30) {
  const ctx = t.slice(Math.max(0, i - 1), i + 15);
  if (/\bue\b/.test(ctx) || ctx.includes("ue=") || ctx.includes("ue.") || ctx.includes(",ue") || ctx.includes("ue,")) {
    if (!ctx.includes("value") && !ctx.includes("queue") && !ctx.includes("true") && !ctx.includes("blue")) {
      console.log(i, t.slice(Math.max(0, i - 20), i + 40).replace(/\n/g, " "));
      n++;
    }
  }
  i += 2;
}
