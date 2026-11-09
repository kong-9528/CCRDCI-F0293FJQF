/**
 * 登记号多结果：按时间线上「最后」的异常状态，标记到第一条记录
 * 已冻结 / 已解冻 / 已撤销
 */
import fs from "node:fs";

const mockPath = "apps/home/mirror/static/js/dci-mock-api.js";
const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
const cssPath = "apps/home/mirror/static/css/index-DogJsFVJ.css";
const catalogPath = "apps/home/mirror/static/js/dci-query-mock-catalog.js";
const docPath = "docsss/documents/DCI查询页-各业务类型mock样例.md";

let mock = fs.readFileSync(mockPath, "utf8");
let page = fs.readFileSync(pagePath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");
let catalog = fs.readFileSync(catalogPath, "utf8");

const sortBlock = `hits.sort(function (a, b) {
        var da = String((a && a.eventDate) || "");
        var db = String((b && b.eventDate) || "");
        if (da && db && da !== db) return da < db ? -1 : 1;
        if (da && !db) return -1;
        if (!da && db) return 1;
        return String((a && a.id) || "").localeCompare(String((b && b.id) || ""));
      });
      return ok(hits);`;

const sortWithStatus = `hits.sort(function (a, b) {
        var da = String((a && a.eventDate) || "");
        var db = String((b && b.eventDate) || "");
        if (da && db && da !== db) return da < db ? -1 : 1;
        if (da && !db) return -1;
        if (!da && db) return 1;
        return String((a && a.id) || "").localeCompare(String((b && b.id) || ""));
      });
      // 深拷贝，避免污染 catalog；按时间线最后一条异常状态标记到首条
      hits = hits.map(function (row) {
        return Object.assign({}, row, {
          fields: Array.isArray(row.fields) ? row.fields.slice() : [],
        });
      });
      function fieldVal(row, label) {
        var list = row.fields || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].label === label) return String(list[i].value || "");
        }
        return "";
      }
      function deriveFinalStatus(rows) {
        for (var i = rows.length - 1; i >= 0; i--) {
          var row = rows[i] || {};
          if (row.kind === "dci") continue;
          var biz = String(row.bizLine || "");
          var notice = String(row.noticeType || "") + String(row.noticeTypeLabel || "");
          var typeVal = fieldVal(row, "类型");
          // 冻结/解冻：看「类型」字段
          if (biz.indexOf("ZQC") >= 0 || /冻结|解冻/.test(notice) || /冻结|解冻|轮候/.test(typeVal)) {
            if (/解冻/.test(typeVal) || (/解冻/.test(notice) && !/冻结/.test(typeVal))) {
              return "已解冻";
            }
            if (/冻结|轮候/.test(typeVal) || /冻结/.test(notice)) {
              return "已冻结";
            }
          }
          if (
            biz === "Z62" ||
            biz === "ZQC（4）" ||
            biz === "R42R44" ||
            /撤销/.test(notice)
          ) {
            return "已撤销";
          }
        }
        return "";
      }
      var finalStatus = deriveFinalStatus(hits);
      hits.forEach(function (row, idx) {
        if (row.kind === "dci") {
          row.statusLabel = "";
          return;
        }
        row.statusLabel = idx === 0 ? finalStatus : "";
      });
      return ok(hits);`;

if (!mock.includes("deriveFinalStatus")) {
  if (!mock.includes(sortBlock)) throw new Error("sort block missing");
  mock = mock.replace(sortBlock, sortWithStatus);
  fs.writeFileSync(mockPath, mock, "utf8");
  console.log("mock derive status ok");
} else {
  console.log("mock already has derive");
}

// page: status class by label
const oldHeadStatus = `if(l.statusLabel)kids.push(t("span",{class:L(["result-status","is-cancelled"])},k(l.statusLabel),1));`;
const newHeadStatus = `if(l.statusLabel){const sc=String(l.statusLabel).includes("解冻")?"is-unfrozen":String(l.statusLabel).includes("冻结")?"is-frozen":"is-cancelled";kids.push(t("span",{class:L(["result-status",sc])},k(l.statusLabel),1))}`;
if (page.includes(oldHeadStatus)) {
  page = page.replace(oldHeadStatus, newHeadStatus);
  fs.writeFileSync(pagePath, page, "utf8");
  console.log("page status class ok");
} else if (page.includes("is-unfrozen")) {
  console.log("page already patched");
} else {
  throw new Error("head status anchor missing");
}

// css: three status markers (salmon/pink like screenshot)
if (!css.includes(".result-status.is-unfrozen")) {
  const old =
    ".result-status.is-cancelled[data-v-bc73a8d2]{color:#fff;background:#f56c6c;border:none;margin-left:8px;font-weight:400}";
  const neu =
    ".result-status.is-cancelled[data-v-bc73a8d2],.result-status.is-frozen[data-v-bc73a8d2],.result-status.is-unfrozen[data-v-bc73a8d2]{display:inline-flex;align-items:center;height:22px;padding:0 8px;margin-left:8px;border:none;border-radius:2px;color:#fff;font-size:13px;font-weight:400;line-height:22px;background:#f56c6c}";
  if (!css.includes(old)) {
    // inject after related-dci if cancelled missing exact
    if (!css.includes("is-cancelled")) {
      css = css.replace(
        ".result-related-dci[data-v-bc73a8d2]",
        neu + ".result-related-dci[data-v-bc73a8d2]"
      );
    } else {
      css = css.replace(
        /\\.result-status\\.is-cancelled\\[data-v-bc73a8d2\\]\\{[^}]*\\}/,
        neu
      );
    }
  } else {
    css = css.replace(old, neu);
  }
  fs.writeFileSync(cssPath, css, "utf8");
  console.log("css status ok");
}

