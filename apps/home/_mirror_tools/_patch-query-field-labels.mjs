import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = path.join(root, "mirror/static/js/index-BZ7-YeMc.js");
const indexHtml = path.join(root, "mirror/index.html");

const original = fs.readFileSync(page, "utf8");
let s = original;

function fail(msg) {
  fs.writeFileSync(page, original);
  throw new Error(msg);
}

const assetFrom =
  'function __assetMeta(l){const t=String((l&&l.assetType)||"work");if(t==="software")return{nameLabel:"软件名称",typeLabel:"软件分类"};if(t==="data")return{nameLabel:"数据名称",typeLabel:"数据类型"};return{nameLabel:"作品名称",typeLabel:"作品类型"}}';
const assetTo =
  'function __assetMeta(l){const t=String((l&&l.assetType)||"work");if(t==="software")return{nameLabel:"软件名称",typeLabel:"软件分类"};if(t==="data")return{nameLabel:"数据名称",typeLabel:"作品类别"};return{nameLabel:"作品名称",typeLabel:"作品类别"}}';

if (s.includes('typeLabel:"作品类别"}') && s.includes('label:"DCI申领时间"')) {
  console.log("page labels already patched");
} else {
  if (!s.includes(assetFrom) && !s.includes('typeLabel:"作品类型"}')) {
    // maybe partially patched
    if (!s.includes('return{nameLabel:"作品名称",typeLabel:"作品类别"}')) {
      fail("assetMeta anchor missing");
    }
  } else if (s.includes(assetFrom)) {
    s = s.replace(assetFrom, assetTo);
  } else {
    s = s.replace(
      'return{nameLabel:"作品名称",typeLabel:"作品类型"}',
      'return{nameLabel:"作品名称",typeLabel:"作品类别"}',
    );
    s = s.replace(
      'return{nameLabel:"数据名称",typeLabel:"数据类型"}',
      'return{nameLabel:"数据名称",typeLabel:"作品类别"}',
    );
  }

  // Insert datetime formatter before __resolveQueryFields if missing
  if (!s.includes("function __formatDateTime(")) {
    const marker = "function __resolveQueryFields(l){";
    if (!s.includes(marker)) fail("resolveQueryFields missing");
    const fmt =
      'function __formatDateTime(s){if(!s)return"-";const e=String(s).trim();if(/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/.test(e))return e;if(e.includes("T")){const p=e.replace("T"," ").replace(/Z$/,"").split(".")[0];return p.length>=19?p.slice(0,19):p}if(/^\\d{4}-\\d{2}-\\d{2}$/.test(e))return e+" 00:00:00";if(/^\\d+$/.test(e)){const a=e.length===10?parseInt(e,10)*1e3:parseInt(e,10),d=new Date(a);if(!isNaN(d.getTime())){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0"),hh=String(d.getHours()).padStart(2,"0"),mm=String(d.getMinutes()).padStart(2,"0"),ss=String(d.getSeconds()).padStart(2,"0");return`${y}-${m}-${day} ${hh}:${mm}:${ss}`}}return e}';
    s = s.replace(marker, fmt + marker);
  }

  const resolveFrom =
    '{label:"DCI分配日期",value:V(l.dciApplyTime)}';
  const resolveTo =
    '{label:"DCI申领时间",value:__formatDateTime(l.dciApplyTime)}';
  if (s.includes(resolveFrom)) {
    s = s.replace(resolveFrom, resolveTo);
  } else if (!s.includes(resolveTo)) {
    fail("DCI分配日期 fallback not found");
  }

  // Also rename any remaining 作品类型 string literals in this query chunk helpers
  s = s.replaceAll('typeLabel:"作品类型"', 'typeLabel:"作品类别"');
  s = s.replaceAll('label:"DCI分配日期"', 'label:"DCI申领时间"');
}

fs.writeFileSync(page, s);
const check = spawnSync(process.execPath, ["--check", page], { encoding: "utf8" });
if (check.status !== 0) {
  console.error(check.stderr);
  fail("syntax error");
}

let h = fs.readFileSync(indexHtml, "utf8");
h = h.replace(
  /dci-query-mock-catalog\.js\?v=[^"]+/,
  "dci-query-mock-catalog.js?v=dci-fields-20261116",
);
fs.writeFileSync(indexHtml, h);
console.log("OK");
