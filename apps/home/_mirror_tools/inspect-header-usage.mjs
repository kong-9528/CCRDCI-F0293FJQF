import fs from "fs";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";

for (const f of ["index-LZ7b_aDw.js", "index-D8JrnKcV.js", "portal-CGcjgAeB.js"]) {
  const t = fs.readFileSync(`${dir}/${f}`, "utf8");
  console.log("\n====", f, "====");
  console.log(t.slice(0, 280));
  // Find P as / a as import from header
  const imp = t.match(/import\{([^}]+)\}from"\.\/index-_fJendd7\.js"/);
  console.log("header import:", imp && imp[0]);
  if (imp) {
    // aliases: P as XX, a as YY
    const aliases = {};
    for (const part of imp[1].split(",")) {
      const m = part.trim().match(/^(\w+)\s+as\s+(\w+)$/);
      if (m) aliases[m[1]] = m[2];
    }
    console.log("aliases", aliases);
    const P = aliases.P;
    const a = aliases.a;
    if (P) {
      const re = new RegExp(`r\\(${P},\\{[^\\}]{0,200}\\}`, "g");
      let m;
      let n = 0;
      while ((m = re.exec(t)) && n < 5) {
        console.log("P call:", m[0]);
        n++;
      }
      // broader: find first use of r(P,
      const i = t.indexOf(`r(${P},`);
      if (i >= 0) console.log("first P context:\n", t.slice(i, i + 280));
    }
    if (a) {
      const i = t.indexOf(`r(${a},`);
      if (i >= 0) console.log("first a (footer) context:\n", t.slice(i, i + 200));
    }
  }
  // Auth dialog
  const ai = t.indexOf("index-BiQimQRe");
  console.log("auth import idx", ai);
  const oi = t.indexOf("openAuth");
  if (oi >= 0) console.log("openAuth:", t.slice(oi - 100, oi + 150));
  const si = t.indexOf('showLogin==="true"');
  if (si >= 0) console.log("showLogin:", t.slice(si - 80, si + 120));
}
