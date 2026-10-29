import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

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

const info = await page.evaluate(() => {
  const cell = document.querySelector(".dci-code-cell");
  if (!cell) return { found: false };
  const link = cell.querySelector(".el-link");
  const btn = cell.querySelector(".dci-copy-btn, button[title='复制DCI码']");
  const cr = cell.getBoundingClientRect();
  const br = btn?.getBoundingClientRect();
  const lr = link?.getBoundingClientRect();
  return {
    found: true,
    cellW: cr.width,
    linkW: lr?.width,
    btnW: br?.width,
    btnVisible: !!(br && br.width > 0 && br.height > 0),
    btnRightAligned: br ? Math.abs(br.right - cr.right) < 8 : false,
    linkLeftOfBtn: lr && br ? lr.right <= br.left + 2 : false,
    truncated: link
      ? link.scrollWidth > link.clientWidth + 1 ||
        (link.querySelector(".el-link__inner")?.scrollWidth || 0) >
          (link.querySelector(".el-link__inner")?.clientWidth || 0) + 1
      : false,
    text: (link?.textContent || "").trim().slice(0, 40),
  };
});

const box = await page.evaluate(() => {
  const td = document.querySelector(".el-table__body tr td:nth-child(3)");
  if (!td) return null;
  const r = td.getBoundingClientRect();
  return { x: r.x, y: r.y, width: Math.min(r.width + 20, 400), height: Math.min(r.height * 4 + 30, 280) };
});
if (box) {
  await page.screenshot({
    path: "apps/ops-dci/_mirror_tools/_dci-copy-right.png",
    clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width, height: box.height },
  });
}

await browser.close();
const ok = info.found && info.btnVisible && info.btnRightAligned && info.linkLeftOfBtn;
console.log(JSON.stringify({ ok, info }, null, 2));
if (!ok) process.exit(1);
