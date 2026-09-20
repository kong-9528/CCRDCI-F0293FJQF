import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = path.join(process.env.TEMP || "/tmp", "dci-home-local");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3020/", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
await page.evaluate(() => document.body.classList.add("loaded"));
const title = await page.title();
const text = await page.innerText("body");
await page.screenshot({ path: path.join(OUT, "home-local.png"), fullPage: true });
fs.writeFileSync(path.join(OUT, "home-local.txt"), text, "utf8");
console.log({ title, textLen: text.length, sample: text.slice(0, 200) });
await browser.close();
