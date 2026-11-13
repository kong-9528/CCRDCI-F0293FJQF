/**
 * Align home query mock DCI codes with ops-dci rule:
 *   DCI:{mid}.156.{YYYYMMDD + alnum}
 * mid length 9–12, /^[RCX][A-Z0-9]{8,11}$/
 */
import fs from "node:fs";

const repl = {
  "DCI:RQZ010WK.001.2026010100000001": "DCI:RQZ010ANT.156.20260108A1C3E5G7I9",
  "DCI:RQZ010WK.001.2026010100000002": "DCI:RQZWK1ANT.156.20250312B2D4F6H8J0",
  "DCI:RQZ010WK.001.2026010100000003": "DCI:RQZPHOANT.156.20260120C3E5G7I9K1",
  "DCI:RQZ010WK.001.2026010100000004": "DCI:RQZARTANT.156.20250601D4F6H8J0L2",
  "DCI:RQZ010SF.001.2026010100000011": "DCI:RQZSW0ANT.156.20260110E5G7I9K1M3",
  "DCI:RQZ010SF.001.2026010100000012": "DCI:RQZSW1ANT.156.20240816F6H8J0L2N4",
  "DCI:RQZ010SF.001.2026010100000013": "DCI:RQZSW2ANT.156.20260201G7I9K1M3P5",
  "DCI:RQZ010SF.001.2026010100000014": "DCI:RQZSW3ANT.156.20250410H8J0L2N4Q6",
  "DCI:RQZ010DT.001.2026010100000021": "DCI:RQZDS0ANT.156.20260118I9K1M3P5R7",
  "DCI:RQZ010DT.001.2026010100000022": "DCI:RQZDS1ANT.156.20250220J0L2N4Q6S8",
  "DCI:RQZ010DT.001.2026010100000023": "DCI:RQZDS2ANT.156.20260212K1M3P5R7T9",
  "DCI:RQZ010DT.001.2026010100000024": "DCI:RQZDS3ANT.156.20250715L2N4Q6S8U0",
};

const files = [
  "apps/home/mirror/static/js/dci-query-mock-catalog.js",
  "docsss/documents/DCI查询页-统一结果卡mock样例.md",
  "apps/home/mirror/static/js/index-BZ7-YeMc.js",
  "apps/home/_mirror_tools/_verify-dci-unified-query.mjs",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log("skip missing", file);
    continue;
  }
  let text = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [a, b] of Object.entries(repl)) {
    const c = text.split(a).length - 1;
    if (c) {
      text = text.split(a).join(b);
      n += c;
    }
  }
  fs.writeFileSync(file, text, "utf8");
  console.log(file, "replaced", n);
}

const catalog = fs.readFileSync("apps/home/mirror/static/js/dci-query-mock-catalog.js", "utf8");
const leftover = catalog.match(/DCI:[A-Z0-9]+\.001\.[A-Z0-9]+/g) || [];
if (leftover.length) throw new Error("leftover .001. codes: " + leftover.join(", "));

const codes = [...catalog.matchAll(/DCI:([A-Z0-9]+)\.156\.([A-Z0-9]+)/g)];
if (codes.length < 12) throw new Error("expected >=12 codes, got " + codes.length);
for (const [, mid, tail] of codes) {
  if (mid.length < 9 || mid.length > 12) throw new Error("bad mid length " + mid);
  if (!/^[RCX][A-Z0-9]{8,11}$/.test(mid)) throw new Error("bad mid " + mid);
  if (!/^\d{8}[A-Z0-9]+$/.test(tail)) throw new Error("bad tail " + tail);
}
console.log("rule ok,", codes.length, "codes");

let html = fs.readFileSync("apps/home/mirror/index.html", "utf8");
html = html.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-code-156-20261113",
);
fs.writeFileSync("apps/home/mirror/index.html", html, "utf8");
console.log("cache busted");

console.log("sample mapping:");
for (const [a, b] of Object.entries(repl)) console.log(" ", a, "=>", b);
