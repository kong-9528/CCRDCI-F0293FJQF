import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:3020/";
const OUT =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_account_mock_smoke";
fs.mkdirSync(OUT, { recursive: true });

const USERS = [
  {
    key: "yachang",
    user: "yachang",
    pass: "Abcd1234",
    expectMenu: ["账号中心", "退出登录"],
    forbid: ["DCI注册中心工作台", "技术服务中心工作台", "申请接入"],
    expectOpened: "暂无",
    expectOpen: ["未开通", "申请成为注册中心", "敬请期待"],
  },
  {
    key: "mayi",
    user: "mayi",
    pass: "Abcd1234",
    expectMenu: ["账号中心", "DCI注册中心工作台", "退出登录"],
    forbid: ["技术服务中心工作台", "申请接入"],
    expectOpened: "DCI注册中心",
    expectOpen: ["已通过", "进入工作台", "敬请期待"],
    noApplyTech: true,
  },
  {
    key: "mayi1",
    user: "mayi1",
    pass: "Abcd1234",
    expectMenu: ["账号中心", "技术服务中心工作台", "退出登录"],
    forbid: ["DCI注册中心工作台", "申请接入"],
    expectOpened: "技术服务中心",
    expectOpen: ["未开通", "已通过", "进入工作台"],
    noApplyTech: true,
  },
  {
    key: "mayi2",
    user: "mayi2",
    pass: "Abcd1234",
    expectMenu: ["账号中心", "DCI注册中心工作台", "技术服务中心工作台", "退出登录"],
    forbid: ["申请接入"],
    expectOpened: "DCI注册中心",
    expectOpen: ["已通过", "进入工作台"],
    noApplyTech: true,
  },
];

async function login(page, user, pass) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
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
  await page.getByText("登录", { exact: true }).first().click();
  await page.waitForTimeout(600);
  await page.getByText("账号登录").first().click().catch(() => {});
  await page.locator('input[placeholder*="账号"]').first().fill(user);
  await page.locator('input[placeholder*="密码"]').first().fill(pass);
  const cap = page.locator('input[placeholder*="验证码"]').first();
  if (await cap.count()) await cap.fill("1234");
  await page.getByRole("button", { name: /立即登录/ }).first().click();
  await page.waitForTimeout(2000);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  for (const u of USERS) {
    console.log("===", u.key);
    try {
      await login(page, u.user, u.pass);
      const loggedIn = (await page.locator(".user-avatar-trigger").count()) > 0;
      if (!loggedIn) {
        await page.screenshot({ path: path.join(OUT, `${u.key}-login-fail.png`) });
        results.push({ key: u.key, ok: false, err: "not logged in" });
        continue;
      }

      await page.locator(".user-avatar-trigger").click();
      await page.waitForTimeout(400);
      const menu = (
        await page
          .locator(
            ".el-dropdown-menu:visible .el-dropdown-menu__item, .portal-user-menu .el-dropdown-menu__item",
          )
          .allInnerTexts()
      )
        .map((s) => s.trim())
        .filter(Boolean);
      await page.screenshot({ path: path.join(OUT, `${u.key}-menu.png`) });
      await page.keyboard.press("Escape");

      await page.goto(BASE + "user/profile?tab=info", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(1200);
      const infoText = await page
        .locator(".right-content-card, .info-pane, body")
        .first()
        .innerText();
      await page.screenshot({ path: path.join(OUT, `${u.key}-info.png`) });

      await page.getByText("开通管理", { exact: true }).first().click();
      await page.waitForTimeout(800);
      const openText = await page
        .locator(".right-content-card, body")
        .first()
        .innerText();
      await page.screenshot({ path: path.join(OUT, `${u.key}-open.png`) });

      const menuHas = (label) => menu.some((x) => x.includes(label));
      let menuPass = true;
      for (const m of u.expectMenu) {
        if (!menuHas(m)) menuPass = false;
      }
      for (const m of u.forbid || []) {
        if (menuHas(m)) menuPass = false;
      }

      const openedOk = infoText.includes(u.expectOpened);
      const openOk = u.expectOpen.every((s) => openText.includes(s));
      const ok = loggedIn && menuPass && openedOk && openOk;
      results.push({ key: u.key, ok, menu, openedOk, openOk, menuPass });
      console.log(results[results.length - 1]);
    } catch (e) {
      console.error(u.key, e);
      results.push({ key: u.key, ok: false, err: String(e) });
    }
  }

  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  await browser.close();
  const all = results.every((r) => r.ok);
  console.log(all ? "ALL SMOKE OK" : "SMOKE FAIL", results);
  process.exit(all ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
