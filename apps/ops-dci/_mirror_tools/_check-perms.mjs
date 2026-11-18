import fs from "node:fs";
const s = JSON.parse(
  fs.readFileSync(
    new URL("../mirror/static/js/ops-mock-store.json", import.meta.url),
    "utf8",
  ),
);
const p = s["GET /api/v1/dciManage/getInfo"].data.permissions;
console.log("count", p.length);
console.log("star", p.includes("*:*:*"));
console.log(
  "portal",
  p.filter((x) => String(x).includes("portal") || x === "*:*:*"),
);
const html = fs.readFileSync(
  new URL("../mirror/index.html", import.meta.url),
  "utf8",
);
console.log("html mocks", html.match(/ops-mock[^"']+/g));
