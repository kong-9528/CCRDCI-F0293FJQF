import fs from "fs";

const main =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js";
const m = fs.readFileSync(main, "utf8");

// Find export of SS / ae
const exp = m.lastIndexOf("export{");
console.log("export tail", m.slice(exp, exp + 2000));

// find ,SS as or SS,
const hits = [];
for (const re of [/SS as [A-Za-z0-9]+/g, /[A-Za-z0-9]+ as ae\b/g, /,ae,/g]) {
  const a = m.match(re);
  if (a) hits.push(...a.slice(0, 5));
}
console.log("hits", hits);

// Profile imports line
const p = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js",
  "utf8",
);
console.log("profile imports", p.slice(0, 350));

// logOut action
const lo = m.indexOf("logOut()");
console.log("logOut ctx", m.slice(lo, lo + 250));
const lo2 = m.indexOf("logOut(){");
console.log("logOut action", m.slice(lo2, lo2 + 200));
