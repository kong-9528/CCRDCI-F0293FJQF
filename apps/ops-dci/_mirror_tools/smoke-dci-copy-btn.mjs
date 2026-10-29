import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

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

async function inspect(tab) {
  if (tab) {
    const t = page.locator(".el-tabs__item", { hasText: tab }).first();
    if (await t.count()) await t.click();
    await page.waitForTimeout(1000);
  }
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll(".el-table__body tr")].slice(0, 3);
    return rows.map((tr) => {
      const cells = [...tr.querySelectorAll("td")];
      // DCI col is usually 3rd (checkbox, index, dci)
      const dciTd = cells[2] || cells.find((td) => /DCI:/.test(td.textContent || ""));
      if (!dciTd) return { empty: true };
      const btns = [...dciTd.querySelectorAll("button, .el-button, .el-link, [title*='复制']")];
      const icons = [...dciTd.querySelectorAll("i, svg, .el-icon")];
      return {
        text: (dciTd.innerText || "").replace(/\s+/g, " ").slice(0, 80),
        btnCount: btns.length,
        btnTitles: btns.map((b) => b.getAttribute("title") || b.textContent?.trim()),
        iconCount: icons.length,
        html: dciTd.innerHTML.slice(0, 350),
      };
    });
  });
}

const results = {
  opus: await inspect("作品"),
  soft: await inspect("软件"),
  dataset: await inspect("数据集"),
};
await browser.close();
console.log(JSON.stringify(results, null, 2));
