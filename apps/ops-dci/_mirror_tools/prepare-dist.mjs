/**
 * Copy mirror/ → dist/ for static deploy (no bundling; assets already built).
 * Public / SSO URLs come from VITE_PUBLIC_URL and VITE_SSO_URL
 * (deploy platform or gitignored .env.local).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const src = path.join(appRoot, "mirror");
const dest = path.join(appRoot, "dist");
const env = loadEnv("production", appRoot, "VITE_");
const publicUrl = (env.VITE_PUBLIC_URL || "http://localhost:3030").replace(/\/$/, "");
const ssoUrl = (env.VITE_SSO_URL || "http://localhost:3003").replace(/\/$/, "");

function rm(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    if (name === "_mirror-meta.json") continue;
    const a = path.join(from, name);
    const b = path.join(to, name);
    const st = fs.statSync(a);
    if (st.isDirectory()) copy(a, b);
    else fs.copyFileSync(a, b);
  }
}

function injectIndexHtml(file) {
  let html = fs.readFileSync(file, "utf8");
  const publicSnippet = `window.__OPS_DCI_PUBLIC_URL__ = ${JSON.stringify(publicUrl)};`;
  const ssoSnippet = `window.__OPS_DCI_SSO_URL__ = ${JSON.stringify(ssoUrl)};`;
  if (html.includes("window.__OPS_DCI_PUBLIC_URL__")) {
    html = html.replace(/window\.__OPS_DCI_PUBLIC_URL__\s*=\s*[^;]+;/, publicSnippet);
  }
  if (html.includes("window.__OPS_DCI_SSO_URL__")) {
    html = html.replace(/window\.__OPS_DCI_SSO_URL__\s*=\s*[^;]+;/, ssoSnippet);
  }
  fs.writeFileSync(file, html, "utf8");
}

rm(dest);
copy(src, dest);
injectIndexHtml(path.join(dest, "index.html"));
console.log("built dist from mirror; VITE_PUBLIC_URL=", publicUrl, "VITE_SSO_URL=", ssoUrl);
