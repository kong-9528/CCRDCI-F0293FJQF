export type InfoWorkType = "software" | "work" | "dataset";

export type InfoVerifyStatus = "match" | "mismatch" | "not_found";

export type InfoMismatchField = "name" | "owner";

export type InfoSubmitField = "regNo" | "name" | "owner";

export type InfoVerifyResult = {
  id: string;
  /** 核验编码 */
  verifyCode: string;
  workType: InfoWorkType;
  regNo: string;
  name: string;
  owner: string;
  workCategory?: string;
  version?: string;
  status: InfoVerifyStatus;
  verifiedAt: string;
  channel: "WebUI" | "API";
  /** 失败时不一致的字段 */
  mismatches?: InfoMismatchField[];
  /** 系统登记快照（找到登记号时） */
  snapshot?: {
    name: string;
    owner: string;
    workCategory?: string;
    version?: string;
  };
  message?: string;
};

export const INFO_WORK_TYPE_LABEL: Record<InfoWorkType, string> = {
  software: "软件",
  work: "作品",
  dataset: "数据汇编作品",
};

export const INFO_STATUS_LABEL: Record<InfoVerifyStatus, string> = {
  match: "核验通过",
  mismatch: "核验不通过",
  not_found: "核验不通过",
};

export function infoVerifyPassed(status: InfoVerifyStatus): boolean {
  return status === "match";
}

export function infoVerifyTitle(status: InfoVerifyStatus): string {
  return infoVerifyPassed(status) ? "核验通过" : "核验不通过";
}

export const INFO_MISMATCH_LABEL: Record<InfoMismatchField, string> = {
  name: "名称",
  owner: "著作权人",
};

export const INFO_DEFAULT_DAYS = 30;
export const INFO_EXPORT_LIMIT = 5000;
/** 单次批量上限（演示常量，与 DCI 核验一致） */
export const INFO_BATCH_LIMIT = 100;
export const PAGE_SIZES = [10, 20, 30, 50] as const;

