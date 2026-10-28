import fs from "node:fs";

for (const [name, file] of [
  ["opus", "opus-DCRymxdq.js"],
  ["soft", "soft-D-V6yNun.js"],
  ["dataset", "dataset-cXmRoDti.js"],
]) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${file}`, "utf8");
  console.log("\n====", name, "====");
  for (const label of ["作品类别", "软件分类", "数据集类别", "状态", "码类型", "类别"]) {
    const i = s.indexOf(`label:"${label}"`);
    if (i >= 0) console.log(label, s.slice(i, i + 280));
  }
  console.log("export fn?", /导出/.test(s), /export/i.test(s.slice(0, 5000)));
  const exp = s.indexOf('f("导出"');
  console.log("导出 btn", exp >= 0 ? s.slice(exp - 150, exp + 80) : "NONE");
  const z = s.match(/function Z\([^)]*\)\{[\s\S]{0,200}\}/);
  const oe = s.match(/function oe\([^)]*\)\{[\s\S]{0,200}\}/);
  const te = s.match(/function te\([^)]*\)\{[\s\S]{0,200}\}/);
  console.log("Z", z?.[0]?.slice(0, 180));
  // find export-related
  const m = s.match(/function \w+\(\)\{[^}]*export[^}]*\}/i);
  console.log("export-ish", m?.[0]?.slice(0, 200));
  const m2 = [...s.matchAll(/xlsx|export|导出/g)].slice(0, 8).map((x) => {
    return s.slice(Math.max(0, x.index - 40), x.index + 80);
  });
  console.log(m2.join("\n---\n"));
}

for (const name of fs.readdirSync("apps/ops-dci/mirror/static/css")) {
  if (/^(opus|soft|dataset)-.*\.css$/.test(name) && !/detail|Detail|qDetails|Rq|Cq|Xq/i.test(name)) {
    const css = fs.readFileSync(`apps/ops-dci/mirror/static/css/${name}`, "utf8");
    const hits = [...css.matchAll(/form-input|form-date|select|width:\d+/g)].slice(0, 15);
    console.log("\nCSS", name, hits.map((h) => h[0]));
    if (css.includes("form-input")) {
      const i = css.indexOf("form-input");
      console.log(css.slice(Math.max(0, i - 80), i + 120));
    }
  }
}
