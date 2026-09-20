import fs from "fs";

const pngDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/png";
const jsDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";
const mainPath = jsDir + "index-DA8BAxJb.js";

const u1 =
  "data:image/png;base64," +
  fs.readFileSync(`${pngDir}/captcha-demo-1.png`).toString("base64");
const u2 =
  "data:image/png;base64," +
  fs.readFileSync(`${pngDir}/captcha-demo-2.png`).toString("base64");

let main = fs.readFileSync(mainPath, "utf8");

const start = main.indexOf("function J3e()");
if (start < 0) throw new Error("J3e missing");

// Current demo ends with: return Promise.resolve(Object.assign({data:n},n))}
const endMarker = "return Promise.resolve(Object.assign({data:n},n))}";
const end = main.indexOf(endMarker, start);
if (end < 0) {
  // maybe remote form still
  const remoteEnd = main.indexOf(
    'url:"/captchaImage",headers:{isToken:!1},method:"get",timeout:2e4})}',
    start,
  );
  if (remoteEnd < 0) {
    console.error("cannot find J3e end", main.slice(start, start + 200));
    process.exit(1);
  }
}

const endPos =
  end >= 0
    ? end + endMarker.length
    : main.indexOf(
        'url:"/captchaImage",headers:{isToken:!1},method:"get",timeout:2e4})}',
        start,
      ) +
      'url:"/captchaImage",headers:{isToken:!1},method:"get",timeout:2e4})}'
        .length;

const newFn = `function J3e(){J3e._i=(J3e._i||0)+1;const e=[${JSON.stringify(u1)},${JSON.stringify(u2)}][(J3e._i-1)%2],t="demo-captcha-"+J3e._i,n={img:e,uuid:t,captchaEnabled:!0};return Promise.resolve(Object.assign({data:n},n))}`;

main = main.slice(0, start) + newFn + main.slice(endPos);
fs.writeFileSync(mainPath, main);
console.log("OK J3e replaced", { start, endPos, newLen: newFn.length, main: main.length });
console.log("img is dataURL", main.slice(start, start + 80).includes("data:image/png"));

const consumers = [
  "register-CvP1VOMb.js",
  "index-BiQimQRe.js",
  "login-C3yLEQUn.js",
  "index-CsmZrPeY.js",
  "index-CTKcd-BI.js",
];

for (const f of consumers) {
  const p = jsDir + f;
  let t = fs.readFileSync(p, "utf8");
  const n = t.split('"data:image/gif;base64,"+').length - 1;
  if (n === 0) {
    console.log("skip (no gif prefix)", f);
    continue;
  }
  t = t.split('"data:image/gif;base64,"+').join("");
  fs.writeFileSync(p, t);
  console.log("OK strip", f, "x" + n);
}
