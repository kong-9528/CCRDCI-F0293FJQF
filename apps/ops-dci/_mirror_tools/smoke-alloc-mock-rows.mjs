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

await page.goto(`${base}/dciCodeManage/allocation`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1200);

async function tabInfo(name) {
  const tab = page.locator(".el-tabs__item", { hasText: name }).first();
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(1200);
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll(".el-table__body tbody tr")].filter(
      (tr) => tr.querySelectorAll("td").length > 2,
    );
    return {
      count: rows.length,
      // try to find 码类型 column text if present; else infer from dci code prefix
      codes: rows.map((tr) => {
        const tds = [...tr.querySelectorAll("td")].map((td) =>
          (td.innerText || "").trim().replace(/\s+/g, " "),
        );
        const dci = tds.find((t) => t.startsWith("DCI:")) || "";
        const type =
          dci.includes(":R") || dci.startsWith("DCI:R")
            ? "R"
            : dci.includes(":C") || dci.startsWith("DCI:C")
              ? "C"
              : dci.includes(":X") || dci.startsWith("DCI:X")
                ? "X"
                : "?";
        // better: prefix after DCI:
        const m = dci.match(/^DCI:([RCX])/);
        return {
          dci: dci.slice(0, 36),
          type: m ? m[1] : type,
          name: tds.find((t) => t && !t.startsWith("DCI:") && !/^\d+$/.test(t)) || "",
        };
      }),
    };
  });
}

const results = {
  作品: await tabInfo("作品"),
  软件: await tabInfo("软件"),
  数据集: await tabInfo("数据集"),
};

await page.screenshot({
  path: "apps/ops-dci/_mirror_tools/_smoke_alloc_mock_作品.png",
  fullPage: false,
});

await browser.close();

const opusTypes = new Set(results.作品.codes.map((c) => c.type));
const softTypes = new Set(results.软件.codes.map((c) => c.type));
const dsTypes = new Set(results.数据集.codes.map((c) => c.type));

const ok =
  results.作品.count >= 6 &&
  opusTypes.has("R") &&
  opusTypes.has("C") &&
  opusTypes.has("X") &&
  results.软件.count >= 4 &&
  softTypes.has("R") &&
  softTypes.has("C") &&
  !softTypes.has("X") &&
  results.数据集.count >= 4 &&
  [...dsTypes].every((t) => t === "X");

console.log(
  JSON.stringify(
    {
      ok,
      opusTypes: [...opusTypes],
      softTypes: [...softTypes],
      dsTypes: [...dsTypes],
      results,
    },
    null,
    2,
  ),
);
if (!ok) process.exit(1);
