/**
 * After prepare-dist, copy index.html into known SPA route paths so
 * COS / 云开发静态托管 can serve deep links (e.g. /user/profile).
 *
 * IMPORTANT: never write no-extension keys like `dashboard/index`.
 * COS serves those as application/octet-stream → browser downloads
 * "index.html". Always write `…/index.html` (and optional `.html`
 * siblings). Exact keys like `/dashboard/index` still need the
 * hosting "错误文档 = index.html / 200" (assets use absolute `/…`).
 *
 * Usage: node spa-fallback.mjs [distDir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, process.argv[2] || "../dist");
const indexFile = path.join(distDir, "index.html");

/** Known history routes (no leading slash). */
const ROUTES = [
  "login",
  "register",
  "lock",
  "401",
  "index",
  "dashboard",
  "dashboard/index",
  "user",
  "user/profile",
  "dci/system",
  "dci/standard",
  "dci/regorg/portal",
  "dci/regorg/info",
  "dci/regorg-info",
  "dci/eco",
  "dci/lab",
  "dci/query",
  "dci/faq",
  "dci/contact",
  "dci/tech-center",
  "dci/applyorginfo/index",
  "dci/info-management",
  "dci/info-management/index",
  "dci/api-management",
  "dci/api-management/index",
  "dci/dciapi",
  "dci/dciapi/index",
  "dci/org-info",
  "dci/org-info/index",
  "dci/BusinessInterfaceManage",
];

if (!fs.existsSync(indexFile)) {
  console.error("spa-fallback: missing", indexFile);
  process.exit(1);
}

const html = fs.readFileSync(indexFile);
const written = [];

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(rel, buf) {
  const abs = path.join(distDir, ...rel.split("/"));
  ensureParent(abs);
  try {
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return;
  } catch {}
  fs.writeFileSync(abs, buf);
  written.push(rel);
}

/** Remove leftover no-extension keys that would trigger downloads. */
function removeNoExtTrap(rel) {
  const abs = path.join(distDir, ...rel.split("/"));
  try {
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      fs.unlinkSync(abs);
      written.push(`(removed) ${rel}`);
    }
  } catch {}
}

for (const route of ROUTES) {
  const parts = route.split("/").filter(Boolean);
  // Always: route/index.html  (and route.html for hosts that map .html)
  writeFile([...parts, "index.html"].join("/"), html);
  writeFile(parts.join("/") + ".html", html);
}

// Root no-extension `index` (copied from mirror) downloads as a file — delete it.
removeNoExtTrap("index");
for (const route of ROUTES) {
  const parts = route.split("/").filter(Boolean);
  if (parts[parts.length - 1] === "index") {
    removeNoExtTrap(parts.join("/"));
  }
}

console.log(
  JSON.stringify(
    { spaFallbackFiles: written.length, sample: written.slice(0, 12), distDir },
    null,
    2,
  ),
);
