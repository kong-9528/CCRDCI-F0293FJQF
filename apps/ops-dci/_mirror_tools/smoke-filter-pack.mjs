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
await page.waitForTimeout(1200);

async function measure(tabName) {
  const tab = page.locator(".el-tabs__item", { hasText: tabName }).first();
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(900);

  const gaps = await page.evaluate(() => {
    const row =
      document.querySelector(".opus-form-row--second") ||
      document.querySelector(".soft-form-row--second") ||
      document.querySelector(".dataset-form-row--second");
    if (!row) return { error: "no second row" };
    const items = [...row.querySelectorAll(".el-form-item, .opus-form-actions, .soft-form-actions, .dataset-form-actions")];
    const boxes = items.map((el) => {
      const r = el.getBoundingClientRect();
      const label = (
        el.querySelector(".el-form-item__label")?.textContent ||
        el.textContent ||
        ""
      )
        .trim()
        .replace(/\s+/g, "")
        .slice(0, 12);
      return { label, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    });
    const gaps = [];
    for (let i = 1; i < boxes.length; i++) {
      gaps.push({
        between: `${boxes[i - 1].label}->${boxes[i].label}`,
        gap: boxes[i].left - boxes[i - 1].right,
      });
    }
    return { boxes, gaps };
  });

  await page.screenshot({
    path: `apps/ops-dci/_mirror_tools/_smoke_pack_${tabName}.png`,
    fullPage: false,
  });
  return { tab: tabName, ...gaps };
}

const results = [
  await measure("作品"),
  await measure("软件"),
  await measure("数据集"),
];
await browser.close();

const maxGap = Math.max(
  ...results.flatMap((r) => (r.gaps || []).map((g) => g.gap)),
  0,
);
const ok = maxGap <= 24; // column-gap 12 + small tolerance
console.log(JSON.stringify({ ok, maxGap, results }, null, 2));
if (!ok) process.exit(1);
