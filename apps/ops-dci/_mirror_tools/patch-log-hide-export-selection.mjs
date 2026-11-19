/**
 * /system/log/operlog & /system/log/logininfor:
 * remove 导出 toolbar button and table selection checkboxes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const patches = [
  {
    name: "operlog",
    file: "mirror/static/js/index-D9JsgmZ7.js",
    remove: [
      `t(R,{span:1.5},{default:a(()=>[_((u(),d(v,{type:"warning",plain:"",icon:"Download",onClick:re},{default:a(()=>[...l[15]||(l[15]=[m("导出",-1)])]),_:1})),[[S,["monitor:operlog:export"]]])]),_:1}),`,
      `t(p,{type:"selection",width:"50",align:"center"}),`,
    ],
  },
  {
    name: "logininfor",
    file: "mirror/static/js/index-gCrIbu-1.js",
    remove: [
      `t(T,{span:1.5},{default:l(()=>[_((p(),g(b,{type:"warning",plain:"",icon:"Download",onClick:te},{default:l(()=>[...e[13]||(e[13]=[m("导出",-1)])]),_:1})),[[C,["monitor:logininfor:export"]]])]),_:1}),`,
      `t(d,{type:"selection",width:"55",align:"center"}),`,
    ],
  },
];

for (const p of patches) {
  const abs = path.join(root, p.file);
  let src = fs.readFileSync(abs, "utf8");
  for (const chunk of p.remove) {
    if (!src.includes(chunk)) {
      throw new Error(`${p.name}: snippet not found:\n${chunk}`);
    }
    src = src.replace(chunk, "");
  }
  if (src.includes('m("导出"')) {
    throw new Error(`${p.name}: export button still present`);
  }
  if (src.includes('type:"selection"')) {
    throw new Error(`${p.name}: selection column still present`);
  }
  fs.writeFileSync(abs, src);
  console.log("patched", p.name, "->", p.file);
}
