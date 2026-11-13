/**
 * Fix: second query does not refresh results because captcha dialog
 * modelValue stays true (A.value=!0 is a no-op) so success/te never re-runs.
 */
import fs from "node:fs";

const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
let s = fs.readFileSync(pagePath, "utf8");

const oldOpen = "return}A.value=!0}";
const newOpen =
  "return}r.value=[],c.value=!1;if(A.value){A.value=!1,setTimeout(function(){A.value=!0},0)}else A.value=!0}";

if (!s.includes(oldOpen)) {
  throw new Error("open-captcha anchor not found");
}
if (s.includes("setTimeout(function(){A.value=!0},0)")) {
  console.log("open-captcha already patched");
} else {
  // Only replace the search submit path (unique enough with preceding return})
  const count = s.split(oldOpen).length - 1;
  if (count !== 1) throw new Error(`expected 1 open anchor, got ${count}`);
  s = s.replace(oldOpen, newOpen);
  console.log("open-captcha patched");
}

const oldTe =
  "async function te(){const s=v.value.trim(),e=i.value.trim();c.value=!0,p.value=!0;try{await n();const a=await Me({dciCode:s,keyword:e});r.value=a.data||[],$()}catch{r.value=[]}finally{c.value=!1}}";
const newTe =
  "async function te(){const s=v.value.trim(),e=i.value.trim();c.value=!0,p.value=!0,r.value=[];try{await n();const a=await Me({dciCode:s,keyword:e});r.value=Array.isArray(a&&a.data)?a.data.slice():[],$()}catch{r.value=[]}finally{c.value=!1}}";

if (s.includes("p.value=!0,r.value=[];try{await n()")) {
  console.log("te already patched");
} else if (!s.includes(oldTe)) {
  throw new Error("te anchor not found");
} else {
  s = s.replace(oldTe, newTe);
  console.log("te patched");
}

fs.writeFileSync(pagePath, s, "utf8");
console.log({
  reopen: s.includes("setTimeout(function(){A.value=!0},0)"),
  clearOnQuery: s.includes("return}r.value=[],c.value=!1;if(A.value)"),
  clearOnTe: s.includes("p.value=!0,r.value=[];try{await n()"),
});