export function infoNameLabel(workType: InfoWorkType): string {
  if (workType === "software") return "软件名称";
  if (workType === "work") return "作品名称";
  return "数据汇编作品名称";
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function normCompare(a: string) {
  return a.trim().toLowerCase().replace(/\s+/g, "");
}

function nextVerifyCode() {
  seq += 1;
  const n = String(2145500000000 + seq).padStart(13, "0");
  return `I${n}`;
}

type RegistryItem = {
  workType: InfoWorkType;
  name: string;
  owner: string;
  workCategory?: string;
  version?: string;
};

const REGISTRY: Record<string, RegistryItem> = {
  "2024SR001234": {
    workType: "software",
    name: "华信OA系统",
    owner: "北京华信科技",
    version: "V2.0",
  },
  "2024ZP001234": {
    workType: "work",
    name: "春江水暖图",
    owner: "北京华信科技",
    workCategory: "美术作品",
  },
  "2024SJ001234": {
    workType: "dataset",
    name: "用户行为数据汇编作品",
    owner: "北京华信科技",
  },
  "2023SR009876": {
    workType: "software",
    name: "数据中台V3",
    owner: "华信科技",
    version: "V3.1",
  },
  "2024ZP009999": {
    workType: "work",
    name: "星河旅人",
    owner: "北方出版集团股份有限公司",
    workCategory: "文字作品",
  },
};

const SEED: Omit<InfoVerifyResult, "id">[] = [
  {
    verifyCode: "I2145500000101",
    workType: "software",
    regNo: "2024SR001234",
    name: "华信OA系统",
    owner: "北京华信科技",
    version: "V2.0",
    status: "match",
    verifiedAt: daysAgo(1),
    channel: "WebUI",
    snapshot: {
      name: "华信OA系统",
      owner: "北京华信科技",
      version: "V2.0",
    },
  },
  {
    verifyCode: "I2145500000102",
    workType: "software",
    regNo: "2023SR009876",
    name: "数据中台V3",
    owner: "错误著作权人",
    version: "V3.1",
    status: "mismatch",
    verifiedAt: daysAgo(2),
    channel: "WebUI",
    mismatches: ["owner"],
    message: "著作权人不一致",
    snapshot: {
      name: "数据中台V3",
      owner: "华信科技",
      version: "V3.1",
    },
  },
  {
    verifyCode: "I2145500000103",
    workType: "work",
    regNo: "2024ZP001234",
    name: "春江水暖图",
    owner: "北京华信科技",
    workCategory: "美术作品",
    status: "match",
    verifiedAt: daysAgo(4),
    channel: "API",
    snapshot: {
      name: "春江水暖图",
      owner: "北京华信科技",
      workCategory: "美术作品",
    },
  },
  {
    verifyCode: "I2145500000104",
    workType: "work",
    regNo: "2024ZP001234",
    name: "春江花月夜",
    owner: "北京华信科技",
    workCategory: "美术作品",
    status: "mismatch",
    verifiedAt: daysAgo(3),
    channel: "WebUI",
    mismatches: ["name"],
    message: "作品名称不一致",
    snapshot: {
      name: "春江水暖图",
      owner: "北京华信科技",
      workCategory: "美术作品",
    },
  },
  {
    verifyCode: "I2145500000105",
    workType: "work",
    regNo: "2024ZP009999",
    name: "星河旅人",
    owner: "错误出版社",
    status: "mismatch",
    verifiedAt: daysAgo(5),
    channel: "WebUI",
    mismatches: ["owner"],
    message: "著作权人不一致",
    snapshot: {
      name: "星河旅人",
      owner: "北方出版集团股份有限公司",
      workCategory: "文字作品",
    },
  },
  {
    verifyCode: "I2145500000106",
    workType: "dataset",
    regNo: "2024SJ001234",
    name: "用户行为数据汇编作品",
    owner: "北京华信科技",
    status: "match",
    verifiedAt: daysAgo(6),
    channel: "API",
    snapshot: {
      name: "用户行为数据汇编作品",
      owner: "北京华信科技",
    },
  },
  {
    verifyCode: "I2145500000107",
    workType: "software",
    regNo: "2024SR999999",
    name: "未知软件",
    owner: "某公司",
    status: "not_found",
    verifiedAt: daysAgo(7),
    channel: "WebUI",
    message: "未找到该登记号",
  },
];

let seq = 200;
export let MOCK_INFO_RECORDS: InfoVerifyResult[] = SEED.map((item, i) => ({
  ...item,
  id: `info-${i + 1}`,
}));

export type InfoVerifyInput = {
  regNo: string;
  name: string;
  owner: string;
};

function mismatchMessage(mismatches: InfoMismatchField[], workType: InfoWorkType): string {
  const parts = mismatches.map((f) =>
    f === "owner" ? "著作权人" : infoNameLabel(workType),
  );
  return `${parts.join("、")}不一致`;
}

export function formatInfoMismatchTags(result: InfoVerifyResult): string {
  if (!result.mismatches?.length) return "";
  return result.mismatches
    .map((f) => (f === "owner" ? "著作权人" : infoNameLabel(result.workType)))
    .join("、");
}

/** 详情抽屉：提交信息字段后的失败原因 */
export function infoFieldFailReason(
  result: InfoVerifyResult,
  field: InfoSubmitField,
): string | null {
  if (result.status === "match") return null;
  if (field === "regNo" && result.status === "not_found") {
    return result.message || "未找到该登记号";
  }
  if (field === "owner" && result.mismatches?.includes("owner")) {
    return "著作权人不一致";
  }
  if (field === "name" && result.mismatches?.includes("name")) {
    return `${infoNameLabel(result.workType)}不一致`;
  }
  return null;
}

/** 详情抽屉失败细节文案，如「作品名称不一致」 */
export function formatInfoFailReasons(result: InfoVerifyResult): string[] {
  if (result.status === "match") return [];
  if (result.status === "not_found") {
    return [result.message || "未找到该登记号"];
  }
  if (result.mismatches?.length) {
    return result.mismatches.map((f) =>
      f === "owner" ? "著作权人不一致" : `${infoNameLabel(result.workType)}不一致`,
    );
  }
  return result.message ? [result.message] : ["登记信息与系统记录不一致"];
}

/** 结果区仅展示用户提交过的字段 */
export function infoSubmittedFieldRows(result: InfoVerifyResult) {
  return [
    { label: "登记号", value: result.regNo || "—", field: "regNo" as const },
    { label: infoNameLabel(result.workType), value: result.name || "—", field: "name" as const },
    { label: "著作权人", value: result.owner || "—", field: "owner" as const },
  ];
}

export async function verifyInfoOnce(
  workType: InfoWorkType,
  input: InfoVerifyInput,
): Promise<InfoVerifyResult> {
  await new Promise((r) => setTimeout(r, 380));
  const regNo = input.regNo.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  const verifyCode = nextVerifyCode();
  const id = `info-${seq}`;

  const hit = REGISTRY[regNo];

  let result: InfoVerifyResult;
  if (!hit || hit.workType !== workType) {
    result = {
      id,
      verifyCode,
      workType,
      regNo,
      name,
      owner,
      status: "not_found",
      verifiedAt: nowStamp(),
      channel: "WebUI",
      message:
        hit && hit.workType !== workType
          ? "未找到该登记号（作品类型不匹配）"
          : "未找到该登记号",
    };
  } else {
    const mismatches: InfoMismatchField[] = [];
    if (name && normCompare(name) !== normCompare(hit.name)) mismatches.push("name");
    if (owner && normCompare(owner) !== normCompare(hit.owner)) mismatches.push("owner");

    if (mismatches.length) {
      result = {
        id,
        verifyCode,
        workType,
        regNo,
        name,
        owner,
        status: "mismatch",
        verifiedAt: nowStamp(),
        channel: "WebUI",
        mismatches,
        message: mismatchMessage(mismatches, workType),
        snapshot: {
          name: hit.name,
          owner: hit.owner,
          workCategory: hit.workCategory,
          version: hit.version,
        },
      };
    } else {
      result = {
        id,
        verifyCode,
        workType,
        regNo,
        name,
        owner,
        status: "match",
        verifiedAt: nowStamp(),
        channel: "WebUI",
        snapshot: {
          name: hit.name,
          owner: hit.owner,
          workCategory: hit.workCategory,
          version: hit.version,
        },
      };
    }
  }

  MOCK_INFO_RECORDS = [result, ...MOCK_INFO_RECORDS];
  return result;
}

export type InfoBatchRow = InfoVerifyInput;

export function infoBatchTemplateHeaders(workType: InfoWorkType) {
  return ["登记号", "著作权人", infoNameLabel(workType)] as const;
}

const INFO_BATCH_ACCEPT_EXT = ["csv", "xls", "xlsx"] as const;

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function normalizeRegNo(regNo: string): string {
  return regNo.trim().toUpperCase();
}

function isInfoHeaderRow(cells: string[], workType: InfoWorkType): boolean {
  const first = (cells[0] ?? "").trim();
  const headers = infoBatchTemplateHeaders(workType);
  return first === headers[0] || first === "登记号";
}

function normalizeInfoBatchRows(raw: string[][], workType: InfoWorkType): InfoBatchRow[] {
  const rows: InfoBatchRow[] = [];
  for (const cells of raw) {
    const regNo = String(cells[0] ?? "").trim();
    const owner = String(cells[1] ?? "").trim();
    const name = String(cells[2] ?? "").trim();
    if (!regNo && !owner && !name) continue;
    if (isInfoHeaderRow([regNo, owner, name], workType)) continue;
    rows.push({ regNo, owner, name });
  }
  return rows;
}

function parseInfoBatchCsv(text: string, workType: InfoWorkType): InfoBatchRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  return normalizeInfoBatchRows(lines.map(parseCsvLine), workType);
}

