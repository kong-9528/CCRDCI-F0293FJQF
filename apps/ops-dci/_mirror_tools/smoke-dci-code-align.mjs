import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const DCI_RE = /DCI:[A-Z0-9]{9,12}\.156\.[A-Z0-9]+/i;

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

function midLen(code) {
  const m = String(code || "").match(/^DCI:([A-Z0-9]+)\.156\./i);
  return m ? m[1].length : -1;
}

async function openAlloc(tabName) {
  await page.goto(`${base}/dciCodeManage/allocation`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const tab = page.locator(".el-tabs__item", { hasText: tabName }).first();
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(1000);
}

async function checkTab(tabName, sampleIndexes) {
  await openAlloc(tabName);

  const listRows = await page.evaluate((reSrc) => {
    const re = new RegExp(reSrc, "i");
    const trs = [...document.querySelectorAll(".el-table__body tbody tr")].filter(
      (tr) => tr.querySelectorAll("td").length > 2,
    );
    return trs.map((tr, idx) => {
      const text = (tr.innerText || "").replace(/\s+/g, " ");
      const m = text.match(re);
      return { idx, dci: m ? m[0] : "" };
    });
  }, DCI_RE.source);

  const results = [];
  for (const i of sampleIndexes) {
    await openAlloc(tabName);
    const list = listRows[i];
    if (!list?.dci) {
      results.push({ idx: i, ok: false, reason: "no list row" });
      continue;
    }

    const row = page.locator(".el-table__body tbody tr").filter({
      has: page.locator("td"),
    });
    // only data rows with enough cells
    const dataRows = page.locator(".el-table__body tbody tr");
    let target = null;
    const count = await dataRows.count();
    let dataIdx = -1;
    for (let r = 0; r < count; r++) {
      const cells = await dataRows.nth(r).locator("td").count();
      if (cells > 2) dataIdx++;
      if (dataIdx === i) {
        target = dataRows.nth(r);
        break;
      }
    }
    if (!target) {
      results.push({ idx: i, ok: false, reason: "row not found" });
      continue;
    }

    await target.locator('button, a, .el-button').filter({ hasText: "详情" }).first().click({ force: true });
    await page.waitForTimeout(1800);
    await page.waitForURL(/codeManage-details/, { timeout: 5000 }).catch(() => {});

    const detailDci = await page.evaluate((reSrc) => {
      const re = new RegExp(reSrc, "i");
      // Prefer label "DCI码" value cells
      const labels = [...document.querySelectorAll("*")].filter((el) => {
        if (el.children.length > 3) return false;
        const t = (el.textContent || "").replace(/\s+/g, "");
        return t === "DCI码：" || t === "DCI码:";
      });
      for (const lab of labels) {
        const parent = lab.parentElement;
        const blob = (parent?.textContent || "") + " " + (parent?.nextElementSibling?.textContent || "");
        const m = blob.match(re);
        if (m) return m[0];
      }
      const all = document.body.innerText || "";
      const m2 = all.match(re);
      return m2 ? m2[0] : "";
    }, DCI_RE.source);

    results.push({
      idx: i,
      listDci: list.dci,
      detailDci,
      midLen: midLen(list.dci),
      match: list.dci === detailDci,
      midOk: midLen(list.dci) >= 9 && midLen(list.dci) <= 12,
      url: page.url(),
    });
  }
  return {
    tab: tabName,
    listCount: listRows.length,
    listMids: listRows.map((r) => midLen(r.dci)),
    results,
  };
}

const out = [
  await checkTab("作品", [0, 3, 5]),
  await checkTab("软件", [0, 3]),
  await checkTab("数据集", [0, 2]),
];

await browser.close();

const ok = out.every(
  (t) =>
    t.listMids.every((n) => n >= 9 && n <= 12) &&
    t.results.every((r) => r.match && r.midOk),
);

console.log(JSON.stringify({ ok, out }, null, 2));
if (!ok) process.exit(1);
