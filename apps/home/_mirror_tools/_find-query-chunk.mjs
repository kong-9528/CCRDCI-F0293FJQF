import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../mirror/static/js");
const entry = fs.readFileSync(path.join(dir, "index-DA8BAxJb.js"), "utf8");
console.log("entry has BZ7:", entry.includes("BZ7-YeMc"));
console.log("entry has classic:", entry.includes("202607012098976446"));

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith(".js")) continue;
  const s = fs.readFileSync(path.join(dir, name), "utf8");
  if (s.includes("例如：DCI") || s.includes("query-hero") || s.includes("BZ7-YeMc")) {
    console.log(
      name,
      "hintClassic=",
      s.includes("202607012098976446"),
      "hintSpring=",
      s.includes("春日写生"),
      "queryHero=",
      s.includes("query-hero"),
    );
  }
}
