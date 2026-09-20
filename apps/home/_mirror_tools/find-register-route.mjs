import fs from "fs";

const t = fs.readFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js",
  "utf8",
);

// find router routes for register
const idx = t.indexOf("register");
const routes = [...t.matchAll(/path:\s*"(\/[^"]*)"[^}]{0,80}register|register[^}]{0,80}path:\s*"(\/[^"]*)"/g)];
console.log("route matches", routes.slice(0, 10).map((m) => m[0].slice(0, 120)));

const idx2 = t.indexOf('path:"/register"');
console.log("/register path idx", idx2);
if (idx2 > 0) console.log(t.slice(idx2 - 50, idx2 + 200));

const idx3 = t.indexOf("register-CvP1VOMb");
console.log("register chunk", idx3);
if (idx3 > 0) console.log(t.slice(idx3 - 80, idx3 + 120));
