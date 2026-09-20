import { chromium } from "playwright";

const BASE = "http://localhost:3020/";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on("console", (m) => logs.push(m.text()));

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
  await page.locator('button:has-text("下一步")').click();
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const el = document.querySelector(".forgot-back-link");
    const vei = el && el._vei;
    return {
      veiKeys: vei ? Object.keys(vei) : null,
      veiClick: !!(vei && vei.onClick),
      // try invoking vue invoker directly
      invokerType: vei && vei.onClick ? typeof vei.onClick.value : null,
    };
  });
  console.log("vei", info);

  // Invoke Vue invoker if present
  const invoked = await page.evaluate(() => {
    const el = document.querySelector(".forgot-back-link");
    const inv = el && el._vei && el._vei.onClick;
    if (inv && inv.value) {
      inv.value(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return "invoked";
    }
    if (inv && typeof inv === "function") {
      inv(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return "invoked-fn";
    }
    return "no-invoker";
  });
  console.log("invoked", invoked);
  await page.waitForTimeout(400);
  console.log("sub", await page.locator(".reg-subtitle").first().innerText());
  console.log("logs", logs.filter((l) => l.includes("forgot") || l.includes("Error")));

  // Also: check how next button's vei looks (working)
  await page.evaluate(() => {
    /* stay on step2 */
  });
  // go back if worked, else check 下一步 vei from step1 after force
  const nextVei = await page.evaluate(() => {
    // if still step2, look at reset button
    const btn = document.querySelector(".login-main-btn");
    const vei = btn && btn._vei;
    return {
      class: btn && btn.className,
      text: btn && btn.textContent,
      veiKeys: vei ? Object.keys(vei) : null,
    };
  });
  console.log("main btn vei", nextVei);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
