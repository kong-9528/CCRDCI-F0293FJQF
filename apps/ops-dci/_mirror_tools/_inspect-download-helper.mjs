import fs from "node:fs";

const s = fs.readFileSync("apps/ops-dci/mirror/static/js/index-DsYmzmNg.js", "utf8");
// find export of ax
const m = s.match(/export\{[^}]*\bax\b[^}]*\}/);
console.log("export has ax", !!m);
// find ay/ax download util - soft uses ax as me from index
// Search for function that takes url and filename xlsx
const idxs = [];
let i = -1;
while ((i = s.indexOf(".xlsx", i + 1)) >= 0 && idxs.length < 5) idxs.push(i);
console.log(
  "xlsx contexts",
  idxs.map((p) => s.slice(p - 120, p + 80)),
);

// Look near download helpers - often named download or tansParams
const j = s.indexOf("function download");
console.log("download fn", j, j >= 0 ? s.slice(j, j + 400) : "");

// check element plus icons Download exists for soft export
console.log("Download icon", s.includes('name:"Download"'));

// soft table columns for export fields
const soft = fs.readFileSync("apps/ops-dci/mirror/static/js/soft-D-V6yNun.js", "utf8");
const cols = [...soft.matchAll(/e\(s,\{label:"([^"]+)"/g), ...soft.matchAll(/a\(s,\{label:"([^"]+)"/g)].map((x) => x[1]);
console.log("soft table labels approx", [...soft.matchAll(/label:"([^"]+)"/g)].map((x) => x[1]).filter((l) => !["全部","已申领","已撤销","原始分配","授权分配","其他","DCI码","软件名称","著作权人","DCI注册中心","DCI申领平台","关联登记号","状态","码类型","DCI分配时间"].includes(l) || ["DCI码","软件名称","著作权人","DCI注册中心","DCI申领平台","状态","操作","序号"].includes(l)));

const tablePart = soft.slice(soft.indexOf('data:l(Q)'), soft.indexOf('data:l(Q)') + 2000);
console.log("table part labels", [...tablePart.matchAll(/label:"([^"]+)"/g)].map((x) => x[1]));
