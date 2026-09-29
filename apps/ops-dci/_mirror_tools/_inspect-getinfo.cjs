const fs = require("fs");
const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
const i = s.indexOf("getInfo()");
// find getInfo action in user store
const j = s.indexOf("getInfo(){");
console.log("getInfo action", j);
console.log(s.slice(j, j + 900));
const store = JSON.parse(fs.readFileSync("apps/ops-dci/mirror/static/js/ops-mock-store.json", "utf8"));
const keys = Object.keys(store).filter((k) => k.includes("getInfo"));
console.log("\ngetInfo keys", keys);
keys.slice(0, 3).forEach((k) => {
  const b = store[k];
  console.log(k, "code", b && b.code, "roles", b && b.data && b.data.roles, "user", b && b.data && b.data.user && b.data.user.userName);
});
