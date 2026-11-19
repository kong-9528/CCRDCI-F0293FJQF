/**
 * /system/log/operlog & /system/log/logininfor:
 * remove 删除 / 清空 / 解锁 toolbar buttons; keep 导出 only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const patches = [
  {
    file: "mirror/static/js/index-D9JsgmZ7.js",
    name: "operlog",
    remove: [
      `t(R,{span:1.5},{default:a(()=>[_((u(),d(v,{type:"danger",plain:"",icon:"Delete",disabled:o(Q),onClick:ae},{default:a(()=>[...l[13]||(l[13]=[m("删除",-1)])]),_:1},8,["disabled"])),[[S,["monitor:operlog:remove"]]])]),_:1}),`,
      `t(R,{span:1.5},{default:a(()=>[_((u(),d(v,{type:"danger",plain:"",icon:"Delete",onClick:ne},{default:a(()=>[...l[14]||(l[14]=[m("清空",-1)])]),_:1})),[[S,["monitor:operlog:remove"]]])]),_:1}),`,
    ],
    keep: `t(R,{span:1.5},{default:a(()=>[_((u(),d(v,{type:"warning",plain:"",icon:"Download",onClick:re},{default:a(()=>[...l[15]||(l[15]=[m("导出",-1)])]),_:1})),[[S,["monitor:operlog:export"]]])]),_:1}),`,
  },
  {
    file: "mirror/static/js/index-gCrIbu-1.js",
    name: "logininfor",
    remove: [
      `t(T,{span:1.5},{default:l(()=>[_((p(),g(b,{type:"danger",plain:"",icon:"Delete",disabled:a(Y),onClick:X},{default:l(()=>[...e[10]||(e[10]=[m("删除",-1)])]),_:1},8,["disabled"])),[[C,["monitor:logininfor:remove"]]])]),_:1}),`,
      `t(T,{span:1.5},{default:l(()=>[_((p(),g(b,{type:"danger",plain:"",icon:"Delete",onClick:Z},{default:l(()=>[...e[11]||(e[11]=[m("清空",-1)])]),_:1})),[[C,["monitor:logininfor:remove"]]])]),_:1}),`,
      `t(T,{span:1.5},{default:l(()=>[_((p(),g(b,{type:"primary",plain:"",icon:"Unlock",disabled:a(P),onClick:ee},{default:l(()=>[...e[12]||(e[12]=[m("解锁",-1)])]),_:1},8,["disabled"])),[[C,["monitor:logininfor:unlock"]]])]),_:1}),`,
    ],
    keep: `t(T,{span:1.5},{default:l(()=>[_((p(),g(b,{type:"warning",plain:"",icon:"Download",onClick:te},{default:l(()=>[...e[13]||(e[13]=[m("导出",-1)])]),_:1})),[[C,["monitor:logininfor:export"]]])]),_:1}),`,
  },
];

for (const p of patches) {
  const abs = path.join(root, p.file);
  let src = fs.readFileSync(abs, "utf8");
  if (!src.includes(p.keep)) {
    throw new Error(`${p.name}: export button snippet not found`);
  }
  for (const chunk of p.remove) {
    if (!src.includes(chunk)) {
      throw new Error(`${p.name}: remove snippet not found:\n${chunk.slice(0, 80)}...`);
    }
    src = src.replace(chunk, "");
  }
  // sanity: removed labels gone from toolbar (still ok if present in confirm strings)
  for (const label of ["删除", "清空", "解锁"]) {
    const toolbarNeedle = `m("${label}"`;
    if (p.name === "operlog" && label === "解锁") continue;
    if (src.includes(toolbarNeedle)) {
      // confirm dialogs still contain Chinese text; only fail if button vnode remains
      const btn = `m("${label}",-1)`;
      if (src.includes(btn)) {
        throw new Error(`${p.name}: button label still present: ${label}`);
      }
    }
  }
  if (!src.includes(p.keep)) {
    throw new Error(`${p.name}: export button lost after patch`);
  }
  fs.writeFileSync(abs, src);
  console.log("patched", p.name, "->", p.file);
}
