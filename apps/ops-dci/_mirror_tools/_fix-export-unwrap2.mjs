import fs from "node:fs";

const fixes = [
  {
    file: "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
    from: `T((g(),C(u,{class:"soft-export-btn",loading:h.value,icon:"Download",onClick:oe},{default:i(()=>[...e[11]||(e[11]=[f("导出",-1)])]),_:1},8,["loading"])))`,
    to: `a(u,{class:"soft-export-btn",loading:h.value,icon:"Download",onClick:oe},{default:i(()=>[...e[11]||(e[11]=[f("导出",-1)])]),_:1},8,["loading"])`,
  },
  {
    file: "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
    from: `T((g(),C(u,{class:"dataset-export-btn",loading:h.value,icon:"Download",onClick:te},{default:d(()=>[...e[11]||(e[11]=[f("导出",-1)])]),_:1},8,["loading"])))`,
    to: `a(u,{class:"dataset-export-btn",loading:h.value,icon:"Download",onClick:te},{default:d(()=>[...e[11]||(e[11]=[f("导出",-1)])]),_:1},8,["loading"])`,
  },
];

for (const { file, from, to } of fixes) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes(from)) {
    console.log("MISSING", file);
    const i = s.indexOf("export-btn");
    console.log(s.slice(i - 25, i + 200));
    continue;
  }
  s = s.replace(from, to);
  fs.writeFileSync(file, s, "utf8");
  console.log("ok", file);
  console.log(s.slice(s.indexOf("export-btn") - 15, s.indexOf("export-btn") + 180));
}
