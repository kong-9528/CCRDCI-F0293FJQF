/**
 * Smoke: floating DCI码权限 demo affects identity + apporg.
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 3945;

const vite = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { port, strictPort: true, host: "127.0.0.1" },
});
await vite.listen(port);
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  sessionStorage.setItem("dci-mock-key", "mayi2");
  document.cookie = "Admin-Token=mock-mayi2; path=/";
  sessionStorage.setItem("dci-rcx-demo-mode", "none");
});

await page.goto(`${base}/dci/info-management/index?tab=identity`, {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector("#dci-rcx-demo-panel", { timeout: 15000 });
await page.waitForTimeout(600);

const identityNone = await page.locator(".custom-descriptions").innerText();

await page.locator('#dci-rcx-demo-panel [data-mode="full"]').click();
await page.waitForTimeout(600);
const identityFull = await page.locator(".custom-descriptions").innerText();

await page.locator(".menu-item", { hasText: "DCI申领平台标识" }).click();
await page.waitForTimeout(800);
const addDisabledFull = await page
  .locator('button:has-text("新增")')
  .first()
  .isDisabled();
const rowsFull = await page.locator(".el-table__body tr").count();

await page.locator('#dci-rcx-demo-panel [data-mode="none"]').click();
await page.waitForTimeout(800);
const addDisabledNone = await page
  .locator('button:has-text("新增")')
  .first()
  .isDisabled();
const rowsNone = await page.locator(".el-table__body tr").count();

// switch back to identity — mode still none
await page.locator(".menu-item", { hasText: "DCI注册中心标识" }).click();
await page.waitForTimeout(600);
const identityBack = await page.locator(".custom-descriptions").innerText();

await browser.close();
await vite.close();

const ok =
  identityNone.includes("审核通过后统一分配标识码") &&
  identityNone.includes("审核通过后统一配置码权限") &&
  identityFull.includes("ORG-MAYI2") &&
  identityFull.includes("作品登记") &&
  identityFull.includes("数据同步") &&
  addDisabledFull === false &&
  rowsFull >= 1 &&
  addDisabledNone === true &&
  rowsNone === 0 &&
  identityBack.includes("审核通过后统一分配标识码");

console.log(
  JSON.stringify(
    {
      identityNone: identityNone.slice(0, 120),
      identityFull: identityFull.slice(0, 160),
      addDisabledFull,
      rowsFull,
      addDisabledNone,
      rowsNone,
      identityBack: identityBack.slice(0, 120),
      ok,
    },
    null,
    2,
  ),
);
process.exit(ok ? 0 : 2);
