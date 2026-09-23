import fs from "fs";

const header =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-_fJendd7.js";
const profile =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js";

for (const [name, p] of [
  ["header", header],
  ["profile", profile],
]) {
  const t = fs.readFileSync(p, "utf8");
  console.log("\n====", name, "len", t.length, "====");
  for (const needle of [
    "账号中心",
    "工作台",
    "申请接入",
    "退出登录",
    "auditStatus",
    "已通过",
    "未开通",
    "进入工作台",
    "申请成为",
    "敬请期待",
    "已开通",
    "注销账号",
    "tech",
    "registry",
    "command",
  ]) {
    const i = t.indexOf(needle);
    console.log(needle, i >= 0 ? "yes@" + i : "NO");
  }
}

// dump header dropdown section
const t = fs.readFileSync(header, "utf8");
const i = t.indexOf("账号中心");
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_header-menu-slice.txt",
  t.slice(Math.max(0, i - 500), i + 1500),
  "utf8",
);
const p = fs.readFileSync(profile, "utf8");
const j = p.indexOf("开通管理");
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_profile-open-slice.txt",
  p.slice(Math.max(0, j - 200), j + 2500),
  "utf8",
);
const k = p.indexOf("已开通");
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_profile-info-slice.txt",
  p.slice(Math.max(0, k - 300), k + 2000),
  "utf8",
);
console.log("wrote slices");
