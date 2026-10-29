import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector("vite-error-overlay")?.remove());
if (page.url().includes("/login")) {
  await page.locator('input[type="text"]').first().fill("root", { force: true });
  await page.locator('input[type="password"]').first().fill("Ccpc@123456", {
    force: true,
  });
  await page.locator('button:has-text("登")').first().click({ force: true });
  await page.waitForTimeout(1500);
}

await page.goto(`${base}/dciCodeManage/allocation`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

async function checkTab(tabName) {
  const tab = page.locator(".el-tabs__item", { hasText: tabName }).first();
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const details = [...document.querySelectorAll("button, a, .el-button")].filter(
      (b) => (b.textContent || "").includes("详情") && b.offsetParent !== null,
    );
    return {
      detailCount: details.length,
      ops: [...document.querySelectorAll(".el-table__body tr")]
        .slice(0, 3)
        .map((tr) =>
          [...tr.querySelectorAll("button, .el-button")]
            .map((b) => (b.textContent || "").trim())
            .filter(Boolean),
        ),
    };
  });
  let navigated = null;
  if (info.detailCount > 0) {
    await page.locator("button, .el-button").filter({ hasText: "详情" }).first().click();
    await page.waitForTimeout(1500);
    navigated = page.url();
    // go back for next tab
    await page.goto(`${base}/dciCodeManage/allocation`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(800);
  }
  return { tab: tabName, ...info, navigated };
}

const results = [
  await checkTab("作品"),
  await checkTab("软件"),
  await checkTab("数据集"),
];
await browser.close();
const ok = results.every(
  (r) =>
    r.detailCount > 0 &&
    r.navigated &&
    r.navigated.includes("/dci/codeManage-details/"),
);
console.log(JSON.stringify({ ok, results }, null, 2));
if (!ok) process.exit(1);
