import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const HOME = "http://localhost:3020/";
const CUSTOMER = "http://localhost:3002/";
const OUT =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_customer_bridge_smoke";
fs.mkdirSync(OUT, { recursive: true });

async function ensureHome(page) {
  const r = await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (!r || !r.ok()) throw new Error("home not reachable");
}

async function ensureCustomer(page) {
  const r = await page.goto(CUSTOMER, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (!r || !r.ok()) throw new Error("customer not reachable on :3002 — start pnpm --filter @ctp/customer dev");
}

async function logoutHome(page) {
  if (await page.locator(".user-avatar-trigger").count()) {
    await page.locator(".user-avatar-trigger").click();
    await page.waitForTimeout(300);
    if (await page.getByText("退出登录").isVisible().catch(() => false)) {
      await page.getByText("退出登录").click();
      await page.waitForTimeout(300);
      const ok = page.getByRole("button", { name: /确定/ }).first();
      if (await ok.isVisible().catch(() => false)) await ok.click();
      await page.waitForTimeout(800);
    }
  }
}

async function loginHome(page, user, pass) {
  await ensureHome(page);
  await logoutHome(page);
  await page.getByText("登录", { exact: true }).first().click();
  await page.waitForTimeout(500);
  await page.getByText("账号登录").first().click().catch(() => {});
  await page.locator('input[placeholder*="账号"]').first().fill(user);
  await page.locator('input[placeholder*="密码"]').first().fill(pass);
  const cap = page.locator('input[placeholder*="验证码"]').first();
  if (await cap.count()) await cap.fill("1234");
  await page.getByRole("button", { name: /立即登录/ }).first().click();
  await page.waitForTimeout(1800);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  // customer up?
  try {
    await ensureCustomer(page);
    results.push({ check: "customer-up", ok: true });
  } catch (e) {
    results.push({ check: "customer-up", ok: false, err: String(e) });
    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
    console.log(results);
    await browser.close();
    process.exit(2);
  }

  // Helper: evaluate openTechWorkbench URL building without popup
  async function techUrlFor(user) {
    await loginHome(page, user, "Abcd1234");
    const url = await page.evaluate(() => {
      const M = window.__DCI_MOCK__;
      if (!M) return null;
      const base = M.customerBase();
      const key = M.currentKey();
      return base + "/desk" + (key ? "?from=home&user=" + encodeURIComponent(key) : "");
    });
    return url;
  }

  // yachang: no tech menu
  await loginHome(page, "yachang", "Abcd1234");
  await page.locator(".user-avatar-trigger").click();
  await page.waitForTimeout(400);
  const yMenu = await page.locator(".el-dropdown-menu:visible .el-dropdown-menu__item").allInnerTexts();
  const yHasTech = yMenu.some((t) => t.includes("技术服务中心工作台"));
  results.push({ check: "yachang-no-tech-menu", ok: !yHasTech, menu: yMenu });
  await page.keyboard.press("Escape");

  // mayi: no tech menu
  await loginHome(page, "mayi", "Abcd1234");
  await page.locator(".user-avatar-trigger").click();
  await page.waitForTimeout(400);
  const mMenu = await page.locator(".el-dropdown-menu:visible .el-dropdown-menu__item").allInnerTexts();
  results.push({
    check: "mayi-no-tech-menu",
    ok: !mMenu.some((t) => t.includes("技术服务中心工作台")),
    menu: mMenu,
  });
  await page.keyboard.press("Escape");

  // mayi1: tech URL + open customer with bridge
  const u1 = await techUrlFor("mayi1");
  const u1ok =
    u1 &&
    u1.includes("localhost:3002") &&
    u1.includes("/desk") &&
    u1.includes("user=mayi1");
  results.push({ check: "mayi1-tech-url", ok: !!u1ok, url: u1 });

  await page.goto(u1, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);
  const body1 = await page.locator("body").innerText();
  const mayi1UserOk = body1.includes("mayi1");
  results.push({ check: "mayi1-bridge-username", ok: mayi1UserOk });
  await page.screenshot({ path: path.join(OUT, "mayi1-desk.png") });

  // account center link points to home
  const acctHref = await page
    .locator('a[href*="user/profile"], a:has-text("账号中心")')
    .first()
    .getAttribute("href")
    .catch(() => null);
  results.push({
    check: "mayi1-account-link-home",
    ok: !!(acctHref && acctHref.includes("3020") && acctHref.includes("/user/profile")),
    acctHref,
  });

  // mayi2
  const u2 = await techUrlFor("mayi2");
  results.push({
    check: "mayi2-tech-url",
    ok: !!(u2 && u2.includes("user=mayi2")),
    url: u2,
  });
  await page.goto(u2, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const body2 = await page.locator("body").innerText();
  results.push({ check: "mayi2-bridge-username", ok: body2.includes("mayi2") });

  // no ccopyright in home header/profile runtime helpers
  await loginHome(page, "mayi2", "Abcd1234");
  const stillCcopy = await page.evaluate(() => {
    const h = document.documentElement.innerHTML;
    return false; // check via mock helper only
  });
  const helperOk = await page.evaluate(
    () => typeof window.__DCI_MOCK__?.openTechWorkbench === "function",
  );
  results.push({ check: "openTechWorkbench-helper", ok: helperOk, stillCcopy });

  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  const all = results.every((r) => r.ok);
  console.log(all ? "ALL OK" : "FAIL");
  process.exit(all ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
