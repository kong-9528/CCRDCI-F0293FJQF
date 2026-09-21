/**
 * Login to remote dci-manage as root, crawl menus, capture API JSON for mocks.
 *
 * Captcha: math image. Script dumps captcha.png and waits for captcha-answer.txt
 * (write the number then press Enter / or the watcher picks it up).
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "_ops_capture");
const BASE = "http://8.145.60.215:9020/dci-manage";
const USER = process.env.OPS_DCI_USER || "root";
const PASS = process.env.OPS_DCI_PASS || "";
if (!PASS) {
  console.error("Set OPS_DCI_PASS before running capture-remote.mjs");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const apiHits = [];
const pageMap = [];

function shouldCapture(url) {
  return (
    url.includes("/api/") ||
    url.includes("dciManage") ||
    url.includes("getInfo") ||
    url.includes("getRouters") ||
    url.includes("captcha") ||
    url.includes("login")
  );
}

async function waitForAnswer(timeoutMs = 180000) {
  const answerFile = path.join(OUT, "captcha-answer.txt");
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(answerFile)) {
      const v = fs.readFileSync(answerFile, "utf8").trim();
      if (v) return v;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("captcha-answer.txt timeout");
}

async function login(page) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  // fill username/password
  const userInput = page.locator('input[placeholder*="用户"], input[name="username"], input[type="text"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await userInput.fill(USER);
  await passInput.fill(PASS);

  // captcha image
  const captchaImg = page.locator('img[src*="captcha"], .login-code img, .el-image img').first();
  let captchaPath = path.join(OUT, "captcha.png");
  try {
    await captchaImg.waitFor({ timeout: 8000 });
    await captchaImg.screenshot({ path: captchaPath });
  } catch {
    // try page screenshot of login form
    await page.screenshot({ path: path.join(OUT, "login-form.png"), fullPage: true });
    captchaPath = path.join(OUT, "login-form.png");
  }

  console.log("CAPTCHA_SAVED", captchaPath);
  console.log("Write answer to", path.join(OUT, "captcha-answer.txt"));

  // try auto-solve if answer already present from prior run
  let answer = "";
  const answerFile = path.join(OUT, "captcha-answer.txt");
  if (fs.existsSync(answerFile)) {
    answer = fs.readFileSync(answerFile, "utf8").trim();
  }
  if (!answer) {
    answer = await waitForAnswer();
  }

  const codeInput = page.locator('input[placeholder*="验证"], input[placeholder*="验证码"], input[name="code"]').first();
  await codeInput.fill(answer);

  await page.locator('.login-btn, button.el-button--primary, button:has-text("登")').first().click();
  await page.waitForTimeout(3000);

  const url = page.url();
  await page.screenshot({ path: path.join(OUT, "after-login.png"), fullPage: true });
  console.log("AFTER_LOGIN", url);
  if (url.includes("login") || (await page.locator('input[type="password"]').count()) > 0) {
    // clear stale answer so next attempt waits
    try {
      fs.unlinkSync(answerFile);
    } catch {}
    throw new Error("login failed — refresh captcha and retry");
  }
}

async function collectSidebarLinks(page) {
  // expand all submenu parents
  for (let i = 0; i < 8; i++) {
    const collapsed = page.locator(
      ".el-sub-menu:not(.is-opened) > .el-sub-menu__title, .el-submenu:not(.is-opened) > .el-submenu__title",
    );
    const n = await collapsed.count();
    if (!n) break;
    for (let j = 0; j < Math.min(n, 20); j++) {
      try {
        await collapsed.nth(j).click({ timeout: 1000 });
        await page.waitForTimeout(200);
      } catch {}
    }
  }

  const links = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".el-menu a, .sidebar-container a, .el-menu-item a, a.el-menu-item").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const text = (a.textContent || "").trim().replace(/\s+/g, " ");
      if (href && text) out.push({ href, text });
    });
    // also menu items with router path in data
    document.querySelectorAll(".el-menu-item").forEach((el) => {
      const text = (el.textContent || "").trim().replace(/\s+/g, " ");
      const index = el.getAttribute("index") || "";
      if (text) out.push({ href: index, text });
    });
    return out;
  });
  return links;
}

async function crawl(page) {
  const seen = new Set();
  const links = await collectSidebarLinks(page);
  fs.writeFileSync(path.join(OUT, "menu-links.json"), JSON.stringify(links, null, 2));

  // always visit index/home
  const paths = new Set(["/", "/index", "/dashboard"]);
  for (const l of links) {
    let h = l.href || "";
    if (h.startsWith("#")) h = h.slice(1);
    if (h.startsWith("/dci-manage")) h = h.slice("/dci-manage".length) || "/";
    if (h && h.startsWith("/") && !h.startsWith("//")) paths.add(h.split("?")[0]);
  }

  for (const p of paths) {
    if (seen.has(p)) continue;
    seen.add(p);
    const url = BASE.replace(/\/$/, "") + (p.startsWith("/") ? p : "/" + p);
    try {
      console.log("VISIT", p);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1800);
      const text = await page.locator("body").innerText().catch(() => "");
      pageMap.push({ path: p, url: page.url(), text: text.slice(0, 4000) });
      const safe = p.replace(/[^\w\-]+/g, "_").replace(/^_|_$/g, "") || "root";
      await page.screenshot({
        path: path.join(OUT, `page-${safe}.png`),
        fullPage: false,
      });
    } catch (e) {
      pageMap.push({ path: p, error: String(e) });
    }
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on("response", async (res) => {
  try {
    const url = res.url();
    if (!shouldCapture(url)) return;
    const ct = res.headers()["content-type"] || "";
    if (!ct.includes("json") && !url.includes("captchaImage")) return;
    let body = null;
    try {
      body = await res.json();
    } catch {
      try {
        body = await res.text();
      } catch {
        body = null;
      }
    }
    // strip huge captcha base64 from login noise if present
    if (body && typeof body === "object" && body.img && String(body.img).length > 200) {
      body = { ...body, img: "[omitted]" };
    }
    apiHits.push({
      url,
      status: res.status(),
      method: res.request().method(),
      body,
    });
  } catch {}
});

try {
  await login(page);
  await crawl(page);
} catch (e) {
  console.error("CAPTURE_ERROR", e);
  await page.screenshot({ path: path.join(OUT, "error.png"), fullPage: true }).catch(() => {});
  fs.writeFileSync(path.join(OUT, "error.txt"), String(e));
} finally {
  // redact secrets in saved hits
  const redacted = apiHits.map((h) => {
    const b = h.body;
    if (!b || typeof b !== "object") return h;
    const clone = JSON.parse(JSON.stringify(b));
    const scrub = (o) => {
      if (!o || typeof o !== "object") return;
      for (const k of Object.keys(o)) {
        const lk = k.toLowerCase();
        if (
          lk.includes("password") ||
          lk.includes("secret") ||
          lk.includes("accesskey") ||
          lk.includes("token") && typeof o[k] === "string" && o[k].length > 20
        ) {
          o[k] = "[redacted]";
        } else if (typeof o[k] === "object") scrub(o[k]);
      }
    };
    scrub(clone);
    return { ...h, body: clone };
  });
  fs.writeFileSync(path.join(OUT, "api-hits.json"), JSON.stringify(redacted, null, 2));
  fs.writeFileSync(path.join(OUT, "pages.json"), JSON.stringify(pageMap, null, 2));
  console.log(
    JSON.stringify(
      {
        apiHits: apiHits.length,
        pages: pageMap.length,
        out: OUT,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
