/**
 * Probe ops-dci for failed/network API calls and UI error toasts.
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = 3033;
const OUT = path.join(__dirname, "_probe");
fs.mkdirSync(OUT, { recursive: true });

const vite = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { port, strictPort: true, host: "127.0.0.1" },
});
await vite.listen(port);
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const failed = [];
const apiCalls = [];
const pageErrors = [];
const consoleErrors = [];

page.on("pageerror", (e) => pageErrors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("requestfailed", (req) => {
  failed.push({ url: req.url(), error: req.failure()?.errorText });
});
page.on("response", async (res) => {
  const url = res.url();
  if (!url.includes("/api/")) return;
  apiCalls.push({ url, status: res.status(), from: "response" });
});

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.locator('input[type="text"]').first().fill("root");
await page.locator('input[type="password"]').first().fill("Ccpc@123456");
const code = page.locator('input[placeholder*="验证"]');
if ((await code.count()) && (await code.first().isVisible().catch(() => false))) {
  await code.first().fill("0");
}
await page.locator('button:has-text("登")').first().click();
await page.waitForTimeout(2000);

const menuPaths = [
  "/index",
  "/system/user",
  "/system/role",
  "/system/log/operlog",
  "/system/log/logininfor",
  "/system/invitationCode",
  "/system/busPort/BusinessInterfaceManage",
  "/system/busPort/InterfaceCallQuery",
  "/registrOrg/pending",
  "/registrOrg/my",
  "/registrOrg/all",
  "/dci/stat/code",
  "/dci/stat/org",
  "/dci/stat/ownerStat",
  "/dci/stat/related",
  "/dciCodeManage/query",
  "/dciCodeManage/allocation",
  "/dciCodeManage/owner",
  "/contentManag/bizConsult",
  "/contentManag/account",
];

const pageReports = [];
for (const p of menuPaths) {
  const beforeFail = failed.length;
  const beforeConsole = consoleErrors.length;
  await page.goto(`${base}${p}`, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => {
    pageReports.push({ path: p, navError: String(e) });
  });
  await page.waitForTimeout(1800);
  // collect visible error messages
  const texts = await page.evaluate(() => {
    const msgs = [];
    document.querySelectorAll(".el-message, .el-notification, .el-message-box__message").forEach((el) => {
      const t = (el.textContent || "").trim();
      if (t) msgs.push(t);
    });
    return {
      body: (document.body.innerText || "").slice(0, 500),
      toasts: msgs,
      hasEmpty: !!(document.querySelector(".el-empty") || document.body.innerText.includes("暂无数据")),
    };
  });
  pageReports.push({
    path: p,
    toasts: texts.toasts,
    newFails: failed.slice(beforeFail),
    newConsole: consoleErrors.slice(beforeConsole),
    snippet: texts.body.slice(0, 180),
  });
}

await browser.close();
await vite.close();

const report = {
  failed,
  apiCalls: apiCalls.slice(0, 50),
  apiCallCount: apiCalls.length,
  pageErrors,
  consoleErrors: consoleErrors.slice(0, 40),
  pageReports,
};
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  failed: failed.length,
  apiCalls: apiCalls.length,
  pageErrors: pageErrors.length,
  consoleErrors: consoleErrors.length,
  pagesWithToasts: pageReports.filter((p) => p.toasts?.length).map((p) => ({ path: p.path, toasts: p.toasts })),
  sampleFails: failed.slice(0, 10),
  sampleConsole: consoleErrors.slice(0, 15),
}, null, 2));
