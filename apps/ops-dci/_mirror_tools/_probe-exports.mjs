import fs from "node:fs";
const s = fs.readFileSync(
  new URL("../mirror/static/js/index-DsYmzmNg.js", import.meta.url),
  "utf8",
);
// find export { ... } at end or export{a8 as ...
const m = s.match(/export\{([^}]+)\}/g);
if (!m) {
  console.log("no export block");
} else {
  console.log("export blocks", m.length);
  const last = m[m.length - 1];
  console.log(last.slice(0, 2000));
}

const accountMap = s.match(
  /"\.\.\/\.\.\/views\/dci\/account\/index\.vue":\(\)=>Pe\(\(\)=>import\("\.\/([^"]+)"\)/,
);
console.log("account chunk", accountMap && accountMap[1]);
const biz = s.match(
  /"\.\.\/\.\.\/views\/dci\/bizConsult\/index\.vue":\(\)=>Pe\(\(\)=>import\("\.\/([^"]+)"\)/,
);
console.log("biz chunk", biz && biz[1]);

const html = fs.readFileSync(
  new URL("../mirror/index.html", import.meta.url),
  "utf8",
);
const scripts = [...html.matchAll(/ops-mock[^"']+/g)].map((x) => x[0]);
console.log("html mocks", scripts);

const acc = fs.readFileSync(
  new URL("../mirror/static/js/" + (accountMap ? accountMap[1] : "x"), import.meta.url),
  "utf8",
);
console.log("account head", acc.slice(0, 350));
