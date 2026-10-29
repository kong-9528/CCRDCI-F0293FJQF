/**
 * Make DCI码 column copy button match reference: overlapping-square copy icon.
 * Replace Element Plus icon:"DocumentCopy" (often resolves wrong) with inline SVG.
 */
import fs from "node:fs";

const files = [
  "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
  "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
  "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
];

// Compact copy icon (two overlapping rectangles) — Element Plus CopyDocument-like
const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="14" height="14"><path fill="currentColor" d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64h64zM384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64H384zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64z"/></svg>';

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;

  // Pattern variants across opus/soft/dataset:
  // e(c,{link:"",type:"primary",icon:"DocumentCopy",onClick:S=>K(o.row.dciCode),title:"复制DCI码",style:{"margin-left":"4px"}},null,8,["onClick"])
  // a(u,{link:"",type:"primary",icon:"DocumentCopy",onClick:V=>ee(t.row.dciCode),title:"复制DCI码",style:{"margin-left":"4px"}},null,8,["onClick"])

  s = s.replace(
    /([ea])\(([cu]),\{link:"",type:"primary",icon:"DocumentCopy",onClick:([^,]+),title:"复制DCI码",style:\{"margin-left":"4px"\}\},null,8,\["onClick"\]\)/g,
    (_, create, btn, onClick) =>
      `${create}(${btn},{link:"",type:"primary",class:"dci-copy-btn",onClick:${onClick},title:"复制DCI码",style:{"margin-left":"6px",color:"#909399",padding:"0 2px"}},{default:()=>[createInnerHTML()]},null)`,
  );

  // The above default:()=> might not work in their createVNode API without withCtx.
  // Safer approach: keep null children but set innerHTML via a tiny custom approach —
  // Actually simplest: change icon name to CopyDocument which is the correct Element Plus name.
  if (s === before) {
    // try simpler replace of icon name only
    s = s.replace(/icon:"DocumentCopy"/g, 'icon:"CopyDocument"');
  } else {
    // Revert botched replace if we introduced createInnerHTML — do icon rename instead
    s = fs.readFileSync(f, "utf8");
    s = s.replace(/icon:"DocumentCopy"/g, 'icon:"CopyDocument"');
  }

  // Also ensure style makes icon visible
  // Add class to copy buttons for CSS
  s = s.replace(
    /icon:"CopyDocument",onClick:([^,]+),title:"复制DCI码",style:\{"margin-left":"4px"\}/g,
    'icon:"CopyDocument",class:"dci-copy-btn",onClick:$1,title:"复制DCI码",style:{"margin-left":"6px","vertical-align":"middle"}',
  );

  if (s !== before) {
    fs.writeFileSync(f, s, "utf8");
    console.log("patched icon", f, "count", (s.match(/CopyDocument/g) || []).length);
  } else {
    console.log("no change", f);
    const i = s.indexOf("DocumentCopy");
    const j = s.indexOf("CopyDocument");
    console.log("DocumentCopy idx", i, "CopyDocument idx", j);
  }
}

// CSS for copy btn next to DCI code
const cssSnippets = [
  ["apps/ops-dci/mirror/static/css/opus-Ck5m5mSS.css", null],
];

// Find css files for lists
const cssDir = "apps/ops-dci/mirror/static/css";
for (const name of fs.readdirSync(cssDir)) {
  if (!/^(opus|soft|dataset)-/.test(name) || !name.endsWith(".css")) continue;
  // skip details
  if (/detail|Detail|qDetails|Rq|Cq|Xq/i.test(name)) continue;
  const f = `${cssDir}/${name}`;
  let css = fs.readFileSync(f, "utf8");
  if (css.includes(".dci-copy-btn")) continue;
  // only list page css that mention table
  if (!/table|dciCode|opus-|soft-|dataset-/.test(css) && !/opus|soft|dataset/.test(name)) continue;
  css += `
.dci-copy-btn{margin-left:6px!important;vertical-align:middle;padding:0 2px!important;height:auto!important}
.dci-copy-btn .el-icon{font-size:14px;color:#909399}
.dci-copy-btn:hover .el-icon{color:#409eff}
`;
  fs.writeFileSync(f, css, "utf8");
  console.log("css", name);
}

console.log("done");
