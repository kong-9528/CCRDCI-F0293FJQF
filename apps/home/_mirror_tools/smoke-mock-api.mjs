/**
 * Smoke: boot mirror page, exercise __DCI_MOCK_API__ and XHR intercept.
 */
import { chromium } from "playwright";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const vite = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { port: 3920, strictPort: true, host: "127.0.0.1" },
});
await vite.listen(3920);
const url = vite.resolvedUrls?.local?.[0] || "http://127.0.0.1:3920/";
console.log("serving", url);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const leaked = [];
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("/api/v1/dciManage")) leaked.push(u);
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => !!(window.__DCI_MOCK_API__ && window.__DCI_MOCK__), {
  timeout: 30000,
});

const report = await page.evaluate(async () => {
  const api = window.__DCI_MOCK_API__;
  const M = window.__DCI_MOCK__;
  if (!api || !M) return { ok: false, err: "mock globals missing" };

  const checks = [];
  function check(name, body, pred) {
    const pass = !!pred(body);
    checks.push({ name, pass, code: body && body.code, msg: body && body.msg });
  }

  check(
    "login-ok",
    api.handle("POST", "/api/v1/dciManage/login", {
      username: "mayi2",
      password: "Abcd1234",
    }),
    (b) => b.code === 200 && b.data && b.data.token,
  );
  check(
    "login-bad",
    api.handle("POST", "/api/v1/dciManage/login", {
      username: "mayi2",
      password: "x",
    }),
    (b) => b.code === 500,
  );
  check(
    "sms",
    api.handle("POST", "/api/v1/dciManage/sendLoginSmsCode", {}),
    (b) => b.code === 200,
  );
  check(
    "stats",
    api.handle("GET", "/api/v1/dciManage/interfaceCall/statistics", null),
    (b) => b.code === 200 && b.data && b.data.totalCount != null,
  );
  check(
    "profile",
    api.handle("GET", "/api/v1/dciManage/system/user/profile", null),
    (b) => b.code === 200 || b.code === 401,
  );

  const xhrResult = await new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/v1/dciManage/getRouters");
    xhr.onload = () => {
      try {
        resolve({ status: xhr.status, body: JSON.parse(xhr.responseText) });
      } catch (e) {
        resolve({ status: xhr.status, err: String(e) });
      }
    };
    xhr.onerror = () => resolve({ err: "network" });
    xhr.send();
  });

  return { ok: true, checks, xhrResult };
});

await browser.close();
await vite.close();

const failed = (report.checks || []).filter((c) => !c.pass);
console.log(JSON.stringify({ report, leaked }, null, 2));
if (
  !report.ok ||
  failed.length ||
  leaked.length ||
  report.xhrResult?.body?.code !== 200
) {
  process.exit(1);
}
console.log("smoke-mock-api: ok");
