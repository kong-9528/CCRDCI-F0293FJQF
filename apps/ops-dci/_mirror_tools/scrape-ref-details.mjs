import { chromium } from "playwright";
import fs from "node:fs";

const refs = [
  { key: "work-R", url: "https://app-d17h3dyeydq9.appmiaoda.com/dci/dci-detail?tab=work&id=12" },
  { key: "work-C", url: "https://app-d17h3dyeydq9.appmiaoda.com/dci/dci-detail?tab=work&id=13" },
  { key: "work-X", url: "https://app-d17h3dyeydq9.appmiaoda.com/dci/dci-detail?tab=work&id=11" },
  { key: "software-R", url: "https://app-d17h3dyeydq9.appmiaoda.com/dci/dci-detail?tab=software&id=12" },
  { key: "software-C", url: "https://app-d17h3dyeydq9.appmiaoda.com/dci/dci-detail?tab=software&id=11" },
  { key: "dataset-X", url: "https://app-d17h3dyeydq9.appmiaoda.com/dci/dci-detail?tab=dataset&id=50" },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

async function extract() {
  return page.evaluate(() => {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    // Prefer label/value pairs from info grids
    const pairs = [];
    const items = document.querySelectorAll(
      ".info-item, .detail-item, [class*='info-item'], .el-descriptions-item",
    );
    if (items.length) {
      for (const el of items) {
        const label =
          el.querySelector("label, .label, .el-descriptions-item__label")
            ?.textContent || "";
        const valueEl = el.querySelector(
          "span:not(.label), .value, .el-descriptions-item__content",
        );
        const value = valueEl
          ? valueEl.textContent
          : el.textContent.replace(label, "");
        if (clean(label)) pairs.push({ label: clean(label), value: clean(value) });
      }
    }
    // Fallback: walk labels ending with ：
    if (!pairs.length) {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let n;
      while ((n = walk.nextNode())) {
        const t = clean(n.textContent);
        if (
          n.children.length === 0 &&
          /：$|:/.test(t) &&
          t.length < 40 &&
          !/秒哒|首页/.test(t)
        ) {
          const parent = n.parentElement;
          const sib = n.nextElementSibling;
          const value = clean(
            sib?.textContent ||
              parent?.textContent?.replace(t, "") ||
              "",
          );
          pairs.push({ label: t, value: value.slice(0, 200) });
        }
      }
    }

    const sections = [...document.querySelectorAll(".modal-section-title, h2, h3, [class*='section-title']")]
      .map((el) => clean(el.textContent))
      .filter((t) => t && t.length < 40 && !/秒哒|首页|DCI管理/.test(t));

    // Capture CSS clues for layout
    const firstGrid = document.querySelector(
      ".info-grid, [class*='info-grid'], .detail-grid",
    );
    let gridStyle = null;
    if (firstGrid) {
      const cs = getComputedStyle(firstGrid);
      gridStyle = {
        display: cs.display,
        gridTemplateColumns: cs.gridTemplateColumns,
        gap: cs.gap,
        className: firstGrid.className,
      };
    }

    const firstItem = document.querySelector(
      ".info-item, [class*='info-item']",
    );
    let itemStyle = null;
    if (firstItem) {
      const cs = getComputedStyle(firstItem);
      itemStyle = {
        className: firstItem.className,
        gridColumn: cs.gridColumn,
        display: cs.display,
      };
    }

    // Full-row DCI?
    const dciLabel = [...document.querySelectorAll("label, span, div")].find(
      (el) => clean(el.textContent) === "DCI码：" || clean(el.textContent) === "DCI码",
    );
    let dciRow = null;
    if (dciLabel) {
      const row = dciLabel.closest(".info-item, [class*='info-item'], tr, div");
      if (row) {
        const cs = getComputedStyle(row);
        const parent = row.parentElement;
        dciRow = {
          className: row.className,
          gridColumn: cs.gridColumn,
          width: row.getBoundingClientRect().width,
          parentWidth: parent?.getBoundingClientRect().width,
          ratio:
            parent && parent.getBoundingClientRect().width
              ? row.getBoundingClientRect().width /
                parent.getBoundingClientRect().width
              : 0,
        };
      }
    }

    return {
      title: clean(document.title),
      pageTitle: clean(
        document.querySelector("h1, .page-title, [class*='page-title']")
          ?.textContent || "",
      ),
      tag: clean(
        document.querySelector(".el-tag, [class*='tag']")?.textContent || "",
      ),
      sections: [...new Set(sections)],
      pairs,
      text: clean(document.body.innerText).slice(0, 8000),
      gridStyle,
      itemStyle,
      dciRow,
      hasBack: [...document.querySelectorAll("button, a")].some((b) =>
        /返回/.test(b.textContent || ""),
      ),
    };
  });
}

const out = {};
for (const r of refs) {
  console.log("fetch", r.key);
  await page.goto(r.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  out[r.key] = await extract();
  await page.screenshot({
    path: `apps/ops-dci/_mirror_tools/_ref_${r.key}.png`,
    fullPage: true,
  });
}

fs.writeFileSync(
  "apps/ops-dci/_mirror_tools/_ref_details.json",
  JSON.stringify(out, null, 2),
  "utf8",
);
await browser.close();
console.log(
  "done",
  Object.fromEntries(
    Object.entries(out).map(([k, v]) => [
      k,
      {
        sections: v.sections,
        pairCount: v.pairs.length,
        tag: v.tag,
        dciRatio: v.dciRow?.ratio,
        grid: v.gridStyle,
      },
    ]),
  ),
);
