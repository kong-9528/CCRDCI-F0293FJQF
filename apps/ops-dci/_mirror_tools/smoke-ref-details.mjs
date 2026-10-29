import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const cases = [
  { path: "/dci/codeManage-details/opusR/12", expect: ["DCI码详情", "原始分配", "作品基本信息", "DCI码：", "作品名称"], entity: "opus" },
  { path: "/dci/codeManage-details/opusC/13", expect: ["授权分配", "授权合同", "转让（许可）方", "原始DCI码"], entity: "opus" },
  { path: "/dci/codeManage-details/opusX/11", expect: ["其他", "作品基本信息", "著作权人信息"], entity: "opus" },
  { path: "/dci/codeManage-details/softR/12", expect: ["软件基本信息", "软件全称", "软件功能与特点", "程序源代码"], entity: "soft" },
  { path: "/dci/codeManage-details/softC/11", expect: ["软件全称", "授权合同", "C码"], entity: "soft" },
  { path: "/dci/codeManage-details/datasetX/50", expect: ["数据集基本信息", "数据集名称", "数据规模"], entity: "dataset" },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message || e)));

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.evaluate(() => document.querySelector("vite-error-overlay")?.remove());
if (page.url().includes("/login")) {
  await page.locator('input[type="text"]').first().fill("root", { force: true });
  await page.locator('input[type="password"]').first().fill("Ccpc@123456", { force: true });
  await page.locator('button:has-text("登")').first().click({ force: true });
  await page.waitForTimeout(1500);
}

const results = [];
for (const c of cases) {
  errors.length = 0;
  await page.goto(`${base}${c.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const info = await page.evaluate((expects) => {
    const text = document.body.innerText || "";
    const dci = [...document.querySelectorAll(".info-item--full, .info-item.full-row")].find(
      (el) => /DCI码/.test(el.textContent || ""),
    );
    let full = false;
    if (dci) {
      const grid = dci.closest(".info-grid");
      const ratio = grid
        ? dci.getBoundingClientRect().width / grid.getBoundingClientRect().width
        : 0;
      full = ratio > 0.8 || getComputedStyle(dci).gridColumn.includes("1 / -1") || getComputedStyle(dci).gridColumn.includes("1/-1");
    }
    return {
      text: text.replace(/\s+/g, " ").slice(0, 500),
      missing: expects.filter((e) => !text.includes(e)),
      hasBack: [...document.querySelectorAll("button")].some((b) =>
        (b.textContent || "").includes("返回"),
      ),
      fullRow: full,
      overlay: !!document.querySelector("vite-error-overlay"),
    };
  }, c.expect);

  let after = null;
  let backOk = false;
  if (info.hasBack) {
    await page.locator('button:has-text("返回")').first().click();
    await page.waitForTimeout(1200);
    after = page.url();
    backOk =
      after.includes("/dciCodeManage/allocation") ||
      after.includes("/dci/codeManage/") ||
      !(await page.evaluate(() =>
        (document.body.innerText || "").includes("404"),
      ));
  }

  const pageErrs = errors.filter((e) => !/favicon|ResizeObserver|Failed to load/i.test(e));
  results.push({
    path: c.path,
    ok: info.missing.length === 0 && info.fullRow && info.hasBack && !info.overlay && pageErrs.length === 0,
    missing: info.missing,
    fullRow: info.fullRow,
    hasBack: info.hasBack,
    after,
    backOk,
    errors: pageErrs,
    snippet: info.text.slice(0, 220),
  });
}

await browser.close();
const ok = results.every((r) => r.ok && r.backOk);
console.log(JSON.stringify({ ok, base, results }, null, 2));
if (!ok) process.exit(1);
