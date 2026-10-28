import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector("vite-error-overlay")?.remove());
if (page.url().includes("/login")) {
  await page.locator('input[type="text"]').first().fill("root", { force: true });
  await page.locator('input[type="password"]').first().fill("Ccpc@123456", {
    force: true,
  });
  await page.locator('button:has-text("登")').first().click({ force: true });
  await page.waitForTimeout(1200);
}

await page.goto(`${base}/dciCodeManage/allocation`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page
  .locator(".el-table__body tbody tr")
  .nth(0)
  .locator("button, a, .el-button")
  .filter({ hasText: "详情" })
  .first()
  .click({ force: true });
await page.waitForTimeout(1500);

const box = await page.evaluate(() => {
  const el = document.querySelector(".ded-alloc");
  if (!el) return { error: "no .ded-alloc" };
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    paddingLeft: cs.paddingLeft,
    paddingRight: cs.paddingRight,
    left: Math.round(r.left),
    width: Math.round(r.width),
  };
});

await page.screenshot({
  path: "apps/ops-dci/_mirror_tools/_smoke_detail_pad.png",
  fullPage: false,
});
console.log(JSON.stringify(box, null, 2));
await browser.close();
if (!box.paddingLeft || parseFloat(box.paddingLeft) < 12) process.exit(1);
