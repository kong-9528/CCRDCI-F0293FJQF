import fs from "node:fs";

const files = [
  "softRqDetails-BDJ8U7Pp.js",
  "softCqDetails-BMu5mxU4.js",
  "datasetXqDetails-CJi-3Zer.js",
  "opusRqDetails-BLreSPNk.js",
  "opusXqDetails-XGcK_qWf.js",
];

for (const f of files) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${f}`, "utf8");
  const setup = s.match(/setup\([^)]*\)\{[\s\S]{0,800}/);
  console.log("\n====", f, "====");
  console.log(setup ? setup[0].slice(0, 700) : "no setup");
  console.log(
    "imports api?",
    /codeManage|applyDoc|rInfo|fetch/.test(s.slice(0, 300)),
  );
  console.log("has full-row?", /full-row|span:3|grid-column/.test(s));
  console.log("DCI label snippet:", s.match(/DCI码[^\"']{0,20}/)?.[0]);
}
