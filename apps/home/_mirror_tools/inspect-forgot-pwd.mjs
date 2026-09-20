import fs from "fs";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";
for (const f of ["index-BiQimQRe.js", "login-C3yLEQUn.js", "index-CsmZrPeY.js"]) {
  const t = fs.readFileSync(`${dir}/${f}`, "utf8");
  const keys = ["找回密码", "重置密码", "忘记密码", "reset", "forget", "step", "新密码", "确认"];
  const hits = keys.filter((k) => t.includes(k));
  if (hits.length) {
    console.log("\n====", f, hits.join(","));
    for (const k of ["找回密码", "重置密码", "忘记密码", "新密码"]) {
      const i = t.indexOf(k);
      if (i >= 0) console.log(k, "→", t.slice(Math.max(0, i - 60), i + 100).replace(/\s+/g, " "));
    }
  }
}
