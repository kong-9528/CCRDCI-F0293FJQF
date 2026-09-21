/**
 * After Vite build, copy dist/index.html to each SPA route path as
 * `<route>/index.html` so COS/static hosts can serve deep links without
 * relying solely on "error document → index.html".
 *
 * Usage: node spa-fallback.mjs [distDir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, process.argv[2] || "dist");
const indexFile = path.join(distDir, "index.html");

/** Known history routes (no leading slash). Dynamic segments omitted. */
const ROUTES = [
  "desk",
  "dashboard",
  "verify/dci",
  "verify/info",
  "verify/certificate",
  "review/safety",
  "review/duplicate",
  "review/infringement",
  "account",
  "account/edit",
  "account/password",
  "docs",
  "help",
  "api",
  "api/keys",
  "api/stats",
  "api/docs",
  "keys",
  "api-docs",
  "audit",
  "analytics",
  "apply",
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
