/**
 * After prepare-dist, copy index.html into known SPA route paths so
 * COS / 云开发静态托管 can serve deep links (e.g. /dashboard/index).
 *
 * COS looks up the exact object key for `/dashboard/index` as
 * `…/dashboard/index` (no `.html`). We therefore write a no-extension
 * file for routes whose last segment is `index`, instead of a folder.
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
  // If a directory already occupies this path, skip the file write.
  try {
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return;
  } catch {}
  fs.writeFileSync(abs, buf);
  written.push(rel);
}

for (const route of ROUTES) {
  const parts = route.split("/").filter(Boolean);
  const last = parts[parts.length - 1];

  if (last === "index") {
    // Exact COS key for /…/index  →  file "…/index" (no extension)
    writeFile(parts.join("/"), html);
    // Also …/index.html
    writeFile(parts.join("/") + ".html", html);
  } else {
    // /route and /route/  →  route/index.html
    writeFile([...parts, "index.html"].join("/"), html);
    writeFile(parts.join("/") + ".html", html);
  }
}

// Root no-extension `index` (mirror often ships this alongside index.html)
writeFile("index", html);

console.log(
  JSON.stringify(
    { spaFallbackFiles: written.length, sample: written.slice(0, 12), distDir },
    null,
    2,
  ),
);
