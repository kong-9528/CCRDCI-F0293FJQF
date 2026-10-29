import fs from "node:fs";

for (const [file, prefix] of [
  ["apps/ops-dci/mirror/static/js/soft-D-V6yNun.js", "soft"],
  ["apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js", "dataset"],
]) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  // Current broken form after partial strip:
  // T((g(),C(u,{class:"soft-export-btn",loading:h.value,icon:"Download",onClick:oe},{default:i(()=>[...e[11]||(e[11]=[f("导出",-1)])]),_:1},8,["loading"])))
  // Target (match opus):
  // a(u,{class:"soft-export-btn",loading:h.value,icon:"Download",onClick:oe},{default:i(()=>[...e[11]||(e[11]=[f("导出",-1)])]),_:1},8,["loading"])
  const re = new RegExp(
    String.raw`T\(\(g\(\),C\(u,\{class:"${prefix}-export-btn",loading:([^,]+),icon:"Download",onClick:([^,}]+)\},\{default:((?:i|d)\(\(\)=>\[\.\.\.e\[\d+\]\|\|\(e\[\d+\]=\[f\("导出",-1\)\]\)\]\))\),_:1\},8,\["loading"\]\)\)\)+`,
  );
  s = s.replace(
    re,
    (_, loading, onClick, def) =>
      `a(u,{class:"${prefix}-export-btn",loading:${loading},icon:"Download",onClick:${onClick}},{default:${def}),_:1},8,["loading"])`,
  );
  if (s === before) {
    console.log("NO CHANGE", file);
    const i = s.indexOf(`${prefix}-export-btn`);
    console.log(JSON.stringify(s.slice(i - 20, i + 200)));
  } else {
    fs.writeFileSync(file, s, "utf8");
    console.log("unwrapped", file);
    const i = s.indexOf(`${prefix}-export-btn`);
    console.log(s.slice(i - 20, i + 200));
  }
}
