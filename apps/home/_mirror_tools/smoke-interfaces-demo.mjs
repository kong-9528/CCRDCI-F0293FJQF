/**
 * Smoke: interfaces empty (none) vs 4 APIs (configured)
 */
import { chromium } from "playwright";

const base = process.env.HOME_URL || "http://localhost:3020";
const browser = await chromium.launch({ headless: true });

async function visit(mode) {
  const page = await browser.newPage();
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate((m) => {
    const M = window.__DCI_MOCK__;
    M.setSession("mayi2");
    document.cookie =
      "Admin-Token=" + encodeURIComponent(M.tokenFor("mayi2")) + "; path=/; max-age=86400";
    sessionStorage.setItem("dci-rcx-demo-mode", m);
  }, mode);
  await page.goto(base + "/dci/dciapi/index?tab=interfaces", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(1500);
  const dump = await page.evaluate(() => {
    const text = document.body.innerText;
    const names = [
      "实名信息接口",
      "实名信息修改接口",
      "DCI申领数据同步接口",
      "DCI撤销数据同步接口",
    ].filter((n) => text.includes(n));
    const empty = text.includes("暂无已授权接口");
    const panel = !!document.getElementById("dci-rcx-demo-panel");
    return { names, empty, panel, mode: sessionStorage.getItem("dci-rcx-demo-mode") };
  });
  await page.close();
  return dump;
}

const none = await visit("none");
const configured = await visit("configured");
console.log(JSON.stringify({ none, configured }, null, 2));
await browser.close();

const ok =
  none.empty === true &&
  none.names.length === 0 &&
  configured.empty === false &&
  configured.names.length === 4 &&
  configured.panel === true;
if (!ok) process.exit(1);
console.log("PASS");
