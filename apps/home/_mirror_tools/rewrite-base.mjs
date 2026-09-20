/**
 * Rewrite absolute /dci-manage-reg prefixes so the mirrored SPA can be served from `/`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIRROR = path.resolve(__dirname, "..", "mirror");
const EXT = new Set([".js", ".css", ".html", ".json", ".map", ".txt"]);

let files = 0;
let bytesTouched = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p);
      continue;
    }
    if (!EXT.has(path.extname(name).toLowerCase())) continue;
    let text = fs.readFileSync(p, "utf8");
    const next = text
      .replaceAll("/dci-manage-reg/", "/")
      .replaceAll('"/dci-manage-reg"', '"/"')
      .replaceAll("'/dci-manage-reg'", "'/'")
      .replaceAll("`/dci-manage-reg`", "`/`");
    if (next !== text) {
      fs.writeFileSync(p, next);
      files++;
      bytesTouched += st.size;
    }
  }
}

walk(MIRROR);
console.log(JSON.stringify({ rewrittenFiles: files, bytesTouched }, null, 2));
