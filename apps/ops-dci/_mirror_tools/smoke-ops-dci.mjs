/**
 * Smoke: login as root and open a few ops-dci pages with mock data.
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 3031;

const vite = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { port, strictPort: true, host: "127.0.0.1" },
});
await vite.listen(port);
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);

await page.locator('input[type="text"], input[placeholder*="账号"], input[placeholder*="用户"]').first().fill("root");
await page.locator('input[type="password"]').first().fill("Ccpc@123456");

// captcha may be hidden when captchaEnabled=false
const code = page.locator('input[placeholder*="验证"]');
if (await code.count()) {
  try {
    if (await code.first().isVisible()) await code.first().fill("0");
  } catch {}
}

await page.locator('button:has-text("登")').first().click();
await page.waitForTimeout(2500);

const afterLogin = page.url();
const body = await page.locator("body").innerText();

// visit user list
await page.goto(`${base}/system/user`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const userText = await page.locator("body").innerText();

await page.goto(`${base}/registrOrg/pending`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const pendingText = await page.locator("body").innerText();

await browser.close();
await vite.close();

const ok =
  !afterLogin.includes("/login") &&
  (body.includes("首页") || body.includes("系统管理") || body.includes("管理员")) &&
  (userText.includes("用户") || userText.length > 80) &&
  pendingText.length > 40;

console.log(
  JSON.stringify(
    {
      ok,
      afterLogin,
      bodySnippet: body.slice(0, 250),
      userSnippet: userText.slice(0, 200),
      pendingSnippet: pendingText.slice(0, 200),
      pageErrors: errors.slice(0, 5),
    },
    null,
    2,
  ),
);
if (!ok) process.exit(1);
