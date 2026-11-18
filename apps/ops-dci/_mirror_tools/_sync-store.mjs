import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "mirror/static/js/ops-mock-store.json");
const jsPath = path.join(root, "mirror/static/js/ops-mock-store.js");
const htmlPath = path.join(root, "mirror/index.html");

const s = fs.readFileSync(jsonPath, "utf8");
fs.writeFileSync(jsPath, "window.__OPS_MOCK_STORE__ = " + s + ";\n");
const j = JSON.parse(s);
const p = j["GET /api/v1/dciManage/getInfo"].data.permissions;
console.log("star", p.includes("*:*:*"), "portal", p.filter((x) => String(x).includes("portal")));

let html = fs.readFileSync(htmlPath, "utf8");
html = html.replace(/ops-mock-store\.js(\?v=[^"]*)?/, "ops-mock-store.js?v=portal-perm-1");
html = html.replace(/ops-mock-api\.js(\?v=[^"]*)?/, "ops-mock-api.js?v=portal-perm-1");
fs.writeFileSync(htmlPath, html);
console.log("html", html.match(/ops-mock[^"']+/g));
