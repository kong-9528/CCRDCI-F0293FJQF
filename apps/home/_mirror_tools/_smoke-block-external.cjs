const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const blocked = [];
  page.on("console", (m) => {
    const t = m.text();
    if (/blocked|dci-mock/.test(t)) blocked.push(t);
  });

  await page.goto("http://localhost:3020/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem("dci-mock-key", "mayi2");
    document.cookie = "Admin-Token=mock-mayi2; path=/";
  });
  await page.goto("http://localhost:3020/dci/org-info/index", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(800);

  const r = await page.evaluate(async () => {
    async function post() {
      return fetch("/api/v1/dciManage/dci/regorg/resubmit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "mock-mayi2", orgName: "x" }),
      }).then((res) => res.json());
    }
    const a = await post();
    const b = await post();
    const ext = await fetch("https://www.ccopyright.com.cn/api/ping", {
      method: "GET",
    })
      .then((res) => res.json())
      .catch((e) => ({ err: String(e) }));
    return {
      a,
      b,
      ext,
      mockApi: typeof window.__DCI_MOCK_API__,
    };
  });

  console.log(JSON.stringify({ r, blocked: blocked.slice(0, 8) }, null, 2));

  const ok =
    r.a &&
    r.a.code === 200 &&
    r.b &&
    r.b.code === 200 &&
    r.ext &&
    (r.ext.code === 500 || /阻断|blocked/i.test(JSON.stringify(r.ext)));
  await browser.close();
  if (!ok) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
