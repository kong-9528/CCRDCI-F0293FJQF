/**
 * After Vite build, copy dist/index.html to known SPA routes for static hosts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, process.argv[2] || "dist");
const indexFile = path.join(distDir, "index.html");

const ROUTES = [
  "login",
  "audit/tasks",
  "lists/user-blacklist",
  "lists/ip-whitelist",
  "lists/sensitive-words",
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
