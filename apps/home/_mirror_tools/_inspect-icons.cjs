const fs = require("fs");
const s = fs.readFileSync("apps/home/mirror/static/js/index-DA8BAxJb.js", "utf8");
for (const name of [
  "OfficeBuilding",
  "CopyDocument",
  "School",
  "Management",
  "Postcard",
  "Notebook",
  "Stamp",
  "House",
]) {
  console.log(name, s.includes(name));
}
// identity icon ay
const id = fs.readFileSync("apps/home/mirror/static/js/identity-sRS0ISv8.js", "utf8");
console.log("identity import line", id.match(/import\{[^}]+\}from"\.\/index-DA8BAxJb/)[0]);
// what does ay export - search nearby export
const exp = s.indexOf("ay as");
console.log("ay exports sample", s.slice(s.lastIndexOf("export{", exp - 5000), exp + 200).slice(0, 500));
