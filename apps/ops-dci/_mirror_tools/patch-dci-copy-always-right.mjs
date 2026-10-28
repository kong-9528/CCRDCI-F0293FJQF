/**
 * Wrap DCI码 cell (link + copy) in .dci-code-cell flex row so copy icon
 * stays pinned right while code text truncates with ellipsis.
 */
import fs from "node:fs";

const targets = [
  { file: "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js", el: "m" },
  { file: "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js", el: "m" },
  { file: "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js", el: "m" },
];

for (const t of targets) {
  let s = fs.readFileSync(t.file, "utf8");
  if (s.includes('class:"dci-code-cell"')) {
    console.log("already", t.file);
    continue;
  }

  const marker = 'icon:"CopyDocument",class:"dci-copy-btn"';
  const idx = s.indexOf(marker);
  if (idx < 0) {
    console.log("no copy marker", t.file);
    continue;
  }

  // Outer column default is like: default:d(o=>[ or default:i(t=>[
  // (not the nested default:d(()=>[ of the link)
  const windowStart = Math.max(0, idx - 500);
  const before = s.slice(windowStart, idx);
  const reOuter = /default:(d|i)\((o|t)=>\[/g;
  let match;
  let last = null;
  while ((match = reOuter.exec(before))) last = match;
  if (!last) {
    console.log("no outer default", t.file);
    console.log(before.slice(-200));
    continue;
  }

  const absDef = windowStart + last.index;
  const withCtx = last[1];
  const rowArg = last[2];
  const arrOpen = absDef + last[0].length;

  const endMarker = 'null,8,["onClick"])]';
  const afterBtn = s.indexOf(endMarker, idx);
  if (afterBtn < 0) {
    console.log("no end marker", t.file);
    continue;
  }
  const arrClose = afterBtn + endMarker.length - 1; // ]
  let inner = s.slice(arrOpen, arrClose);
  inner = inner.replace(
    /,style:\{"margin-left":"6px","vertical-align":"middle"\}/,
    "",
  );

  if (s[arrClose + 1] !== ")") {
    console.log("expected ) after ], got", JSON.stringify(s[arrClose + 1]));
    continue;
  }

  const replacement = `default:${withCtx}(${rowArg}=>[${t.el}("div",{class:"dci-code-cell"},[${inner}])])`;
  s = s.slice(0, absDef) + replacement + s.slice(arrClose + 2);
  fs.writeFileSync(t.file, s, "utf8");
  console.log("wrapped", t.file);
  const v = fs.readFileSync(t.file, "utf8");
  const j = v.indexOf("dci-code-cell");
  console.log(v.slice(j - 40, j + 200));
}

const cssRule = `
.dci-code-cell{display:flex;align-items:center;width:100%;min-width:0;gap:4px}
.dci-code-cell>.el-link{flex:1;min-width:0;overflow:hidden;justify-content:flex-start!important}
.dci-code-cell>.el-link .el-link__inner{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
.dci-code-cell>.dci-copy-btn{flex:0 0 auto;margin-left:0!important;padding:0 2px!important;height:auto!important}
.dci-code-cell>.dci-copy-btn .el-icon{font-size:14px;color:#909399}
.dci-code-cell>.dci-copy-btn:hover .el-icon{color:#409eff}
`;

for (const name of ["opus-Duaj6xyj.css", "soft-BPUiBseB.css", "dataset-DmhoyApB.css"]) {
  const f = `apps/ops-dci/mirror/static/css/${name}`;
  let css = fs.readFileSync(f, "utf8");
  if (!css.includes(".dci-code-cell{display:flex")) {
    css += cssRule;
    fs.writeFileSync(f, css, "utf8");
    console.log("css", name);
  } else console.log("css ok", name);
}
console.log("done");
