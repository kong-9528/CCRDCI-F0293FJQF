import { chromium } from "playwright";

const BASE = "http://localhost:3020/";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" || t.includes("[forgot]")) logs.push(m.type() + ": " + t);
  });
  page.on("pageerror", (e) => logs.push("PAGE: " + e.message));

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  // Ensure login modal
  const forgotLink = page.locator("text=找回密码").first();
  if (!(await forgotLink.isVisible().catch(() => false))) {
    await page.getByText("登录", { exact: true }).first().click();
    await page.waitForTimeout(800);
  }
  if (!(await forgotLink.isVisible())) {
    console.log("FAIL: cannot open auth modal");
    await page.screenshot({
      path: "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_smoke-fail.png",
    });
    await browser.close();
    process.exit(1);
  }
  console.log("auth modal open");

  await forgotLink.click();
  await page.waitForTimeout(500);

  const title = (await page.locator(".reg-title").first().innerText()).trim();
  const sub1 = (await page.locator(".reg-subtitle").first().innerText()).trim();
  console.log({ title, sub1 });

  await page.locator('input[placeholder*="手机"]').fill("13800138000");
  await page.locator('input[placeholder*="图形验证码"]').fill("abcd");
  await page.locator('input[placeholder*="短信验证码"]').fill("123456");
  await page.waitForTimeout(300);

  const nextBtn = page.locator('button:has-text("下一步")').first();
  console.log("next disabled?", await nextBtn.isDisabled());
  await nextBtn.click();
  await page.waitForTimeout(600);

  const sub2 = (await page.locator(".reg-subtitle").first().innerText()).trim();
  const hasNewPwd = await page.locator('input[placeholder*="8-12"]').count();
  const hasConfirm = await page.locator('input[placeholder*="再次输入"]').count();
  console.log({ sub2, hasNewPwd, hasConfirm });

  // Back — real click on outside link (Ht handler)
  const back = page.locator(".forgot-back-link").first();
  console.log("back visible?", await back.isVisible(), "count", await page.locator(".forgot-back-link").count());
  await back.click();
  await page.waitForTimeout(600);
  console.log("logs after back", logs);

  const subBack = (await page.locator(".reg-subtitle").first().innerText()).trim();
  const errCount = await page.locator(".el-form-item__error:visible").count();
  const hasNext = await page.locator('button:has-text("下一步")').count();
  console.log({ subBack, errCount, hasNext });

  // Step2 again + reset
  await page.locator('input[placeholder*="手机"]').fill("13800138000");
  await page.locator('input[placeholder*="图形验证码"]').fill("abcd");
  await page.locator('input[placeholder*="短信验证码"]').fill("123456");
  await page.locator('button:has-text("下一步")').first().click();
  await page.waitForTimeout(500);
  await page.locator('input[placeholder*="8-12"]').fill("Abcdef12!");
  await page.locator('input[placeholder*="再次输入"]').fill("Abcdef12!");
  await page.waitForTimeout(300);
  const resetBtn = page.locator('button:has-text("重置密码")').first();
  console.log("reset disabled?", await resetBtn.isDisabled());
  await resetBtn.click();
  await page.waitForTimeout(1000);

  const toast = await page.locator(".el-message__content").allInnerTexts().catch(() => []);
  const loginMode = await page.locator(".is-login-mode").count();
  console.log({ toast, loginMode, logs });

  await page.screenshot({
    path: "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_smoke-forgot.png",
    fullPage: false,
  });
  await browser.close();

  const ok =
    title === "找回密码" &&
    hasNewPwd > 0 &&
    hasConfirm > 0 &&
    subBack.includes("验证") &&
    errCount === 0 &&
    hasNext > 0 &&
    toast.some((t) => t.includes("密码重置成功")) &&
    logs.length === 0;
  console.log(ok ? "SMOKE OK" : "SMOKE FAIL");
  process.exit(ok ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
