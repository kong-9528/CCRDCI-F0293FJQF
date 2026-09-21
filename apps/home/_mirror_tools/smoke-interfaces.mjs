/**
 * Smoke: interfaces tab shows the captured business-interface mock.
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

await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  sessionStorage.setItem("dci-mock-key", "mayi2");
  document.cookie = "Admin-Token=mock-mayi2; path=/";
  sessionStorage.setItem("dci-rcx-demo-mode", "full");
});

await page.goto(`${base}/dci/dciapi/index?tab=interfaces`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(1200);
const text = await page.locator("body").innerText();
const names = [
  "实名同步修改接口",
  "实名信息接口",
  "数据同步接口",
  "DCI撤销接口",
].filter((name) => text.includes(name));
const descs = [
  "用于修改权利人（含著作权人）的实名认证信息",
  "权利人（含著作权人）的实名信息接口。",
  "向DCI管理中心同步DCI业务数据。",
  "申请撤销DCI码接口，完成DCI码撤销。",
].filter((d) => text.includes(d));

await browser.close();
await vite.close();

const ok = names.length === 4 && descs.length === 4;
console.log(JSON.stringify({ ok, names, descs, snippet: text.slice(0, 500) }));
if (!ok) process.exit(1);
