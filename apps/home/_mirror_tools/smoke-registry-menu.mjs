/**
 * Smoke: registry navbar (mayi/mayi2) + portal header (all 4 mock users).
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 3941;

const vite = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { port, strictPort: true, host: "127.0.0.1" },
});
await vite.listen(port);
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });

async function login(page, user) {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.evaluate((u) => {
    sessionStorage.setItem("dci-mock-key", u);
    document.cookie = "Admin-Token=mock-" + u + "; path=/";
  }, user);
}

async function portalMenu(user) {
  const page = await browser.newPage();
  await login(page, user);
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".user-avatar-trigger, .avatar-circle", { timeout: 15000 });
  await page.locator(".user-avatar-trigger, .el-dropdown").first().hover();
  await page.waitForSelector(".portal-user-menu", { timeout: 8000 });
  const items = await page.locator(".portal-user-menu .portal-menu-item").allInnerTexts();
  await page.close();
  return items.map((t) => t.replace(/\s+/g, " ").trim());
}

async function registryMenu(user) {
  const page = await browser.newPage();
  await login(page, user);
  await page.goto(`${base}/dashboard/index`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".avatar-container", { timeout: 15000 });
  await page.locator(".avatar-container").hover();
  await page.waitForSelector(".portal-user-menu", { timeout: 8000 });
  const items = await page.locator(".portal-user-menu .portal-menu-item").allInnerTexts();
  await page.close();
  return items.map((t) => t.replace(/\s+/g, " ").trim());
}

const portal = {};
for (const u of ["yachang", "mayi", "mayi1", "mayi2"]) {
  portal[u] = await portalMenu(u);
}
const registry = {
  mayi: await registryMenu("mayi"),
  mayi2: await registryMenu("mayi2"),
};

await browser.close();
await vite.close();

const pHas = (u, t) => portal[u].some((x) => x.includes(t));
const rHas = (u, t) => registry[u].some((x) => x.includes(t));

const ok =
  !pHas("yachang", "注册中心工作台") &&
  !pHas("yachang", "技术服务中心工作台") &&
  pHas("mayi", "DCI注册中心工作台") &&
  !pHas("mayi", "技术服务中心工作台") &&
  !pHas("mayi1", "DCI注册中心工作台") &&
  pHas("mayi1", "技术服务中心工作台") &&
  pHas("mayi2", "DCI注册中心工作台") &&
  pHas("mayi2", "技术服务中心工作台") &&
  rHas("mayi", "DCI注册中心工作台") &&
  rHas("mayi", "当前平台") &&
  !rHas("mayi", "技术服务中心工作台") &&
  !rHas("mayi", "申请接入") &&
  rHas("mayi2", "DCI注册中心工作台") &&
  rHas("mayi2", "当前平台") &&
  rHas("mayi2", "技术服务中心工作台") &&
  !rHas("mayi2", "申请接入");

console.log(JSON.stringify({ portal, registry }, null, 2));
console.log(ok ? "REGISTRY MENU OK" : "REGISTRY MENU FAIL");
process.exit(ok ? 0 : 2);
