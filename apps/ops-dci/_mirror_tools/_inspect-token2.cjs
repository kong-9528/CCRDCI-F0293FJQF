const fs = require("fs");
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
// find Ts= definition near Admin-Token
const i = s.indexOf('T8="Admin-Token"');
// search backwards for Cookies or js-cookie
const chunk = s.slice(Math.max(0, i - 5000), i);
const m = chunk.match(/Ts=[^,;]+/g);
console.log("Ts assigns near token", m && m.slice(-5));
// also Cookies.get
for (const pat of ["Cookies=", "js-cookie", "Cookie.set", "document.cookie", "localStorage.getItem(T8)", "Ts={"]) {
  console.log(pat, s.indexOf(pat));
}
// find definition of Ts more carefully - look for var Ts or const Ts or ,Ts=
let p = 0, c = 0;
while ((p = s.indexOf("Ts=", p)) >= 0 && c < 20) {
  const snip = s.slice(p, p + 80);
  if (!snip.startsWith("Ts=e") && !snip.includes("Ts=t") && snip.match(/^Ts=[A-Za-z0-9_("]/)) {
    console.log("cand", p, snip);
  }
  p++;
  c++;
}
// Search for Cookies.withAttributes or default export assigned
const j = s.lastIndexOf("Cookies", i);
console.log("\nCookies before token", j, s.slice(j, j + 200));
// RuoYi often: import Cookies from 'js-cookie'; const TokenKey = 'Admin-Token'
const k = s.indexOf("js-cookie");
console.log("js-cookie", k);
// Find get/set/remove object used as Ts
const around = s.slice(i - 3000, i);
const cookieLib = around.match(/function [a-zA-Z0-9]+\([^)]*\)\{[^}]{0,40}document\.cookie/g);
console.log("cookie fns", cookieLib);
