import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const downloads = [];
page.on("download", async (d) => {
  const p = await d.path().catch(() => null);
  downloads.push({
    suggested: d.suggestedFilename(),
    path: p,
  });
});

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

async function measureSelects() {
  return page.evaluate(() => {
    const items = [...document.querySelectorAll(".el-form-item")];
    const out = [];
    for (const item of items) {
      const label = (item.querySelector(".el-form-item__label")?.textContent || "")
        .trim()
        .replace(/\s+/g, "");
      if (!["作品类别", "状态", "码类型"].includes(label)) continue;
      const sel = item.querySelector(".el-select");
      if (!sel) continue;
      const r = sel.getBoundingClientRect();
      out.push({
        label,
        width: Math.round(r.width),
        className: sel.className,
      });
    }
    return out;
  });
}

async function checkTab(tabName) {
  const tab = page.locator(".el-tabs__item", { hasText: tabName }).first();
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(1200);

  const selects = await measureSelects();
  const exportBtn = page.locator("button, .el-button").filter({ hasText: "导出" });
  const exportVisible =
    (await exportBtn.count()) > 0 && (await exportBtn.first().isVisible());

  let exportOk = false;
  let exportFile = null;
  let exportPreview = null;
  const before = downloads.length;
  if (exportVisible) {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 8000 }).catch(() => null),
      exportBtn.first().click({ force: true }),
    ]);
    await page.waitForTimeout(800);
    if (download) {
      const savePath = `apps/ops-dci/_mirror_tools/_export_${tabName}.xlsx`;
      await download.saveAs(savePath);
      exportFile = savePath;
      const buf = fs.readFileSync(savePath);
      // strip BOM if present
      const text = buf.toString("utf8").replace(/^\uFEFF/, "");
      exportPreview = text.split(/\r?\n/).slice(0, 3);
      exportOk = exportPreview[0]?.includes("DCI码") && exportPreview.length >= 1;
    } else if (downloads.length > before) {
      exportOk = true;
      exportFile = downloads[downloads.length - 1].suggested;
    }
  }

  await page.screenshot({
    path: `apps/ops-dci/_mirror_tools/_smoke_filters_${tabName}.png`,
    fullPage: false,
  });

  return {
    tab: tabName,
    selects,
    exportVisible,
    exportOk,
    exportFile,
    exportPreview,
  };
}

const results = [
  await checkTab("作品"),
  await checkTab("软件"),
  await checkTab("数据集"),
];
await browser.close();

const widthOk = results.every((r) =>
  r.selects.every((s) => {
    if (s.label === "作品类别") return s.width <= 220;
    if (s.label === "状态") return s.width <= 120;
    if (s.label === "码类型") return s.width <= 140;
    return true;
  }),
);
const exportOk = results
  .filter((r) => r.tab !== "作品")
  .every((r) => r.exportVisible && r.exportOk);
// opus already had export; soft/dataset are the focus
const softDs = results.filter((r) => r.tab === "软件" || r.tab === "数据集");

console.log(
  JSON.stringify(
    {
      ok: widthOk && softDs.every((r) => r.exportVisible && r.exportOk),
      widthOk,
      exportOk,
      results,
    },
    null,
    2,
  ),
);
if (!widthOk || !softDs.every((r) => r.exportVisible && r.exportOk)) process.exit(1);
