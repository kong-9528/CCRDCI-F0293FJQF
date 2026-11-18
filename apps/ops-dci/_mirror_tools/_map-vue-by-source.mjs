import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ops = fs.readFileSync(
  path.join(__dirname, "../mirror/static/js/index-DsYmzmNg.js"),
  "utf8",
);
const liveMod = await import(
  pathToFileURL(
    path.join(__dirname, "_portal_capture/vue.runtime.esm-bundler-BBGdfCsq.js"),
  ).href
);

const exp = ops
  .match(/export\{([^}]+)\}/)[1]
  .split(",")
  .map((p) => {
    const [a, b] = p.split(" as ");
    return { local: a.trim(), exp: (b || a).trim() };
  });
const byLocal = Object.fromEntries(exp.map((x) => [x.local, x.exp]));

function findExport(re, label) {
  const hits = [];
  for (const m of ops.matchAll(re)) {
    const local = m[1];
    hits.push({ local, exp: byLocal[local], sample: m[0].slice(0, 100) });
  }
  console.log(label, hits.slice(0, 5));
  return hits;
}

findExport(
  /function (\w+)\(e\)\{return \w+\(e\)\?e\.value:e\}/g,
  "unref",
);
findExport(
  /function (\w+)\(e,t,n,r,i,a\)\{return \w+\(\w+\(e,t,n,r,i,a,!0\)\)\}/g,
  "createElementBlock",
);
findExport(
  /function (\w+)\(e,t,n,r,i\)\{return \w+\(\w+\(e,t,n,r,i,!0\)\)\}/g,
  "createBlock",
);
findExport(/function (\w+)\(e=!1\)\{\w+\.push\(/g, "openBlock");
findExport(/(\w+)=Symbol\(\"v-fgt\"\)/g, "Fragment-dq");
findExport(/(\w+)=Symbol\(v-fgt\)/g, "Fragment");
findExport(/function (\w+)\(e,t\)\{return \w+\(e\)\?\w+\(\{name:e\.name\},t,\{setup:e\}\):e\}/g, "defineComponent");
findExport(/_withKeys/g, "withKeys-raw");

// Search body snippets from live into ops
const needed = "C,D,Dt,E,O,Q,S,W,Y,Z,_t,an,b,ct,d,q,st,x,y,yt".split(",");
for (const key of needed) {
  const fn = liveMod[key];
  if (typeof fn !== "function") {
    console.log(key, typeof liveMod[key], liveMod[key] && String(liveMod[key]).slice(0, 40));
    continue;
  }
  const body = Function.prototype.toString.call(fn);
  // take unique mid without function name
  const core = body.replace(/^function \w+/, "function").slice(0, 50);
  const idx = ops.indexOf(core.slice(9, 40)); // without "function "
  console.log(
    key,
    "name=",
    fn.name || "?",
    "opsIdx=",
    idx,
    "core=",
    core.slice(0, 60),
  );
}

console.log("--- known ops letter locals ---");
for (const e of "d,e,r,D,G,f,S,o,c,N,T,i,j,l,y,m,t,h,n,k,_,A,F,z,w,U,V,W,X,Y,Z,$,a$,ab,a9".split(
  ",",
)) {
  const hit = exp.find((x) => x.exp === e);
  console.log(e, "<-", hit ? hit.local : "MISSING");
}
