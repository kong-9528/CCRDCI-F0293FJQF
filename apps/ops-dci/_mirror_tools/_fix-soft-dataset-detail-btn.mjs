/**
 * Soft/dataset list 详情 buttons are wrapped with v-hasPermi ["dci:codeManage:query"]
 * while opus shows 详情 without that gate — so buttons disappear for mock admin.
 * Remove the permission wrappers around 详情 (and 下载样本 for parity with visible ops).
 */
import fs from "node:fs";

function stripPermiAroundDetail(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  // Pattern around 详情:
  // T((g(),C(u,{link:"",type:"primary",icon:"View",onClick:...},{default:...f("详情"...)}...)),[[M,["dci:codeManage:query"]]])
  // -> bare createVNode without T(...,[[M,...]])

  // More robust: remove `,[[M,["dci:codeManage:query"]]]` that immediately follows the View/详情 button close
  // and unwrap T(( ... )) if present.

  // Step 1: unwrap T((g(),C(...详情...))),[[M,["dci:codeManage:query"]]])
  s = s.replace(
    /T\(\(g\(\),C\(u,\{link:"",type:"primary",icon:"View",onClick:([^}]+)\},\{default:([^)]+)\)\),_:1\},8,\["onClick"\]\)\)\),\[\[M,\["dci:codeManage:query"\]\]\]\)/g,
    (all, onClick, def) =>
      `a(u,{link:"",type:"primary",icon:"View",onClick:${onClick}},{default:${def}),_:1},8,["onClick"])`,
  );

  // dataset uses d( instead of i( for withCtx maybe - try alternate createVNode alias `a`
  // Soft uses: T((g(),C(u,{...View...},{default:i(()=>[...e[12]||(e[12]=[f("详情",-1)])]),_:1},8,["onClick"])),[[M,["dci:codeManage:query"]]])
  s = s.replace(
    /T\(\(g\(\),C\(u,\{link:"",type:"primary",icon:"View",onClick:([^,]+)\},\{default:(i|d)\(\(\)=>\[\.\.\.e\[12\]\|\|\(e\[12\]=\[f\("详情",-1\)\]\)\]\),_:1\},8,\["onClick"\]\)\)\),\[\[M,\["dci:codeManage:query"\]\]\]\)/g,
    (_, onClick, withCtx) =>
      `a(u,{link:"",type:"primary",icon:"View",onClick:${onClick}},{default:${withCtx}(()=>[...e[12]||(e[12]=[f("详情",-1)])]),_:1},8,["onClick"])`,
  );

  // Fallback: just strip the permission directive so T still runs but M is empty / always show
  // If unwrap failed, replace permission key with a permissive no-op by removing directive
  if (s === before) {
    // Broader: remove [[M,["dci:codeManage:query"]]] after View button only
    s = s.replace(
      /(icon:"View",onClick:[^}]+\}[\s\S]{0,180}?8,\["onClick"\]\)\)),\[\[M,\["dci:codeManage:query"\]\]\]\)/g,
      "$1)",
    );
  }

  // Also unwrap T((g(), ...)) leftover if we only removed directive — check for T((g(),C(u,{link:"",type:"primary",icon:"View"
  // Convert T((g(),C(...))) to a(...) when it's the View button
  s = s.replace(
    /T\(\(g\(\),C\(u,\{link:"",type:"primary",icon:"View",onClick:([^}]+)\},\{default:(i|d)\(\(\)=>\[\.\.\.e\[12\]\|\|\(e\[12\]=\[f\("详情",-1\)\]\)\]\),_:1\},8,\["onClick"\]\)\)\)/g,
    (_, onClick, withCtx) =>
      `a(u,{link:"",type:"primary",icon:"View",onClick:${onClick}},{default:${withCtx}(()=>[...e[12]||(e[12]=[f("详情",-1)])]),_:1},8,["onClick"])`,
  );

  if (s !== before) {
    fs.writeFileSync(file, s, "utf8");
    console.log("patched", file);
  } else {
    console.log("NO CHANGE", file);
    // dump snippet for debug
    const i = before.indexOf('icon:"View"');
    console.log(before.slice(i - 20, i + 280));
  }
}

stripPermiAroundDetail("apps/ops-dci/mirror/static/js/soft-D-V6yNun.js");
stripPermiAroundDetail("apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js");
