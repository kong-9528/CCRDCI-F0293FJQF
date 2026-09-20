import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3020/";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const resp = await page.goto(BASE + "static/js/index-BiQimQRe.js?t=" + Date.now());
  const text = await resp.text();
  const i = text.indexOf("forgot-back");
  fs.writeFileSync(
    "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_served-back.txt",
    text.slice(i - 200, i + 400),
    "utf8",
  );
  console.log("wrote served slice, has onClick:Ue?", text.includes("onClick:Ue"));
  console.log("has [forgot]?", text.includes("[forgot] back"));
  // Find Ue function in served
  const u = text.indexOf("function Ue");
  console.log("Ue served:", text.slice(u, u + 200));
  await browser.close();
}

main();
