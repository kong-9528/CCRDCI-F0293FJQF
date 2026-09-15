import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "pages");
fs.mkdirSync(out, { recursive: true });

const routes = [
  "/",
  "/system",
  "/standard",
  "/registry",
  "/ecology",
  "/lab",
  "/query",
  "/faq",
  "/contact",
  "/tech-service",
];

const base = "https://app-ck03sng4kykh.appmiaoda.com";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const route of routes) {
  const url = `${base}${route}`;
  console.log("fetch", url);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(1500);
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const text = await page.evaluate(() => document.body.innerText);
    const name = route === "/" ? "home" : route.slice(1);
    fs.writeFileSync(path.join(out, `${name}.html`), html, "utf8");
    fs.writeFileSync(path.join(out, `${name}.txt`), text, "utf8");
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
    console.log("ok", name, "html", html.length, "text", text.length);
  } catch (e) {
    console.error("fail", route, e.message);
  }
}

await browser.close();
console.log("done");
