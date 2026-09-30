import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3020/";
const OUT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_tech_open_smoke";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push("console:" + msg.text());
});

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  sessionStorage.setItem("dci-mock-key", "yachang");
  document.cookie = "Admin-Token=mock-yachang; path=/";
  sessionStorage.removeItem("dci-tech-apply-store");
});
await page.goto(BASE + "user/profile?tab=open", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);

await page.getByText("申请接入技术服务中心").first().click({ force: true });
await page.waitForTimeout(500);
await page.locator('[data-field="orgName"]').fill("机构A");
await page.locator('[data-field="creditCode"]').fill("91440300724726181Q");
await page.locator('[data-field="orgAddress"]').fill("地址");
await page.locator('[data-field="invitationCode"]').fill("INV1");
await page.locator('[data-field="cooperationField"]').fill("合作");
await page.locator('[data-field="contractStartDate"]').fill("2026-01-01");
await page.locator('[data-field="contractEndDate"]').fill("2027-12-31");
await page.locator('[data-field="linkName"]').fill("张三");
await page.locator('[data-field="linkPhone"]').fill("13900001111");
fs.writeFileSync(`${OUT}/demo-contract.pdf`, "%PDF-1.4 demo");
await page.locator(".tech-file-input").setInputFiles(`${OUT}/demo-contract.pdf`);
await page.getByRole("button", { name: "提交申请" }).click({ force: true });
await page.waitForTimeout(600);

// Call ge via evaluate? Or click back and capture
await page.locator('[data-action="back"]').first().click({ force: true });
await page.waitForTimeout(1500);

const state = await page.evaluate(() => {
  return {
    path: location.pathname + location.search,
    hasCards: !!document.querySelector(".service-cards-grid"),
    hasTechRoot: !!document.querySelector(".tech-apply-root"),
    openPane: !!document.querySelector(".open-pane, .open-manage-list-wrap"),
    rightText: (document.querySelector(".right-content-card") || document.body).innerText.slice(0, 500),
  };
});
console.log(JSON.stringify({ state, errors }, null, 2));
await page.screenshot({ path: `${OUT}/after-back-err.png`, fullPage: true });
await browser.close();
