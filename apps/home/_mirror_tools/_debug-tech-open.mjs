import { chromium } from "playwright";
import fs from "fs";

const OUT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_tech_open_smoke";
fs.mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto("http://localhost:3020/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.getByText("登录", { exact: true }).first().click({ force: true });
  await page.waitForTimeout(600);
  await page.getByText("账号登录").first().click({ force: true }).catch(() => {});
  await page.locator('input[placeholder*="账号"]').first().fill("yachang");
  await page.locator('input[placeholder*="密码"]').first().fill("Abcd1234");
  const cap = page.locator('input[placeholder*="验证码"]').first();
  if (await cap.count()) await cap.fill("1234");
  await page.locator("button.login-main-btn").filter({ hasText: /立即登录/ }).first().click({ force: true });
  await page.waitForTimeout(2000);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await login(page);
console.log("avatar", await page.locator(".user-avatar-trigger").count());
await page.goto("http://localhost:3020/user/profile?tab=open", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/debug-open.png`, fullPage: true });
const text = await page.locator(".right-content-card, body").first().innerText();
fs.writeFileSync(`${OUT}/debug-open.txt`, text);
console.log("--- open text slice ---");
console.log(text.slice(0, 1500));
console.log("--- markers ---");
for (const k of ["申请接入", "敬请期待", "开通管理", "技术服务", "申请成为", "未开通", "查看申请"]) {
  console.log(k, text.includes(k));
}
await browser.close();
