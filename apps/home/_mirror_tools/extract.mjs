import fs from "fs";
import path from "path";

const dir = path.join(process.env.TEMP || "/tmp", "dci-mirror");
const portalJs = fs.readFileSync(path.join(dir, "portal.js"), "utf8");
const texts = [...portalJs.matchAll(/["'`]([\u4e00-\u9fff][^"'`]{0,60})["'`]/g)].map((m) => m[1]);
console.log("=== Chinese snippets ===");
console.log([...new Set(texts)].slice(0, 120).join("\n"));

const assets = [
  ...portalJs.matchAll(/\/dci-manage-reg\/static\/[^"'`)\\s]+/g),
  ...portalJs.matchAll(/static\/(?:png|jpg|jpeg|gif|svg|webp|woff2?|ttf)[^"'`)\\s]*/gi),
].map((m) => m[0]);
console.log("\n=== Assets ===");
console.log([...new Set(assets)].join("\n"));
