import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

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
  const btn = document.querySelector('button[title="复制DCI码"]');
  if (!btn) return { found: false };
  const r = btn.getBoundingClientRect();
  const svg = btn.querySelector("svg");
  const paths = svg ? [...svg.querySelectorAll("path")].map((p) => p.getAttribute("d")?.slice(0, 40)) : [];
  return {
    found: true,
    w: r.width,
    h: r.height,
    visible: r.width > 0 && r.height > 0,
    html: btn.innerHTML.slice(0, 400),
    paths,
    className: btn.className,
  };
});
console.log(JSON.stringify(info, null, 2));

// crop first DCI cell
const box = await page.evaluate(() => {
  const td = document.querySelector(".el-table__body tr td:nth-child(3)");
  if (!td) return null;
  const r = td.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
if (box) {
  await page.screenshot({
    path: "apps/ops-dci/_mirror_tools/_dci-copy-cell.png",
    clip: {
      x: Math.max(0, box.x - 10),
      y: Math.max(0, box.y - 10),
      width: box.width + 40,
      height: Math.min(box.height * 5 + 40, 400),
    },
  });
}
await page.screenshot({
  path: "apps/ops-dci/_mirror_tools/_dci-copy-full.png",
  fullPage: false,
});
await browser.close();
console.log("screenshots saved");
