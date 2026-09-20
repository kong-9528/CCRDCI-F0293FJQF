import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3020/";
const jsPath =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";

async function main() {
  const disk = fs.readFileSync(jsPath, "utf8");
  console.log("disk has debug?", disk.includes("[forgot] back"));
  console.log("disk back button?", disk.includes('s("button",{type:"button",class:"forgot-back-link",onClick:Ue}'));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("BROWSER:", m.type(), m.text()));

  // Fetch served JS
  const resp = await page.goto(
    BASE + "static/js/index-BiQimQRe.js",
    { waitUntil: "networkidle" },
  );
  const served = await resp.text();
  console.log("served has debug?", served.includes("[forgot] back"));
  console.log("served len", served.length, "disk len", disk.length);

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  if (!(await page.locator("text=找回密码").first().isVisible())) {
    await page.getByText("登录", { exact: true }).first().click();
    await page.waitForTimeout(800);
  }
  await page.locator("text=找回密码").first().click();
  await page.waitForTimeout(400);
  await page.locator('input[placeholder*="手机"]').fill("13800138000");
  await page.locator('input[placeholder*="图形验证码"]').fill("abcd");
  await page.locator('input[placeholder*="短信验证码"]').fill("123456");
  await page.locator('button:has-text("下一步")').first().click();
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const el = document.querySelector(".forgot-back-link");
    if (!el) return { missing: true };
    // attach native listener to see if click reaches DOM
    let nativeFired = false;
    el.addEventListener("click", () => {
      nativeFired = true;
    });
    el.click();
    return {
      tag: el.tagName,
      html: el.outerHTML,
      nativeFired,
      hasOnclickAttr: el.getAttribute("onclick"),
      vueAttrs: Object.keys(el).filter((k) => k.startsWith("__") || k.includes("vue")),
    };
  });
  console.log("info", info);
  await page.waitForTimeout(300);
  const sub = await page.locator(".reg-subtitle").first().innerText();
  console.log("subtitle after", sub);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
