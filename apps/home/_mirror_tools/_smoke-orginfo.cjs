/**
 * Smoke: org-info idle / reviewing / edit button labels & type options
 */
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) console.log("NAV", f.url());
  });

  await page.goto("http://localhost:3020/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem("dci-mock-key", "mayi2");
    document.cookie = "Admin-Token=mock-mayi2; path=/";
    sessionStorage.setItem("dci-orginfo-demo-mode", "idle");
  });

  await page.goto("http://localhost:3020/dci/org-info/index", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  console.log("url", page.url());
  console.log(
    "body snippet",
    (await page.locator("body").innerText()).slice(0, 400)
  );
  console.log(
    "demo",
    await page.evaluate(() => ({
      demo: typeof window.__DCI_ORGINFO_DEMO__,
      mock: typeof window.__DCI_MOCK__,
      mode: window.__DCI_ORGINFO_DEMO__ && window.__DCI_ORGINFO_DEMO__.getModeId(),
      panel: !!document.getElementById("dci-orginfo-demo-panel"),
      path: location.pathname,
    }))
  );

  const idle = await page.evaluate(() => {
    const alert = document.querySelector(".status-alert-wrapper")?.innerText || "";
    const btns = [...document.querySelectorAll(".submit-action .el-button")].map(
      (b) => b.innerText.trim()
    );
    const labels = [...document.querySelectorAll(".el-form-item__label")].map((l) =>
      l.innerText.trim()
    );
    return {
      alert: alert.replace(/\s+/g, " ").trim(),
      btns,
      labels,
      hasPanel: !!document.getElementById("dci-orginfo-demo-panel"),
    };
  });
  console.log("IDLE", JSON.stringify(idle, null, 2));

  if (!idle.hasPanel) {
    console.error("FAIL: demo panel missing");
    await browser.close();
    process.exit(1);
  }

  await page.click('#dci-orginfo-demo-panel [data-mode="reviewing"]');
  await page.waitForTimeout(1200);
  const reviewing = await page.evaluate(() => {
    const alert = document.querySelector(".status-alert-wrapper")?.innerText || "";
    const btns = [...document.querySelectorAll(".submit-action .el-button")].map(
      (b) => b.innerText.trim()
    );
    return { alert: alert.replace(/\s+/g, " ").trim(), btns };
  });
  console.log("REVIEWING", JSON.stringify(reviewing, null, 2));

  await page.click('#dci-orginfo-demo-panel [data-mode="idle"]');
  await page.waitForTimeout(1200);
  await page.click(".submit-action .el-button");
  await page.waitForTimeout(600);
  const edit = await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".submit-action .el-button")].map(
      (b) => b.innerText.trim()
    );
    return { btns, hasSelect: !!document.querySelector(".el-form .el-select") };
  });
  console.log("EDIT", JSON.stringify(edit, null, 2));

  if (edit.hasSelect) {
    await page.locator(".el-form .el-select").first().click();
    await page.waitForTimeout(400);
    const opts = await page.evaluate(() =>
      [...document.querySelectorAll(".el-select-dropdown__item")]
        .map((i) => i.innerText.trim())
        .filter(Boolean)
    );
    console.log("TYPE_OPTIONS", opts);
  }

  const checks = {
    idleBanner: /无状态/.test(idle.alert),
    idleUpdate: idle.btns.some((b) => b.includes("更新")),
    codeLabel: idle.labels.some((l) => l.includes("DCI注册中心标识码")),
    typeLabel: idle.labels.some((l) => l.includes("DCI注册中心类型")),
    reviewBanner: /审核中/.test(reviewing.alert),
    reviewWithdraw: reviewing.btns.some((b) => b.includes("撤回申请")),
    editSubmit: edit.btns.some((b) => b.includes("提交申请")),
    editCancel: edit.btns.some((b) => b.includes("取消申请")),
    pageErrors: errors.length === 0,
  };
  console.log("CHECKS", checks);
  console.log("PAGE_ERRORS", errors);
  await browser.close();
  if (Object.values(checks).some((v) => !v)) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
