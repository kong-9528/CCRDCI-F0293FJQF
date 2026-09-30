/**
 * After prepare-dist, copy index.html into known SPA route paths so
 * CloudBase / COS static hosting can serve deep links.
 *
 * NEVER write no-extension keys like `index` or `registrOrg/pending/index`.
 * COS serves those as application/octet-stream → browser downloads "index".
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
  "index",
  "404",
  "registrOrg",
  "registrOrg/pending",
  "registrOrg/my",
  "registrOrg/all",
  "dci/stat",
  "dci/stat/code",
  "dci/stat/org",
  "dci/stat/ownerStat",
  "dci/stat/related",
  "dciCodeManage",
  "dciCodeManage/query",
  "dciCodeManage/allocation",
  "dciCodeManage/owner",
  "contentManag",
  "contentManag/bizConsult",
  "contentManag/account",
  "system",
  "system/log",
  "system/log/operlog",
  "system/log/logininfor",
  "system/invitationCode",
  "system/busPort",
  "system/busPort/BusinessInterfaceManage",
  "system/busPort/InterfaceCallQuery",
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
