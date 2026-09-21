import { chromium } from "playwright";

const CUSTOMER = "http://localhost:3002";

async function menuOf(page, user) {
  await page.goto(`${CUSTOMER}/desk?from=home&user=${user}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(600);
  await page.locator(".a-header__user-btn").click();
  await page.waitForTimeout(200);
  const items = await page.locator(".a-header__user-menu [role=menuitem]").allInnerTexts();
  const links = await page.locator(".a-header__user-menu a").evaluateAll((els) =>
    els.map((a) => ({
      text: a.textContent?.trim(),
      href: a.getAttribute("href"),
      target: a.getAttribute("target"),
    })),
  );
  return { items, links };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const mayi1 = await menuOf(page, "mayi1");
const mayi2 = await menuOf(page, "mayi2");
const mayi = await menuOf(page, "mayi");
console.log(JSON.stringify({ mayi1, mayi2, mayi }, null, 2));
const ok =
  mayi1.items.some((t) => t.includes("技术服务中心工作台")) &&
  !mayi1.items.some((t) => t.includes("DCI注册中心工作台")) &&
  !mayi1.items.some((t) => t.includes("申请")) &&
  mayi2.items.some((t) => t.includes("DCI注册中心工作台")) &&
  mayi2.items.some((t) => t.includes("技术服务中心工作台")) &&
  mayi.items.some((t) => t.includes("DCI注册中心工作台")) &&
  !mayi.items.some((t) => t.includes("技术服务中心工作台")) &&
  [...mayi1.links, ...mayi2.links, ...mayi.links].every((l) => !l.target) &&
  mayi2.links.some((l) => l.href?.includes("/dashboard/index") && l.href.includes("user=mayi2") && !l.target);
console.log(ok ? "CUSTOMER MENU OK" : "CUSTOMER MENU FAIL");
await browser.close();
process.exit(ok ? 0 : 2);
