import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3020/";
const OUT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_tech_open_smoke";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  sessionStorage.setItem("dci-mock-key", "yachang");
  document.cookie = "Admin-Token=mock-yachang; path=/";
  sessionStorage.removeItem("dci-tech-apply-store");
});
await page.goto(BASE + "user/profile?tab=open", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);

await page.getByText("申请接入技术服务中心").first().click({ force: true });
await page.waitForTimeout(600);

await page.locator('[data-field="orgName"]').fill("雅昌测试机构");
await page.locator('[data-field="creditCode"]').fill("91440300724726181Q");
await page.locator('[data-field="orgAddress"]').fill("深圳市南山区");
await page.locator('[data-field="invitationCode"]').fill("INVITE001");
await page.locator('[data-field="cooperationField"]').fill("数字版权核验");
await page.locator('[data-field="contractStartDate"]').fill("2026-01-01");
await page.locator('[data-field="contractEndDate"]').fill("2027-12-31");
await page.locator('[data-field="linkName"]').fill("张三");
await page.locator('[data-field="linkPhone"]').fill("13900001111");
const pdfPath = `${OUT}/demo-contract.pdf`;
fs.writeFileSync(pdfPath, "%PDF-1.4 demo");
await page.locator(".tech-file-input").setInputFiles(pdfPath);
await page.waitForTimeout(300);
await page.getByRole("button", { name: "提交申请" }).click({ force: true });
await page.waitForTimeout(800);

const store = await page.evaluate(() => {
  const TS = window.__DCI_TECH_STORE__;
  return {
    status: TS && TS.currentTechStatus(),
    raw: sessionStorage.getItem("dci-tech-apply-store"),
  };
});
console.log("store after submit", store);

// back via button
await page.locator('[data-action="back"]').first().click({ force: true });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/after-back.png`, fullPage: true });
const text = await page.locator(".right-content-card, body").first().innerText();
fs.writeFileSync(`${OUT}/after-back.txt`, text);
console.log(text.match(/技术服务[\s\S]{0,200}/)?.[0]);
console.log("markers", {
  进度: text.includes("查看申请进度"),
  审核中: text.includes("审核中"),
  申请接入: text.includes("申请接入"),
  applyMode: await page.locator(".tech-apply-root").count(),
  listMode: await page.locator(".service-cards-grid").count(),
});

const pinia = await page.evaluate(() => {
  const TS = window.__DCI_TECH_STORE__;
  return { status: TS && TS.currentTechStatus() };
});
console.log("store after back", pinia);

await browser.close();
