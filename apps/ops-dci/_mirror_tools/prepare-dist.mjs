/**
 * Copy mirror/ → dist/ for static deploy (no bundling; assets already built).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const src = path.join(appRoot, "mirror");
const dest = path.join(appRoot, "dist");

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

rm(dest);
copy(src, dest);
console.log("built dist from mirror");
