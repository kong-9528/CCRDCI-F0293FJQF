import fs from "fs";
import path from "path";

const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = [];
  if (t.includes("data:image/gif;base64")) hits.push("base64gif");
  if (t.includes("点击刷新")) hits.push("click-refresh");
  if (t.includes('alt:"验证码"')) hits.push("alt-captcha");
  if (t.includes(".img") && t.includes("uuid") && t.includes("验证码"))
    hits.push("img-uuid-label");
  if (t.includes("getCode") || t.includes("/captchaImage") || t.includes("captchaImage"))
    hits.push("api-captcha");
  if (/"data:image\/gif;base64,"\+[a-z]+\.img/.test(t)) hits.push("assign-pattern");
  if (hits.length) {
    console.log(f, hits.join(", "), "bytes", t.length);
    // show assign snippets
    const m = t.match(/.{0,40}data:image\/gif;base64.{0,40}/g);
    if (m) m.slice(0, 3).forEach((s) => console.log("  ", s));
  }
}
