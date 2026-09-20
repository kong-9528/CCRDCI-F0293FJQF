import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://8.145.60.215:9020/dci-manage-reg/";
const OUT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_account_obs";

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("dialog", async (d) => d.accept().catch(() => {}));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1000);

  // clear cookies for clean login
  await page.context().clearCookies();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.getByText("登录", { exact: true }).first().click();
  await page.waitForTimeout(800);
  await page.getByText("账号登录").first().click().catch(() => {});
  await page.waitForTimeout(300);

  // fill
  const inputs = page.locator(".el-dialog input, .auth-card-body input, input");
  // try placeholders
  await page.locator('input[placeholder*="账号"]').first().fill("aaad");
  await page.locator('input[placeholder*="密码"]').first().fill("Abcd1234");
  const cap = page.locator('input[placeholder*="验证码"]').first();
  if (await cap.count()) await cap.fill("1234");

  await page.screenshot({ path: path.join(OUT, "aaad-before-login.png") });
  await page.getByRole("button", { name: /立即登录/ }).first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, "aaad-after-login.png") });

  // slider?
  const slider = page.locator(".yidun, .slider, text=向右滑动").first();
  if (await slider.isVisible().catch(() => false)) {
    fs.writeFileSync(path.join(OUT, "aaad-needs-slider.txt"), "yes");
  }

  const body = await page.locator("body").innerText();
  fs.writeFileSync(path.join(OUT, "aaad-body.txt"), body.slice(0, 3000));

  // find any logged-in indicator
  const candidates = await page.evaluate(() => {
    const texts = [...document.querySelectorAll("a,span,button,div")]
      .map((e) => e.textContent?.trim())
      .filter((t) => t && /aaad|退出|账号中心|登录/.test(t))
      .slice(0, 40);
    return {
      texts,
      avatar: !!document.querySelector(".user-avatar-trigger"),
      classes: [...document.querySelectorAll("[class*=avatar],[class*=user]")]
        .slice(0, 15)
        .map((e) => e.className),
    };
  });
  fs.writeFileSync(path.join(OUT, "aaad-dom.json"), JSON.stringify(candidates, null, 2));
  console.log(candidates);

  // if logged in, go profile
  if (candidates.avatar || candidates.texts.some((t) => t.includes("aaad"))) {
    await page.goto(BASE + "user/profile?tab=open", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, "aaad-open2.png"), fullPage: true });
    // menu
    await page.locator(".user-avatar-trigger").click();
    await page.waitForTimeout(500);
    const items = await page.locator(".el-dropdown-menu:visible li, .el-dropdown-menu:visible .el-dropdown-menu__item").allInnerTexts();
    console.log("menu", items);
    fs.writeFileSync(path.join(OUT, "aaad-menu2.txt"), items.join("\n"));
    await page.screenshot({ path: path.join(OUT, "aaad-menu2.png") });
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
