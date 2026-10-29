import fs from "node:fs";

const specs = [
  {
    f: "apps/ops-dci/mirror/static/css/opus-Duaj6xyj.css",
    p: "opus",
    s: "98fb8121",
  },
  {
    f: "apps/ops-dci/mirror/static/css/soft-BPUiBseB.css",
    p: "soft",
    s: "609bb1c1",
  },
  {
    f: "apps/ops-dci/mirror/static/css/dataset-DmhoyApB.css",
    p: "dataset",
    s: "879bda4b",
  },
];

for (const { f, p, s } of specs) {
  let css = fs.readFileSync(f, "utf8");
  const from = `.${p}-form-row--second[data-v-${s}]{display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:12px;row-gap:0}.${p}-form-row--second .${p}-form-row-fields[data-v-${s}]{display:contents}.${p}-form-row--second[data-v-${s}] .el-form-item{flex:0 0 auto;margin-right:0}.${p}-form-row--second .${p}-form-input[data-v-${s}]{width:200px;max-width:100%;min-width:0}.${p}-form-row--second .${p}-form-date[data-v-${s}]{width:280px;max-width:100%;min-width:0}.${p}-form-actions[data-v-${s}]{display:flex;align-items:center;justify-content:flex-start;gap:12px;padding-bottom:12px;white-space:nowrap;margin-left:0}`;

  const to = `.${p}-form-row--second[data-v-${s}]{display:flex;flex-wrap:nowrap;align-items:flex-start;column-gap:12px;row-gap:0}.${p}-form-row--second .${p}-form-row-fields[data-v-${s}]{display:contents}.${p}-form-row--second[data-v-${s}] .el-form-item{flex:0 0 auto;margin-right:0;max-width:100%}.${p}-form-row--second .${p}-form-input[data-v-${s}]{width:180px;max-width:100%;min-width:0}.${p}-form-row--second .${p}-form-date[data-v-${s}]{width:240px;min-width:180px;max-width:100%;flex:0 1 240px}.${p}-form-row--second[data-v-${s}] .el-form-item:has(.${p}-form-date){flex:0 1 auto;min-width:0}.${p}-form-actions[data-v-${s}]{display:flex;align-items:center;justify-content:flex-start;gap:12px;padding-bottom:12px;white-space:nowrap;margin-left:0;flex:0 0 auto}`;

  if (!css.includes(from)) {
    console.log("MISS", f);
    const i = css.indexOf(`${p}-form-row--second`);
    console.log(css.slice(i, i + 500));
    continue;
  }
  fs.writeFileSync(f, css.replace(from, to), "utf8");
  console.log("ok", f);
}
