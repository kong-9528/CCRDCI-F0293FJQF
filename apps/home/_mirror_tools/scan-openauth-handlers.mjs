import fs from "fs";
import path from "path";

const jsDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of fs.readdirSync(jsDir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(path.join(jsDir, f), "utf8");
  if (!t.includes("onOpenAuth")) continue;
  // find handler definitions like function X(i="login")
  const m = t.match(/function \w+\(i="login"\)\{[^}]+\}/g);
  console.log(f, m || "(no default login handler)");
  if (t.includes('"register"') && /value=!0/.test(t)) {
    const snippets = [];
    let from = 0;
    while (snippets.length < 3) {
      const i = t.indexOf('"register"', from);
      if (i < 0) break;
      snippets.push(t.slice(i - 40, i + 50));
      from = i + 10;
    }
    console.log("  register snippets:", snippets);
  }
}
