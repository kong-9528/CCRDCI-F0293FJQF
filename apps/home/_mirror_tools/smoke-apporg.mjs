/**
 * Smoke: apporg list, 启停 toggle, and status records.
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 3949;

const vite = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { port, strictPort: true, host: "127.0.0.1" },
});
await vite.listen(port);
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("pageerror", (err) => console.log("PAGEERROR", err.message));

await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  sessionStorage.setItem("dci-mock-key", "mayi2");
  document.cookie = "Admin-Token=mock-mayi2; path=/";
  sessionStorage.setItem("dci-rcx-demo-mode", "full");
});
await page.goto(`${base}/dci/info-management/index?tab=apporg`, {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector(".apporg-status-btn", { timeout: 15000 });
await page.waitForTimeout(500);

const names = await page.locator(".el-table__body tr td:nth-child(2)").allInnerTexts();
const startCount = await page.locator(".apporg-status-btn.is-start").count();
const stopCount = await page.locator(".apporg-status-btn.is-stop").count();
const historyIcons = await page.locator(".apporg-record-btn svg").count();
const statusIcons = await page.locator(".apporg-status-btn svg").count();

await page.locator(".apporg-record-btn").first().click();
await page.waitForSelector(".el-dialog .el-table__body tr", { timeout: 8000 });
const recordText = await page.locator(".el-dialog").innerText();
await page.locator(".el-dialog button").filter({ hasText: "关" }).click();

await browser.close();
await vite.close();

const ok =
  names.length >= 4 &&
  names.some((n) => n.includes("星图")) &&
  startCount >= 1 &&
  stopCount >= 1 &&
  historyIcons >= 4 &&
  statusIcons >= 4 &&
  recordText.includes("已启用") &&
  recordText.includes("已停用");

console.log(JSON.stringify({ names, startCount, stopCount, historyIcons, statusIcons, recordSnippet: recordText.slice(0, 180), ok }, null, 2));
process.exit(ok ? 0 : 2);