// ---- catalog: Z 时间线最后为「解冻」→ 已解冻；R 最后为撤销 → 已撤销 ----
// 去掉首条写死的 statusLabel，改由 API 推导
catalog = catalog.replace(
  /statusLabel: "已撤销",\n\s*eventDate: "2026-01-08"/,
  'eventDate: "2026-01-08"'
);
catalog = catalog.replace(
  /statusLabel: "已撤销",\n\s*eventDate: "2021-07-27"/,
  'eventDate: "2021-07-27"'
);

// Z：把 ZQC4、Z62 挪到冻结之前；冻结后追加解冻为最后一条
if (!catalog.includes("mock-z-all-zqc1-unfreeze")) {
  // remove old zqc1 / zqc4 / z62 blocks and rewrite end of Z section
  const zStart = catalog.indexOf('id: "mock-z-all-zqc1"');
  const rStart = catalog.indexOf("// ========== R 字头");
  if (zStart < 0 || rStart < 0) throw new Error("z/r section markers missing");

  const zTail = `item({
      id: "mock-z-all-zqc4",
      bizLine: "ZQC（4）",
      noticeType: "司法撤销登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-07-01",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "司法/行政机关名称", value: "某市市场监督管理局" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "撤销依据", value: "行政处罚决定书〔2026〕12号" },
        { label: "撤销日期", value: "2026年07月01日" },
      ],
    }),
    item({
      id: "mock-z-all-z62",
      bizLine: "Z62",
      noticeType: "撤销作品著作权和合同登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-07-10",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "撤销登记申请人", value: Z_OWNER, link: true },
        { label: "原登记类型", value: "作品著作权登记" },
        { label: "撤销日期", value: "2026年07月10日" },
      ],
    }),
    item({
      id: "mock-z-all-zqc1",
      bizLine: "ZQC（1）",
      noticeType: "司法冻结/解冻登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-08-07",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["某市中级人民法院"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "司法机关名称", value: "某市中级人民法院" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "类型", value: "冻结" },
        { label: "冻结/解冻日期", value: "2026年08月07日" },
      ],
    }),
    item({
      id: "mock-z-all-zqc1-unfreeze",
      bizLine: "ZQC（1）",
      noticeType: "司法冻结/解冻登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-08-31",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["某市中级人民法院"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "司法机关名称", value: "某市中级人民法院" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "类型", value: "解冻" },
        { label: "冻结/解冻日期", value: "2026年08月31日" },
      ],
    }),

    `;

  // find start of mock-z-all-zqc1 through before R section — but zqc1 may not be first of the three
  // Replace from first of zqc1/zqc4/z62 among the ending trio. Use z61 end as anchor.
  const z61End = catalog.indexOf('id: "mock-z-all-z61"');
  const afterZ61 = catalog.indexOf("}),", z61End);
  const cutFrom = catalog.indexOf("item({", afterZ61);
  if (cutFrom < 0 || cutFrom > rStart) throw new Error("cannot locate Z tail");
  catalog = catalog.slice(0, cutFrom) + zTail + catalog.slice(rStart);
  console.log("catalog Z timeline retargeted to 已解冻");
}

fs.writeFileSync(catalogPath, catalog, "utf8");

// doc note
let doc = fs.readFileSync(docPath, "utf8");
if (!doc.includes("最终状态标记")) {
  doc = doc.replace(
    "登记号命中多条时：**时间正序**；**仅第一条**展示 DCI 码；无独立登记号的记录表头只显示业务类型 label。",
    "登记号命中多条时：**时间正序**；**仅第一条**展示 DCI 码；无独立登记号的记录表头只显示业务类型 label。\n\n**最终状态标记**（仅打在第一条、业务类型 label 右侧）：根据结果列表时间线上**最后一次**异常状态推导，取值 `已冻结` / `已解冻` / `已撤销`。\n- Z 全类型样例最后为「解冻」→ 首条标 **已解冻**\n- R 全类型样例最后为「登记撤销」→ 首条标 **已撤销**"
  );
  // update Z table last rows
  doc = doc.replace(
    `| 8 | ZQC（1） | 司法冻结/解冻登记公告 | 无 | 2026-07-08 |
| 9 | ZQC（4） | 司法撤销登记公告 | 无 | 2026-08-15 |
| 10 | Z62 | 撤销作品著作权和合同登记公告 | 无 | 2026-09-01 |`,
    `| 8 | ZQC（4） | 司法撤销登记公告 | 无 | 2026-07-01 |
| 9 | Z62 | 撤销作品著作权和合同登记公告 | 无 | 2026-07-10 |
| 10 | ZQC（1） | 司法冻结/解冻登记公告（冻结） | 无 | 2026-08-07 |
| 11 | ZQC（1） | 司法冻结/解冻登记公告（解冻）→ 最终 **已解冻** | 无 | 2026-08-31 |`
  );
  doc = doc.replace(
    "| 1 | Z11 | 作品著作权登记公告 | 有（+已撤销） | 2026-01-08 |",
    "| 1 | Z11 | 作品著作权登记公告 | 有（首条最终状态：**已解冻**） | 2026-01-08 |"
  );
  doc = doc.replace(
    "| 1 | R11 | 计算机软件著作权登记公告 | 有（+已撤销） | 2021-07-27 |",
    "| 1 | R11 | 计算机软件著作权登记公告 | 有（首条最终状态：**已撤销**） | 2021-07-27 |"
  );
  fs.writeFileSync(docPath, doc, "utf8");
  console.log("doc updated");
}

console.log("done");
