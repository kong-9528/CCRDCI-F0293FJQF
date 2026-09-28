const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });

  async function run(mode) {
    const page = await browser.newPage();
    await page.goto("http://localhost:3020/", { waitUntil: "domcontentloaded" });
    await page.evaluate((m) => {
      sessionStorage.setItem("dci-mock-key", "mayi2");
      document.cookie = "Admin-Token=mock-mayi2; path=/";
      sessionStorage.setItem("dci-orginfo-demo-mode", m);
    }, mode);
    await page.goto("http://localhost:3020/dci/org-info/index", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const btn = document.querySelector("button.history-btn");
      if (btn) btn.click();
    });
    await page.waitForTimeout(800);
    const result = await page.evaluate(() => {
      const alert = ((document.querySelector(".status-alert-wrapper") || {})
        .innerText || "")
        .replace(/\s+/g, " ")
        .trim();
      const panel = [
        ...document.querySelectorAll("#dci-orginfo-demo-panel .oi-item"),
      ].map((b) => b.innerText.trim());
      const cards = [...document.querySelectorAll(".el-card")].filter((c) =>
        /已通过|不通过|已撤回|审核中/.test(c.innerText)
      );
      const tags = cards.map((card) => {
        const tag = card.querySelector(".el-tag");
        return tag ? tag.innerText.trim() : "";
      });
      return {
        alert,
        panel,
        tags,
        tip: document.body.innerText.includes("当前无待审变更"),
        wuzhuangtai: document.body.innerText.includes("无状态"),
      };
    });
    await page.close();
    return result;
  }

  const idle = await run("idle");
  const reviewing = await run("reviewing");
  const checks = {
    noIdleBanner: !idle.alert && !idle.tip && !idle.wuzhuangtai,
    panelNormal: idle.panel.includes("正常"),
    idleTags: JSON.stringify(idle.tags) === JSON.stringify(["已通过", "不通过", "已撤回"]),
    reviewBanner: /审核中/.test(reviewing.alert),
    reviewFirst: reviewing.tags[0] === "审核中",
    reviewTags:
      JSON.stringify(reviewing.tags) ===
      JSON.stringify(["审核中", "已通过", "不通过", "已撤回"]),
  };
  console.log(JSON.stringify({ idle, reviewing, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v)) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
