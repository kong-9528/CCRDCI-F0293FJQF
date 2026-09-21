/**
 * Emit ops-mock-store.js + ensure ops-mock-api.js can resolve captured payloads.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAP = path.join(__dirname, "_ops_capture");
const JS_DIR = path.join(__dirname, "..", "mirror", "static", "js");
const hits = JSON.parse(fs.readFileSync(path.join(CAP, "api-hits.json"), "utf8"));

const store = {};
for (const h of hits) {
  if (h.status < 200 || h.status >= 300) continue;
  if (h.body == null) continue;
  let u;
  try {
    u = new URL(h.url);
  } catch {
    continue;
  }
  let p = u.pathname;
  if (p.startsWith("/dci-manage")) p = p.slice("/dci-manage".length) || "/";
  if (p.includes("captchaImage")) continue;
  const method = (h.method || "GET").toUpperCase();
  const withQ = method + " " + p + (u.search || "");
  const noQ = method + " " + p;
  store[withQ] = h.body;
  store[noQ] = h.body;
}

fs.mkdirSync(JS_DIR, { recursive: true });
const jsonPath = path.join(JS_DIR, "ops-mock-store.json");
fs.writeFileSync(jsonPath, JSON.stringify(store));
const jsPath = path.join(JS_DIR, "ops-mock-store.js");
fs.writeFileSync(
  jsPath,
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n",
);
console.log(
  JSON.stringify(
    {
      entries: Object.keys(store).length,
      bytes: fs.statSync(jsPath).size,
      sampleKeys: Object.keys(store).slice(0, 15),
    },
    null,
    2,
  ),
);