async function parseInfoBatchSpreadsheet(file: File, workType: InfoWorkType): Promise<InfoBatchRow[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: "",
  });
  return normalizeInfoBatchRows(
    raw.map((row) => row.map((cell) => String(cell ?? "").trim())),
    workType,
  );
}

export async function parseInfoBatchFile(
  file: File,
  workType: InfoWorkType,
): Promise<InfoBatchRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!INFO_BATCH_ACCEPT_EXT.includes(ext as (typeof INFO_BATCH_ACCEPT_EXT)[number])) {
    throw new Error("仅支持 CSV、XLS、XLSX 格式");
  }
  if (ext === "csv") {
    return parseInfoBatchCsv(await file.text(), workType);
  }
  return parseInfoBatchSpreadsheet(file, workType);
}

export function validateInfoBatchRows(
  workType: InfoWorkType,
  rows: InfoBatchRow[],
): string | null {
  if (!rows.length) return "文件中没有可核验的数据行";
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const lineNo = i + 2;
    const err = validateInfoForm(workType, row);
    if (err) return `第 ${lineNo} 行：${err}`;
    const code = normalizeRegNo(row.regNo);
    if (seen.has(code)) return `第 ${lineNo} 行：登记号重复（${code}）`;
    seen.add(code);
  }
  if (seen.size > INFO_BATCH_LIMIT) {
    return `单次批量上限 ${INFO_BATCH_LIMIT} 条（去重后 ${seen.size} 条）`;
  }
  return null;
}

export async function verifyInfoBatch(
  workType: InfoWorkType,
  rows: InfoBatchRow[],
): Promise<InfoVerifyResult[]> {
  const unique: InfoBatchRow[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const regNo = normalizeRegNo(row.regNo);
    if (!regNo || seen.has(regNo)) continue;
    seen.add(regNo);
    unique.push({
      regNo,
      owner: row.owner.trim(),
      name: row.name.trim(),
    });
  }
  const results: InfoVerifyResult[] = [];
  for (const row of unique) {
    results.push(await verifyInfoOnce(workType, row));
  }
  return results;
}

export function downloadInfoBatchTemplate(workType: InfoWorkType) {
  const headers = infoBatchTemplateHeaders(workType);
  const header = headers.map(escapeCsvCell).join(",");
  const samples: Record<InfoWorkType, [string, string, string]> = {
    software: ["2024SR001234", "北京华信科技", "华信OA系统"],
    work: ["2024ZP001234", "北京华信科技", "春江水暖图"],
    dataset: ["2024SJ001234", "北京华信科技", "用户行为数据汇编作品"],
  };
  const sample = samples[workType].map(escapeCsvCell).join(",");
  const blob = new Blob(["\uFEFF" + header + "\n" + sample + "\n"], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `版权登记信息核验批量模板-${INFO_WORK_TYPE_LABEL[workType]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function emptyInfoForm(_workType: InfoWorkType): InfoVerifyInput {
  return { regNo: "", name: "", owner: "" };
}

export function validateInfoForm(workType: InfoWorkType, input: InfoVerifyInput): string | null {
  if (!input.regNo.trim()) return "请填写登记号";
  if (!input.name.trim() && !input.owner.trim()) {
    return `著作权人与${infoNameLabel(workType)}至少填写一项`;
  }
  return null;
}
