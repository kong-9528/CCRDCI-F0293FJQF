/**
 * Smoke: ops SSO ticket entry + ops-dci menu hide + ticket bridge.
 */
import { chromium } from "playwright";
import { createServer as createVite } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "../../..");

function waitPort(port, ms = 20000) {
  const start = Date.now();
  return new Promise(async (resolve, reject) => {
    while (Date.now() - start < ms) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/`);
        if (r) return resolve();
      } catch {}
      await new Promise((r) => setTimeout(r, 300));
    }
    reject(new Error("port timeout " + port));
  });
}

function startApp(filter, port) {
  const child = spawn(
    "pnpm",
    ["--filter", filter, "exec", "vite", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: repo,
      shell: true,
      stdio: "pipe",
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );
  return child;
}

const opsPort = 3011;
const dciPort = 3032;
const opsProc = startApp("@ctp/ops", opsPort);
const dciProc = startApp("@ctp/ops-dci", dciPort);

try {
  await waitPort(dciPort);
  await waitPort(opsPort).catch(() => {});
} catch (e) {
  console.error(e);
}

const browser = await chromium.launch({ headless: true });
const results = {};

// --- ops: with ticket (boot delay ~800ms) ---
{
  const page = await browser.newPage();
  await page.goto(
    `http://127.0.0.1:${opsPort}/dashboard?sso_ticket=sso-u-admin-1&username=admin&displayName=${encodeURIComponent("超级管理员")}`,
    { waitUntil: "domcontentloaded", timeout: 20000 },
  ).catch((e) => {
    results.opsNavError = String(e);
  });
  await page.waitForTimeout(2000);
  const text = await page.locator("body").innerText().catch(() => "");
  results.opsWithTicket = {
    url: page.url(),
    textSnippet: text.slice(0, 200),
    hasAdmin: text.includes("超级管理员"),
    ticketStripped: !page.url().includes("sso_ticket"),
  };
  await page.close();
}

// --- ops-dci: with ticket ---
{
  const page = await browser.newPage();
  await page.goto(
    `http://127.0.0.1:${dciPort}/?sso_ticket=sso-u-admin-1&username=admin&displayName=admin`,
    { waitUntil: "domcontentloaded", timeout: 20000 },
  );
  await page.waitForTimeout(2500);
  // expand 系统管理
  await page.locator(".el-sub-menu__title, .el-submenu__title", { hasText: "系统管理" }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  const text = await page.locator("body").innerText();
  results.opsDciWithTicket = {
    url: page.url(),
    textSnippet: text.slice(0, 350),
    hasSystem: text.includes("系统管理"),
    hasUserMenu: text.includes("用户管理"),
    hasRoleMenu: text.includes("角色管理"),
    hasInvite: text.includes("邀请码"),
    notLogin: !page.url().includes("/login"),
  };
  await page.close();
}

// --- ops-dci: no session should attempt SSO redirect ---
{
  const context = await browser.newContext();
  const page = await context.newPage();
  let ssoHit = false;
  await page.route("**/login?**", async (route) => {
    const u = route.request().url();
    if (u.includes("3003") || u.includes("return_url")) ssoHit = true;
    await route.abort();
  });
  await page.route("http://127.0.0.1:3003/**", async (route) => {
    ssoHit = true;
    await route.abort();
  });
  await page.goto(`http://127.0.0.1:${dciPort}/`, {
    waitUntil: "domcontentloaded",
    timeout: 8000,
  }).catch(() => {});
  await page.waitForTimeout(500);
  const debug = await page.evaluate(() => ({
    cookie: document.cookie,
    href: location.href,
    hasBridge: !!window.__OPS_DCI_SSO__,
  })).catch(() => ({}));
  results.opsDciNoSession = {
    url: page.url(),
    ssoHit,
    debug,
    bouncedToSso: ssoHit,
  };
  await context.close();
}

await browser.close();
opsProc.kill();
dciProc.kill();

const ok =
  results.opsWithTicket?.hasAdmin &&
  results.opsWithTicket?.ticketStripped &&
  results.opsDciWithTicket?.notLogin &&
  results.opsDciWithTicket?.hasSystem &&
  !results.opsDciWithTicket?.hasUserMenu &&
  !results.opsDciWithTicket?.hasRoleMenu &&
  results.opsDciWithTicket?.hasInvite &&
  results.opsDciNoSession?.bouncedToSso;

console.log(JSON.stringify({ ok, results }, null, 2));
if (!ok) process.exit(1);
