/**
 * 1) Narrow 作品类别/状态/码类型 select boxes on allocation tabs
 * 2) Show soft/dataset 导出 (strip v-hasPermi) like opus
 * 3) Mock /dci/applyDoc/export as downloadable blob with list columns
 */
import fs from "node:fs";

const lists = [
  {
    js: "apps/ops-dci/mirror/static/js/opus-DCRymxdq.js",
    css: "apps/ops-dci/mirror/static/css/opus-Duaj6xyj.css",
    prefix: "opus",
    hasCategory: true,
    exportPerm: false,
  },
  {
    js: "apps/ops-dci/mirror/static/js/soft-D-V6yNun.js",
    css: "apps/ops-dci/mirror/static/css/soft-BPUiBseB.css",
    prefix: "soft",
    hasCategory: false,
    exportPerm: true,
  },
  {
    js: "apps/ops-dci/mirror/static/js/dataset-cXmRoDti.js",
    css: "apps/ops-dci/mirror/static/css/dataset-DmhoyApB.css",
    prefix: "dataset",
    hasCategory: false,
    exportPerm: true,
  },
];

function patchSelectClasses(s, prefix, hasCategory) {
  let out = s;
  if (hasCategory) {
    // only the caseCategoryCode select uses form-input near that prop
    out = out.replace(
      /(prop:"caseCategoryCode"\},\{default:\w+\(\(\)=>\[\w+\(\w+,\{modelValue:[^}]+placeholder:"全部",)class:"[^"]+"/,
      `$1class:"${prefix}-form-select ${prefix}-form-select--category"`,
    );
  }
  out = out.replace(
    /(prop:"dciStatus"\},\{default:\w+\(\(\)=>\[\w+\(\w+,\{modelValue:[^}]+placeholder:"全部",)class:"[^"]+"/,
    `$1class:"${prefix}-form-select ${prefix}-form-select--status"`,
  );
  out = out.replace(
    /(prop:"dciCodeType"\},\{default:\w+\(\(\)=>\[\w+\(\w+,\{modelValue:[^}]+placeholder:"全部",)class:"[^"]+"/,
    `$1class:"${prefix}-form-select ${prefix}-form-select--code-type"`,
  );
  return out;
}

function stripExportPerm(s, prefix) {
  // T((g(),C(u,{class:"soft-export-btn",...},{default:...}),_:1},8,["loading"])),[[M,["dci:codeManage:export"]]])
  // -> a(u,{class:"soft-export-btn",...},{default:...}),_:1},8,["loading"])
  const re = new RegExp(
    String.raw`T\(\(g\(\),C\(u,\{class:"${prefix}-export-btn",loading:([^,]+),icon:"Download",onClick:([^,}]+)\},\{default:((?:i|d)\(\(\)=>\[\.\.\.e\[\d+\]\|\|\(e\[\d+\]=\[f\("导出",-1\)\]\)\]\))\),_:1\},8,\["loading"\]\)\)\),\[\[M,\["dci:codeManage:export"\]\]\]\)`,
  );
  const next = s.replace(
    re,
    (_, loading, onClick, def) =>
      `a(u,{class:"${prefix}-export-btn",loading:${loading},icon:"Download",onClick:${onClick}},{default:${def}),_:1},8,["loading"])`,
  );
  if (next !== s) return next;

  // broader: strip permi + unwrap leftover T((g(),C(...)))
  let out = s.replace(
    new RegExp(
      String.raw`(class:"${prefix}-export-btn"[\s\S]{0,220}?8,\["loading"\]\)\)),\[\[M,\["dci:codeManage:export"\]\]\]\)`,
    ),
    "$1)",
  );
  out = out.replace(
    new RegExp(
      String.raw`T\(\(g\(\),C\(u,\{class:"${prefix}-export-btn",loading:([^,]+),icon:"Download",onClick:([^,}]+)\},\{default:((?:i|d)\(\(\)=>\[\.\.\.e\[\d+\]\|\|\(e\[\d+\]=\[f\("导出",-1\)\]\)\]\))\),_:1\},8,\["loading"\]\)\)\)`,
    ),
    (_, loading, onClick, def) =>
      `a(u,{class:"${prefix}-export-btn",loading:${loading},icon:"Download",onClick:${onClick}},{default:${def}),_:1},8,["loading"])`,
  );
  return out;
}

function patchCss(cssPath, prefix, hasCategory) {
  let css = fs.readFileSync(cssPath, "utf8");
  const marker = `.${prefix}-form-select--status`;
  if (css.includes(marker)) {
    console.log("css already patched", cssPath);
    return;
  }
  // Widths sized for longest option text (14px font + padding + caret):
  // category ~「工程设计图/产品设计图」; status ~「已撤销」; code-type ~「授权分配」
  const rules = [
    hasCategory
      ? `.${prefix}-form-select--category[data-v-xx]{width:200px;max-width:100%;min-width:0}`
      : "",
    `.${prefix}-form-select--status[data-v-xx]{width:100px;max-width:100%;min-width:0}`,
    `.${prefix}-form-select--code-type[data-v-xx]{width:120px;max-width:100%;min-width:0}`,
  ]
    .filter(Boolean)
    .join("");

  // Discover actual scope id from an existing rule
  const scopeM = css.match(
    new RegExp(`\\.${prefix}-form-input\\[data-v-([0-9a-f]+)\\]`),
  );
  const scope = scopeM ? scopeM[1] : null;
  if (!scope) {
    console.warn("no scope id in", cssPath);
    return;
  }
  const scoped = rules.replace(/data-v-xx/g, `data-v-${scope}`);
  css += scoped;
  fs.writeFileSync(cssPath, css, "utf8");
  console.log("css patched", cssPath, "scope", scope);
}

for (const item of lists) {
  let s = fs.readFileSync(item.js, "utf8");
  const before = s;
  s = patchSelectClasses(s, item.prefix, item.hasCategory);
  if (item.exportPerm) s = stripExportPerm(s, item.prefix);
  if (s !== before) {
    fs.writeFileSync(item.js, s, "utf8");
    console.log("js patched", item.js);
  } else {
    console.log("js NO CHANGE", item.js);
    // debug snippets
    for (const key of ["caseCategoryCode", "dciStatus", "dciCodeType", "export-btn"]) {
      const i = s.indexOf(key === "export-btn" ? `${item.prefix}-export-btn` : `prop:"${key}"`);
      if (i >= 0) console.log(" ", key, s.slice(i, i + 180));
    }
  }
  patchCss(item.css, item.prefix, item.hasCategory);
}

// --- mock export ---
const mockPath = "apps/ops-dci/mirror/static/js/ops-mock-api.js";
let mock = fs.readFileSync(mockPath, "utf8");
if (mock.includes("applyDoc/export")) {
  console.log("mock export already present");
} else {
  const exportHandler = `
    // DCI码分配列表导出：字段与列表列一致，返回可下载 blob
    if ((m === "POST" || m === "GET") && /\\/dci\\/applyDoc\\/export/.test(path)) {
      return mockApplyDocExport(rawUrl, body);
    }
`;
  // insert near start of handle, after parseBody
  mock = mock.replace(
    "function handle(method, rawUrl, body) {\n    var m = String(method || \"GET\").toUpperCase();\n    var path = apiPath(rawUrl);\n    var data = parseBody(body);\n",
    "function handle(method, rawUrl, body) {\n    var m = String(method || \"GET\").toUpperCase();\n    var path = apiPath(rawUrl);\n    var data = parseBody(body);\n" +
      exportHandler,
  );

  const helperFns = `
  var CATEGORY_LABEL = {100:"文字作品",110:"音乐作品",120:"戏剧作品",130:"曲艺作品",140:"舞蹈作品",150:"美术作品",160:"摄影作品",170:"电影作品",180:"视听作品",190:"工程设计图/产品设计图",200:"地图/示意图",210:"其他作品",220:"口述作品",230:"杂技艺术",240:"建筑作品",250:"模型作品",260:"录音制品",270:"录像制品",280:"软件",290:"汇编作品（数据集）"};
  var STATUS_LABEL = {0:"申领",1:"撤销"};

  function parseFormBody(body) {
    if (body == null || body === "") return {};
    if (typeof body === "object" && typeof body !== "string") return body;
    var s = String(body);
    if (s.charAt(0) === "{") {
      try { return JSON.parse(s); } catch (e) { return {}; }
    }
    var out = {};
    try {
      var sp = new URLSearchParams(s);
      sp.forEach(function (v, k) { out[k] = v; });
    } catch (e) {}
    return out;
  }

  function csvEscape(v) {
    var t = v == null ? "" : String(v);
    if (/[",\\n\\r]/.test(t)) return '"' + t.replace(/"/g, '""') + '"';
    return t;
  }

  function mockApplyDocExport(rawUrl, body) {
    var params = parseFormBody(body);
    var caseType = params.caseType || "opus";
    var store = window.__OPS_MOCK_STORE__ || {};
    var listBody = store["POST /api/v1/dciManage/dci/applyDoc/cursorList"];
    var allRows =
      (listBody && listBody.data && listBody.data.rows) ||
      (listBody && listBody.rows) ||
      [];
    var rows = (allRows || []).filter(function (r) {
      if (!caseType) return true;
      var t = r.caseType || r.case_type;
      return !t || String(t) === String(caseType);
    });
    var headers;
    var mapRow;
    if (caseType === "soft") {
      headers = ["序号","DCI码","软件名称","著作权人","DCI注册中心","DCI申领平台","DCI分配时间","状态"];
      mapRow = function (r, i) {
        return [i+1, r.dciCode, r.caseName, r.ownerName, r.registerName, r.applyOrgName, r.dciApplyTime || r.dciApplyTimeStr || "", STATUS_LABEL[r.dciStatus] != null ? STATUS_LABEL[r.dciStatus] : (r.dciStatus == null ? "-" : r.dciStatus)];
      };
    } else if (caseType === "dataset") {
      headers = ["序号","DCI码","数据集名称","著作权人","DCI注册中心","DCI申领平台","DCI分配时间","状态"];
      mapRow = function (r, i) {
        return [i+1, r.dciCode, r.caseName, r.ownerName, r.registerName, r.applyOrgName, r.dciApplyTime || r.dciApplyTimeStr || "", STATUS_LABEL[r.dciStatus] != null ? STATUS_LABEL[r.dciStatus] : (r.dciStatus == null ? "-" : r.dciStatus)];
      };
    } else {
      headers = ["序号","DCI码","作品名称","作品类别","著作权人","DCI注册中心","DCI申领平台","DCI分配时间","状态"];
      mapRow = function (r, i) {
        var cat = CATEGORY_LABEL[r.caseCategoryCode] || r.caseCategoryName || r.caseCategoryCode || "";
        return [i+1, r.dciCode, r.caseName, cat, r.ownerName, r.registerName, r.applyOrgName, r.dciApplyTime || r.dciApplyTimeStr || "", STATUS_LABEL[r.dciStatus] != null ? STATUS_LABEL[r.dciStatus] : (r.dciStatus == null ? "-" : r.dciStatus)];
      };
    }
    var lines = [headers.map(csvEscape).join(",")];
    for (var i = 0; i < rows.length; i++) {
      lines.push(mapRow(rows[i], i).map(csvEscape).join(","));
    }
    // UTF-8 BOM so Excel opens Chinese correctly; content-type non-json so download helper accepts blob
    var csv = "\\uFEFF" + lines.join("\\r\\n");
    return {
      __opsMockBlob: true,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: csv,
      filename: "codeManage_" + caseType + "_export.xlsx",
    };
  }

`;

  mock = mock.replace(
    "  function handle(method, rawUrl, body) {",
    helperFns + "  function handle(method, rawUrl, body) {",
  );

  // Update respondXhr to support blob payloads
  mock = mock.replace(
    "  function respondXhr(xhr, payload) {\n    var text = JSON.stringify(payload);\n",
    `  function respondXhr(xhr, payload) {
    var isBlob = payload && payload.__opsMockBlob;
    var contentType = isBlob
      ? payload.contentType || "application/octet-stream"
      : "application/json;charset=utf-8";
    var text = isBlob ? String(payload.body || "") : JSON.stringify(payload);
    var blobObj = isBlob
      ? new Blob([text], { type: contentType })
      : null;
`,
  );

  mock = mock.replace(
    `      try {
        Object.defineProperty(xhr, "response", {
          configurable: true,
          get: function () {
            return text;
          },
        });
      } catch (e) {
        try {
          xhr.response = text;
        } catch (e2) {}
      }
      xhr.getResponseHeader = function (name) {
        return String(name || "").toLowerCase() === "content-type"
          ? "application/json;charset=utf-8"
          : null;
      };
      xhr.getAllResponseHeaders = function () {
        return "content-type: application/json;charset=utf-8\\r\\n";
      };`,
    `      try {
        Object.defineProperty(xhr, "response", {
          configurable: true,
          get: function () {
            return blobObj || text;
          },
        });
      } catch (e) {
        try {
          xhr.response = blobObj || text;
        } catch (e2) {}
      }
      xhr.getResponseHeader = function (name) {
        var n = String(name || "").toLowerCase();
        if (n === "content-type") return contentType;
        if (n === "content-disposition" && isBlob && payload.filename) {
          return 'attachment; filename="' + payload.filename + '"';
        }
        return null;
      };
      xhr.getAllResponseHeaders = function () {
        var h = "content-type: " + contentType + "\\r\\n";
        if (isBlob && payload.filename) {
          h += 'content-disposition: attachment; filename="' + payload.filename + '"\\r\\n';
        }
        return h;
      };`,
  );

  // fetch path for blob
  mock = mock.replace(
    `      return Promise.resolve(
        new Response(JSON.stringify(handle(method, url, b)), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );`,
    `      var payload = handle(method, url, b);
      if (payload && payload.__opsMockBlob) {
        return Promise.resolve(
          new Response(payload.body || "", {
            status: 200,
            headers: {
              "Content-Type":
                payload.contentType || "application/octet-stream",
              "Content-Disposition":
                'attachment; filename="' +
                (payload.filename || "export.xlsx") +
                '"',
            },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );`,
  );

  fs.writeFileSync(mockPath, mock, "utf8");
  console.log("mock patched for export blob");
}

console.log("done");
