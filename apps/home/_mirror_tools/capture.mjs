import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = path.join(process.env.TEMP || "/tmp", "dci-mirror");
fs.mkdirSync(OUT, { recursive: true });

const url = "http://8.145.60.215:9020/dci-manage-reg/";

const browser = await chromium.launch({
  headless: false,
  channel: "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("response", async (res) => {
  try {
    const u = res.url();
    if (!u.includes("dci-manage-reg")) return;
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("json") && u.includes("/prod-api")) {
      const body = await res.text();
      const name = "api-" + Buffer.from(u).toString("base64url").slice(0, 40) + ".json";
      fs.writeFileSync(path.join(OUT, name), body);
    }
  } catch {}
});

await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(3000);

// dismiss loader if still there
await page.evaluate(() => {
  document.body.classList.add("loaded");
});

const title = await page.title();
const text = await page.innerText("body");
const html = await page.content();

fs.writeFileSync(path.join(OUT, "rendered.html"), html, "utf8");
fs.writeFileSync(path.join(OUT, "rendered.txt"), text, "utf8");
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify({ title, url }, null, 2));

await page.screenshot({ path: path.join(OUT, "full.png"), fullPage: true });
await page.screenshot({ path: path.join(OUT, "viewport.png") });

// collect image srcs
const imgs = await page.evaluate(() =>
  [...document.querySelectorAll("img")].map((img) => ({
    src: img.currentSrc || img.src,
    alt: img.alt,
    w: img.naturalWidth,
    h: img.naturalHeight,
  })),
);
fs.writeFileSync(path.join(OUT, "images.json"), JSON.stringify(imgs, null, 2));

// links
const links = await page.evaluate(() =>
  [...document.querySelectorAll("a")].map((a) => ({ href: a.href, text: a.innerText.trim() })),
);
fs.writeFileSync(path.join(OUT, "links.json"), JSON.stringify(links, null, 2));

console.log("TITLE:", title);
console.log("TEXT_LEN:", text.length);
console.log("IMGS:", imgs.length);
console.log("LINKS:", links.length);
console.log("OUT:", OUT);

await browser.close();
