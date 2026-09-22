/**
 * Copy mirror/ → dist/ for static deploy (no bundling; assets already built).
 * Customer URL comes from VITE_CUSTOMER_URL (deploy platform or gitignored .env.local).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const src = path.join(appRoot, "mirror");
const dest = path.join(appRoot, "dist");
const env = loadEnv("production", appRoot, "VITE_");
const customerUrl = (env.VITE_CUSTOMER_URL || "http://localhost:3002").replace(
  /\/$/,
  "",
);

function rm(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    // Skip meta and root no-extension `index` (COS serves it as a download).
    if (name === "_mirror-meta.json") continue;
    if (name === "index" && from === src) continue;
    const a = path.join(from, name);
    const b = path.join(to, name);
    const st = fs.statSync(a);
    if (st.isDirectory()) copy(a, b);
    else fs.copyFileSync(a, b);
  }
}

function injectIndexHtml(file) {
  let html = fs.readFileSync(file, "utf8");
  const snippet = `window.__DCI_CUSTOMER_URL__ = ${JSON.stringify(customerUrl)};`;
  if (html.includes("window.__DCI_CUSTOMER_URL__")) {
    html = html.replace(/window\.__DCI_CUSTOMER_URL__\s*=\s*[^;]+;/, snippet);
  } else {
    html = html.replace(
      /<script src="\/static\/js\/dci-mock-auth\.js"><\/script>/,
      `<script>${snippet}</script>\n  <script src="/static/js/dci-mock-auth.js"></script>`,
    );
  }
  // Deep links must load assets from site root, never relative to /user/profile etc.
  if (!/<base\s+href=["']\/["']\s*\/?>/i.test(html)) {
    html = html.replace(/<head>/i, '<head>\n  <base href="/">');
  }
  html = html
    .replace(/(href|src)="\.\/(static\/[^"]+|favicon\.png|overrides\.css)"/g, '$1="/$2"')
    .replace(/(href|src)="(?!\/|https?:|data:)(static\/[^"]+|favicon\.png|overrides\.css)"/g, '$1="/$2"');
  fs.writeFileSync(file, html, "utf8");
}

rm(dest);
copy(src, dest);
injectIndexHtml(path.join(dest, "index.html"));

const spa = spawnSync(
  process.execPath,
  [path.join(__dirname, "spa-fallback.mjs"), dest],
  { stdio: "inherit" },
);
if (spa.status !== 0) process.exit(spa.status || 1);

console.log("built dist from mirror; VITE_CUSTOMER_URL=", customerUrl);
