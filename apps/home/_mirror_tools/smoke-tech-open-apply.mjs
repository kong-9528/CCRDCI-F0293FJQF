/**
 * Smoke: tech-service-center open-apply from 开通管理.
 */
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3020/";
const OUT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_tech_open_smoke";
fs.mkdirSync(OUT, { recursive: true });

async function login(page, user, pass) {
  // Prefer mock session bootstrap — login button click can hang under headless.
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(
    ({ user }) => {
      try {
        sessionStorage.setItem("dci-mock-key", user);
        document.cookie = "Admin-Token=mock-" + user + "; path=/";
      } catch (e) {}
    },
    { user },
  );
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);
  if ((await page.locator(".user-avatar-trigger").count()) > 0) return;

  // Fallback: UI login
  await page.getByText("登录", { exact: true }).first().click({ force: true });
  await page.waitForTimeout(600);
  await page.getByText("账号登录").first().click({ force: true }).catch(() => {});
  await page.locator('input[placeholder*="账号"]').first().fill(user);
  await page.locator('input[placeholder*="密码"]').first().fill(pass);
  const cap = page.locator('input[placeholder*="验证码"]').first();
  if (await cap.count()) await cap.fill("1234");
  await page.locator("button.login-main-btn").first().evaluate((el) => el.click());
  await page.waitForTimeout(2000);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const log = [];

  await login(page, "yachang", "Abcd1234");
  await page.goto(BASE + "user/profile?tab=open", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/yachang-open.png`, fullPage: true });

  const applyBtn = page.getByText("申请接入技术服务中心").first();
  const visible = await applyBtn.isVisible().catch(() => false);
  log.push({ step: "cta-visible", ok: visible });
  if (!visible) {
    console.log(JSON.stringify(log, null, 2));
    await browser.close();
    process.exit(1);
  }

  await applyBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/yachang-form.png`, fullPage: true });
  const formTitle = await page.getByText("申请接入 DCI®技术服务中心").first().isVisible().catch(() => false);
  log.push({ step: "form-title", ok: formTitle });

  // fill required fields
  await page.locator('[data-field="orgName"]').fill("雅昌测试机构");
  await page.locator('[data-field="creditCode"]').fill("91440300724726181Q");
  await page.locator('[data-field="orgAddress"]').fill("深圳市南山区");
  await page.locator('[data-field="invitationCode"]').fill("INVITE001");
  await page.locator('[data-field="cooperationField"]').fill("数字版权核验");
  await page.locator('[data-field="contractStartDate"]').fill("2026-01-01");
  await page.locator('[data-field="contractEndDate"]').fill("2027-12-31");
  await page.locator('[data-field="linkName"]').fill("张三");
  await page.locator('[data-field="linkPhone"]').fill("13900001111");

  // upload pdf via file input
  const pdfPath = `${OUT}/demo-contract.pdf`;
  fs.writeFileSync(pdfPath, "%PDF-1.4 demo");
  await page.locator(".tech-file-input").setInputFiles(pdfPath);
  await page.waitForTimeout(400);

  await page.getByRole("button", { name: "提交申请" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/yachang-submitted.png`, fullPage: true });
  const reviewing = await page.getByText("审核中").first().isVisible().catch(() => false);
  log.push({ step: "submitted-reviewing", ok: reviewing });

  await page.getByText("历史申请记录").first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/yachang-history.png`, fullPage: true });
  const hist = await page.locator(".tech-hist-card").count();
  log.push({ step: "history-rows", ok: hist >= 1, hist });

  await page.getByRole("button", { name: "关闭" }).click().catch(() => {});
  await page.waitForTimeout(300);
  await page.locator('[data-action="back"]').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/yachang-open-after.png`, fullPage: true });
  const progress = await page.getByText("查看申请进度").first().isVisible().catch(() => false);
  log.push({ step: "open-progress-cta", ok: progress });

  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(log, null, 2));
  console.log(JSON.stringify(log, null, 2));
  const failed = log.some((x) => x.ok === false);
  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
