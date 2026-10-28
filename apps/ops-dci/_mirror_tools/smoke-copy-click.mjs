import { chromium } from "playwright";

const base = process.env.OPS_DCI_URL || "http://localhost:3030";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.grantPermissions(["clipboard-read", "clipboard-write"]);
const page = await context.newPage();

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

const code = await page.evaluate(() => {
  const link = document.querySelector(".el-table__body tr td:nth-child(3) .el-link__inner");
  return (link?.textContent || "").trim();
});

await page.locator('button[title="复制DCI码"]').first().click();
await page.waitForTimeout(800);

const toast = await page.evaluate(() =>
  [...document.querySelectorAll(".el-message")].map((n) => n.textContent).join(" "),
);
let clip = "";
try {
  clip = await page.evaluate(() => navigator.clipboard.readText());
} catch (e) {
  clip = "(clipboard read blocked: " + e.message + ")";
}

const iconOk = await page.evaluate(() => {
  const btn = document.querySelector('button[title="复制DCI码"]');
  const paths = [...(btn?.querySelectorAll("path") || [])];
  return paths.length >= 2; // CopyDocument has 2 paths
});

await browser.close();
console.log(
  JSON.stringify(
    {
      ok: iconOk && toast.includes("复制") && (!!clip ? clip === code || clip.startsWith("DCI:") : true),
      code,
      clip,
      toast: toast.slice(0, 80),
      iconOk,
    },
    null,
    2,
  ),
);
