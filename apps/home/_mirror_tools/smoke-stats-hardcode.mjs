import { chromium } from "playwright";

const base = "http://localhost:3020";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  const M = window.__DCI_MOCK__;
  M.setSession("mayi2");
  document.cookie =
    "Admin-Token=" + encodeURIComponent(M.tokenFor("mayi2")) + "; path=/; max-age=86400";
});

await page.goto(base + "/dci/api-management/index?tab=statistics", {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(2000);

const dump = await page.evaluate(() => ({
  url: location.href,
  metrics: Array.from(document.querySelectorAll(".metric-value")).map((el) => el.textContent.trim()),
  trends: Array.from(document.querySelectorAll(".trend-num")).map((el) => el.textContent.trim()),
  tag: document.querySelector(".org-tag")?.textContent?.trim() || "",
  title: document.querySelector(".header-title")?.textContent || "",
}));

console.log(JSON.stringify(dump, null, 2));
await browser.close();
