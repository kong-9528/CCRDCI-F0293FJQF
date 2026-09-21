/**
 * After Vite build, copy dist/index.html to known SPA routes for COS / static hosts.
 * Usage: node spa-fallback.mjs [distDir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, process.argv[2] || "dist");
const indexFile = path.join(distDir, "index.html");

const ROUTES = [
  "login",
  "home",
  "account/password",
  "admin/org",
  "admin/users",
  "admin/users/new",
  "admin/portal-users",
  "admin/roles",
  "admin/permissions",
  "admin/subsystems",
  "admin/apis",
  "admin/logs",
];

if (!fs.existsSync(indexFile)) {
  console.error("spa-fallback: missing", indexFile);
  process.exit(1);
}

const html = fs.readFileSync(indexFile);
let n = 0;
for (const route of ROUTES) {
  const dir = path.join(distDir, ...route.split("/"));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  n++;
}
console.log(`spa-fallback: wrote ${n} route index.html under ${distDir}`);
