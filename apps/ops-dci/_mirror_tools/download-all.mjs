/**
 * Recursively download http://8.145.60.215:9020/dci-manage/ into apps/ops-dci/mirror
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "mirror");
const ORIGIN = "http://8.145.60.215:9020";
const BASE = "/dci-manage";

const queue = new Set();
const done = new Set();
const failed = [];

function toLocal(urlPath) {
  let p = urlPath.split("?")[0].split("#")[0];
  if (p.startsWith(BASE + "/")) p = p.slice(BASE.length);
  else if (p === BASE) p = "/";
  if (!p.startsWith("/")) p = "/" + p;
  if (p === "/") return path.join(OUT, "index.html");
  return path.join(OUT, p.replace(/^\//, "").replace(/\//g, path.sep));
}

function enqueue(ref, from) {
  if (!ref) return;
  let u = ref.trim().replace(/\\u002F/g, "/");
  if (u.startsWith("data:") || u.startsWith("blob:") || u.startsWith("#")) return;
  if (u.startsWith("//")) u = "http:" + u;
  if (u.startsWith("http")) {
    if (!u.startsWith(ORIGIN + BASE)) return;
    u = u.slice(ORIGIN.length);
  } else if (u.startsWith("./")) {
    u = path.posix.normalize(path.posix.dirname(from) + "/" + u.slice(2));
  } else if (u.startsWith("../")) {
    u = path.posix.normalize(path.posix.dirname(from) + "/" + u);
  } else if (u.startsWith("/")) {
    // ok
  } else if (u.startsWith("static/")) {
    u = BASE + "/" + u;
  } else {
    return;
  }
  if (!u.startsWith(BASE)) return;
  queue.add(u);
}

function extractRefs(text, fromPath) {
  const patterns = [
    /(?:src|href)=["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /["'`]((?:\/dci-manage\/)?static\/(?:js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)[^"'`?]*)["'`]/gi,
    /import\(["']([^"']+)["']\)/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) enqueue(m[1], fromPath);
  }
}

async function download(urlPath) {
  if (done.has(urlPath)) return;
  done.add(urlPath);
  const url = ORIGIN + urlPath;
  const local = toLocal(urlPath);
  fs.mkdirSync(path.dirname(local), { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) {
      failed.push({ urlPath, status: res.status });
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(local, buf);
    const ct = res.headers.get("content-type") || "";
    const isText =
      ct.includes("javascript") ||
      ct.includes("css") ||
      ct.includes("html") ||
      ct.includes("json") ||
      urlPath.endsWith(".js") ||
      urlPath.endsWith(".css") ||
      urlPath.endsWith(".html") ||
      urlPath.endsWith(".json") ||
      urlPath.endsWith(".map");
    if (isText) {
      const text = buf.toString("utf8");
      extractRefs(text, urlPath);
    }
    process.stdout.write(`OK ${urlPath} (${buf.length})\n`);
  } catch (e) {
    failed.push({ urlPath, error: String(e) });
    process.stdout.write(`FAIL ${urlPath} ${e}\n`);
  }
}

fs.mkdirSync(OUT, { recursive: true });
queue.add(BASE + "/");
queue.add(BASE + "/index.html");

while (queue.size) {
  const batch = [...queue];
  queue.clear();
  for (const u of batch) await download(u);
}

fs.writeFileSync(
  path.join(OUT, "_mirror-meta.json"),
  JSON.stringify(
    { origin: ORIGIN, base: BASE, downloaded: [...done], failed },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { downloaded: done.size, failed: failed.length, sampleFailed: failed.slice(0, 10) },
    null,
    2,
  ),
);
