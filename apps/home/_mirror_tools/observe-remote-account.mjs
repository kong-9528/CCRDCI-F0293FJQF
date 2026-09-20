import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://8.145.60.215:9020/dci-manage-reg/";
const OUT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_account_obs";
fs.mkdirSync(OUT, { recursive: true });

async function openLogin(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  const loginBtn = page.getByText("登录", { exact: true }).first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await loginBtn.click();
    await page.waitForTimeout(800);
  }
}

async function logoutIfNeeded(page) {
  const avatar = page.locator(".user-avatar-trigger, .el-dropdown").filter({ hasText: /./ }).first();
  // try find user area
  const hasUser = await page.locator(".user-avatar-trigger").count();
  if (hasUser) {
    await page.locator(".user-avatar-trigger").first().click();
    await page.waitForTimeout(400);
    const logout = page.getByText("退出登录");
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await page.waitForTimeout(400);
      const confirm = page.getByRole("button", { name: /确定|确认/ }).first();
      if (await confirm.isVisible().catch(() => false)) await confirm.click();
      await page.waitForTimeout(1000);
    }
  }
}

async function captureUserMenu(page, tag) {
  // click avatar / username area
  const trigger = page.locator(".user-avatar-trigger").first();
  await trigger.click();
  await page.waitForTimeout(500);
  const menu = page.locator(".el-dropdown-menu:visible, .el-popper:visible .el-dropdown-menu").first();
  const items = await page.locator(".el-dropdown-menu:visible .el-dropdown-menu__item, .el-popper:visible li").allInnerTexts();
  const html = await page.locator(".el-dropdown-menu:visible, .el-popper:visible").first().innerHTML().catch(() => "");
  fs.writeFileSync(path.join(OUT, `${tag}-menu.txt`), JSON.stringify({ items, html }, null, 2), "utf8");
  await page.screenshot({ path: path.join(OUT, `${tag}-menu.png`) });
  // close
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  return items;
}

async function captureAccount(page, tag) {
  await page.goto(BASE + "user/profile", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, `${tag}-info.png`), fullPage: true });
  const infoText = await page.locator(".account-center, .user-profile, body").first().innerText();
  fs.writeFileSync(path.join(OUT, `${tag}-info.txt`), infoText, "utf8");

  // open tab
  const openTab = page.getByText("开通管理").first();
  await openTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, `${tag}-open.png`), fullPage: true });
  const openText = await page.locator("body").innerText();
  fs.writeFileSync(path.join(OUT, `${tag}-open.txt`), openText, "utf8");

  // dump key DOM for cards
  const cards = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll(".service-card, .open-card, [class*=service], [class*=open]")];
    return nodes.slice(0, 20).map((n) => ({
      cls: n.className,
      text: n.innerText.slice(0, 300),
    }));
  });
  fs.writeFileSync(path.join(OUT, `${tag}-cards.json`), JSON.stringify(cards, null, 2), "utf8");
}

async function loginPassword(page, user, pass) {
  await openLogin(page);
  // ensure account login tab
  const tab = page.getByText("账号登录").first();
  if (await tab.isVisible().catch(() => false)) await tab.click();
  await page.waitForTimeout(300);
  await page.locator('input[placeholder*="账号"], input[placeholder*="用户"]').first().fill(user);
  await page.locator('input[type="password"], input[placeholder*="密码"]').first().fill(pass);
  // captcha if any
  const captcha = page.locator('input[placeholder*="验证码"]').first();
  if (await captcha.isVisible().catch(() => false)) {
    await captcha.fill("1234");
  }
  await page.getByRole("button", { name: /立即登录|登录/ }).first().click();
  await page.waitForTimeout(2500);
}

async function loginSms(page, phone, code) {
  await openLogin(page);
  const tab = page.getByText("验证码登录").first();
  if (await tab.isVisible().catch(() => false)) await tab.click();
  await page.waitForTimeout(300);
  await page.locator('input[placeholder*="手机"]').first().fill(phone);
  const img = page.locator('input[placeholder*="图形"]').first();
  if (await img.isVisible().catch(() => false)) await img.fill("1234");
  await page.locator('input[placeholder*="短信"], input[placeholder*="验证码"]').last().fill(code);
  // try get sms first if needed
  const send = page.getByText("获取验证码").first();
  if (await send.isVisible().catch(() => false)) {
    await send.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  await page.getByRole("button", { name: /立即登录|登录/ }).first().click();
  await page.waitForTimeout(2500);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (m) => {
    if (m.type() === "error") console.log("ERR", m.text());
  });

  console.log("=== Account1 aaad ===");
  try {
    await loginPassword(page, "aaad", "Abcd1234");
    await page.screenshot({ path: path.join(OUT, "aaad-home.png") });
    const menu1 = await captureUserMenu(page, "aaad");
    console.log("aaad menu", menu1);
    await captureAccount(page, "aaad");
    await logoutIfNeeded(page);
  } catch (e) {
    console.error("aaad fail", e);
    await page.screenshot({ path: path.join(OUT, "aaad-fail.png") });
  }

  console.log("=== Account2 sms ===");
  try {
    await loginSms(page, "13911189963", "123456");
    await page.screenshot({ path: path.join(OUT, "sms-home.png") });
    const menu2 = await captureUserMenu(page, "sms");
    console.log("sms menu", menu2);
    await captureAccount(page, "sms");
  } catch (e) {
    console.error("sms fail", e);
    await page.screenshot({ path: path.join(OUT, "sms-fail.png") });
  }

  await browser.close();
  console.log("DONE", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
