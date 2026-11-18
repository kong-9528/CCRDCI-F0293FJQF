import fs from "node:fs";
const s = fs.readFileSync(
  new URL("../mirror/static/js/index-DsYmzmNg.js", import.meta.url),
  "utf8",
);
const re = /"\.\.\/\.\.\/views\/[^"]+"/g;
const m = [...s.matchAll(re)].map((x) => x[0]);
console.log("count", m.length);
console.log(m.filter((x) => /biz|account|content|portal|dci\//i.test(x)).join("\n"));
const pe = s.indexOf("bizConsult");
console.log("idx", pe);
console.log(s.slice(Math.max(0, pe - 200), pe + 500));

// sample exports used by a known page
const pages = fs
  .readdirSync(new URL("../mirror/static/js", import.meta.url))
  .filter((n) => /account|biz|Consult|pending|my-/i.test(n));
console.log("candidate pages", pages);

const pending = fs.readFileSync(
  new URL("../mirror/static/js/pending-CPU4DaaD.js", import.meta.url),
  "utf8",
);
console.log("pending imports head", pending.slice(0, 400));
