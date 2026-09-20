import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = path.join(process.env.TEMP || "/tmp", "dci-home-auth");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3020/", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2000);

// open login
await page.getByText("登录", { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, "login-modal.png") });

const tabStyles = await page.evaluate(() => {
  const tabs = [...document.querySelectorAll(".tab-switcher-track .tab-btn")];
  const dialog = document.querySelector(".el-dialog.auth-dialog-pixel-perfect");
  return {
    tabs: tabs.map((t) => ({
      text: t.textContent?.trim(),
      fontSize: getComputedStyle(t).fontSize,
      fontWeight: getComputedStyle(t).fontWeight,
    })),
    dialogWidth: dialog ? getComputedStyle(dialog).width : null,
  };
});
console.log("LOGIN", JSON.stringify(tabStyles, null, 2));

// close and go register via header
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
await page.getByText("注册", { exact: true }).first().click();
await page.waitForTimeout(1500);
console.log("URL after register click", page.url());
await page.screenshot({ path: path.join(OUT, "register-page.png"), fullPage: true });

const regStyles = await page.evaluate(() => {
  const title = document.querySelector(".register-card .text-xl, .register-card h2");
  const tip = document.querySelector(".register-card .text-sm, .register-card .card-header-bar p");
  const label = document.querySelector(".register-card .el-form-item__label");
  const input = document.querySelector(".register-card .el-input__inner");
  return {
    title: title && getComputedStyle(title).fontSize,
    tip: tip && getComputedStyle(tip).fontSize,
    label: label && getComputedStyle(label).fontSize,
    input: input && getComputedStyle(input).fontSize,
  };
});
console.log("REGISTER", JSON.stringify(regStyles, null, 2));

await browser.close();
