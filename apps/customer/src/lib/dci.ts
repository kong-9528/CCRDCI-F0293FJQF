export type DciWorkType = "software" | "work" | "dataset";

export type DciVerifyStatus = "pass" | "not_found" | "fail";

export type DciChannel = "manual" | "api";

/** 失败时标记不一致的字段 */
export type DciMismatchField = "owner" | "name";

export type DciVerifyInput = {
  dciCode: string;
  /** 著作权人（与名称至少填一项） */
  owner: string;
  /** 作品名称 / 软件名称 / 数据集名称（统一展示为软件/作品/数据集名称） */
  name: string;
};

export type DciVerifyResult = {
  id: string;
  /** 核验编码（业务流水号，可复制） */
  verifyCode: string;
  /** 核验人 */
  verifier: string;
  dciCode: string;
  workType: DciWorkType;
  status: DciVerifyStatus;
  verifiedAt: string;
  channel: DciChannel;
  /** 提交的著作权人 */
  queryOwner: string;
  /** 提交的名称（作品/软件/数据集） */
  queryName: string;
  /** 失败时不一致的字段 */
  mismatches?: DciMismatchField[];
  /** 通过时的登记快照（报告/导出用） */
  snapshot?: {
    name: string;
    owner: string;
    version?: string;
    workCategory?: string;
    completeDate?: string;
    publishDate?: string;
    registerDate: string;
    agency: string;
    currentStatus: string;
    source?: string;
    scale?: string;
    dataType?: string;
  };
  message?: string;
};

export const WORK_TYPE_LABEL: Record<DciWorkType, string> = {
  software: "软件",
  work: "作品",
  dataset: "数据集",
};

export const STATUS_LABEL: Record<DciVerifyStatus, string> = {
  pass: "核验通过",
  not_found: "核验不通过",
  fail: "核验不通过",
};

export function isDciVerifyPass(status: DciVerifyStatus): boolean {
  return status === "pass";
}

export const CHANNEL_LABEL: Record<DciChannel, string> = {
  manual: "WebUI",
  api: "API",
};

export const DCI_NAME_LABEL = "软件/作品/数据集名称";

export const MISMATCH_FIELD_LABEL: Record<DciMismatchField, string> = {
  owner: "著作权人",
  name: DCI_NAME_LABEL,
};

/** 单次批量上限 / 每日上限（演示常量） */
export const DCI_BATCH_LIMIT = 100;
export const DCI_DAILY_LIMIT = 1000;
export const DCI_EXPORT_LIMIT = 5000;
export const DCI_DEFAULT_DAYS = 30;
export const PAGE_SIZES = [10, 20, 30, 50] as const;

export function dciNameLabel(_workType?: DciWorkType): string {
  return DCI_NAME_LABEL;
}

/** 前端初步合法性：DCI- 前缀 + 8~24 位字母数字 */
export function isValidDciCode(code: string): boolean {
  return /^DCI-[A-Z0-9]{8,24}$/i.test(code.trim());
}

export function normalizeDciCode(code: string): string {
  return code.trim().toUpperCase();
}

export function emptyDciForm(): DciVerifyInput {
  return { dciCode: "", owner: "", name: "" };
}

/** DCI 码必填；著作权人与名称至少填 1 项 */
export function validateDciForm(input: DciVerifyInput): string | null {
  const dciCode = normalizeDciCode(input.dciCode);
  if (!dciCode) return "请输入 DCI 核验码";
  if (!isValidDciCode(dciCode)) return "DCI 核验码格式不正确，示例：DCI-SWDEMO0001";
  if (!input.owner.trim() && !input.name.trim()) {
    return `著作权人与${DCI_NAME_LABEL}至少填写一项`;
  }
  return null;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/** 演示核验人 */
export const DCI_DEFAULT_VERIFIER = "admin2";

function nextVerifyCode() {
  seq += 1;
  // 形如 R1138840000979
  const n = String(1138840000000 + seq).padStart(13, "0");
  return `R${n}`;
}

function normCompare(a: string) {
  return a.trim().toLowerCase().replace(/\s+/g, "");
}

const SEED: Omit<DciVerifyResult, "id">[] = [
  {
    verifyCode: "R1138840000979",
    verifier: DCI_DEFAULT_VERIFIER,
    dciCode: "DCI-SW20240001",
    workType: "software",
    status: "pass",
    verifiedAt: daysAgo(1),
    channel: "manual",
    queryOwner: "艾克米文化传媒有限公司",
    queryName: "版权核验助手",
    snapshot: {
      name: "版权核验助手",
      owner: "艾克米文化传媒有限公司",
      version: "V1.2.0",
      registerDate: "2024-03-18",
      agency: "中国版权保护中心",
      currentStatus: "有效",
    },
  },
  {
    verifyCode: "R1138840000980",
    verifier: DCI_DEFAULT_VERIFIER,
    dciCode: "DCI-WK20241188",
    workType: "work",
    status: "pass",
    verifiedAt: daysAgo(2),
    channel: "api",
    queryOwner: "北方出版集团股份有限公司",
    queryName: "极光之城",
    snapshot: {
      name: "极光之城",
      owner: "北方出版集团股份有限公司",
      workCategory: "美术作品",
      completeDate: "2023-11-02",
      publishDate: "2024-01-10",
      registerDate: "2024-02-08",
      agency: "中国版权保护中心",
      currentStatus: "有效",
    },
  },
  {
    verifyCode: "R1138840000981",
    verifier: DCI_DEFAULT_VERIFIER,
    dciCode: "DCI-DS20240901",
    workType: "dataset",
    status: "pass",
    verifiedAt: daysAgo(5),
    channel: "manual",
    queryOwner: "像素实验室（深圳）有限公司",
    queryName: "开源图像标注集",
    snapshot: {
      name: "开源图像标注集",
      owner: "像素实验室（深圳）有限公司",
      source: "公开采集+人工标注",
      scale: "120万条 / 48GB",
      dataType: "图像",
      completeDate: "2024-06-01",
      registerDate: "2024-07-12",
      agency: "中国版权保护中心",
      currentStatus: "有效",
    },
  },
  {
    verifyCode: "R1138840000982",
    verifier: DCI_DEFAULT_VERIFIER,
    dciCode: "DCI-UNKNOWN001",
    workType: "software",
    status: "not_found",
    verifiedAt: daysAgo(3),
    channel: "manual",
    queryOwner: "某科技有限公司",
    queryName: "",
    message: "系统中无该DCI码记录",
  },
  {
    verifyCode: "R1138840000983",
    verifier: DCI_DEFAULT_VERIFIER,
    dciCode: "DCI-SW20240001",
    workType: "software",
    status: "fail",
    verifiedAt: daysAgo(4),
    channel: "manual",
    queryOwner: "错误著作权人",
    queryName: "版权核验助手",
    mismatches: ["owner"],
    message: "著作权人不一致",
    snapshot: {
      name: "版权核验助手",
      owner: "艾克米文化传媒有限公司",
      version: "V1.2.0",
      registerDate: "2024-03-18",
      agency: "中国版权保护中心",
      currentStatus: "有效",
    },
  },
  {
    verifyCode: "R1138840000984",
    verifier: DCI_DEFAULT_VERIFIER,
    dciCode: "DCI-SW20238888",
    workType: "software",
    status: "pass",
    verifiedAt: daysAgo(8),
    channel: "api",
    queryOwner: "",
    queryName: "合同比对引擎",
    snapshot: {
      name: "合同比对引擎",
      owner: "艾克米文化传媒有限公司",
      version: "V3.0.1",
      registerDate: "2023-09-01",
      agency: "中国版权保护中心",
      currentStatus: "有效",
    },
  },
];

let seq = 100;
export let MOCK_DCI_RECORDS: DciVerifyResult[] = SEED.map((item, i) => ({
  ...item,
  id: `rec-${i + 1}`,
}));

/** 演示库：已知通过的 DCI */
const MOCK_REGISTRY: Record<string, DciVerifyResult["snapshot"] & { workType: DciWorkType }> = {
  "DCI-SW20240001": {
    workType: "software",
    name: "版权核验助手",
    owner: "艾克米文化传媒有限公司",
    version: "V1.2.0",
    registerDate: "2024-03-18",
    agency: "中国版权保护中心",
    currentStatus: "有效",
  },
  "DCI-SWDEMO0001": {
    workType: "software",
    name: "演示软件登记",
    owner: "演示著作权人",
    version: "V1.0.0",
    registerDate: "2025-01-15",
    agency: "中国版权保护中心",
    currentStatus: "有效",
  },
  "DCI-WK20241188": {
    workType: "work",
    name: "极光之城",
    owner: "北方出版集团股份有限公司",
    workCategory: "美术作品",
    completeDate: "2023-11-02",
    publishDate: "2024-01-10",
    registerDate: "2024-02-08",
    agency: "中国版权保护中心",
    currentStatus: "有效",
  },
  "DCI-WKDEMO0001": {
    workType: "work",
    name: "演示文字作品",
    owner: "演示著作权人",
    workCategory: "文字作品",
    completeDate: "2024-05-01",
    publishDate: "2024-06-01",
    registerDate: "2024-06-20",
    agency: "中国版权保护中心",
    currentStatus: "有效",
  },
  "DCI-DS20240901": {
    workType: "dataset",
    name: "开源图像标注集",
    owner: "像素实验室（深圳）有限公司",
    source: "公开采集+人工标注",
    scale: "120万条 / 48GB",
    dataType: "图像",
    completeDate: "2024-06-01",
    registerDate: "2024-07-12",
    agency: "中国版权保护中心",
    currentStatus: "有效",
  },
  "DCI-DSDEMO0001": {
    workType: "dataset",
    name: "演示数据集",
    owner: "演示著作权人",
    source: "内部生产",
    scale: "10万条 / 2GB",
    dataType: "文本",
    completeDate: "2025-02-01",
    registerDate: "2025-03-01",
    agency: "中国版权保护中心",
    currentStatus: "有效",
  },
};

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function inferWorkTypeFromCode(dciCode: string): DciWorkType {
  if (/^DCI-WK/i.test(dciCode)) return "work";
  if (/^DCI-DS/i.test(dciCode)) return "dataset";
  return "software";
}

function mismatchMessage(mismatches: DciMismatchField[]): string {
  const parts = mismatches.map((f) => (f === "owner" ? "著作权人" : DCI_NAME_LABEL));
  return `${parts.join("、")}不一致`;
}

export async function verifyDciOnce(
  input: DciVerifyInput,
  channel: DciChannel = "manual",
): Promise<DciVerifyResult> {
  await new Promise((r) => setTimeout(r, 420));
  const dciCode = normalizeDciCode(input.dciCode);
  const queryOwner = input.owner.trim();
  const queryName = input.name.trim();
  const hit = MOCK_REGISTRY[dciCode];
  const verifyCode = nextVerifyCode();
  const id = `rec-${seq}`;
  const verifiedAt = nowStamp();
  const verifier = DCI_DEFAULT_VERIFIER;

  let result: DciVerifyResult;
  if (!hit) {
    const inferredType = inferWorkTypeFromCode(dciCode);
    result = {
      id,
      verifyCode,
      verifier,
      dciCode,
      workType: inferredType,
      status: "not_found",
      verifiedAt,
      channel,
      queryOwner,
      queryName,
      message: "系统中无该DCI码记录",
    };
  } else {
    const { workType, ...snapshot } = hit;
    const mismatches: DciMismatchField[] = [];
    if (queryOwner && normCompare(queryOwner) !== normCompare(hit.owner)) {
      mismatches.push("owner");
    }
    if (queryName && normCompare(queryName) !== normCompare(hit.name)) {
      mismatches.push("name");
    }
    if (mismatches.length) {
      result = {
        id,
        verifyCode,
        verifier,
        dciCode,
        workType,
        status: "fail",
        verifiedAt,
        channel,
        queryOwner,
        queryName,
        mismatches,
        snapshot,
        message: mismatchMessage(mismatches),
      };
    } else {
      result = {
        id,
        verifyCode,
        verifier,
        dciCode,
        workType,
        status: "pass",
        verifiedAt,
        channel,
        queryOwner,
        queryName,
        snapshot,
      };
    }
  }

  MOCK_DCI_RECORDS = [result, ...MOCK_DCI_RECORDS];
  return result;
}

export async function verifyDciBatch(rows: DciBatchRow[]): Promise<DciVerifyResult[]> {
  const unique: DciBatchRow[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const dciCode = normalizeDciCode(row.dciCode);
    if (!dciCode || seen.has(dciCode)) continue;
    seen.add(dciCode);
    unique.push({
      dciCode,
      owner: row.owner.trim(),
      name: row.name.trim(),
    });
  }
  const results: DciVerifyResult[] = [];
  for (const row of unique) {
    results.push(await verifyDciOnce(row));
  }
  return results;
}

export type DciBatchRow = DciVerifyInput;

export const DCI_BATCH_TEMPLATE_HEADERS = ["DCI 核验码", "著作权人", DCI_NAME_LABEL] as const;

const DCI_BATCH_ACCEPT_EXT = ["csv", "xls", "xlsx"] as const;

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

function isHeaderRow(cells: string[]): boolean {
  const first = (cells[0] ?? "").trim();
  return first === DCI_BATCH_TEMPLATE_HEADERS[0] || first === "DCI核验码";
}

function normalizeBatchRows(raw: string[][]): DciBatchRow[] {
  const rows: DciBatchRow[] = [];
  for (const cells of raw) {
    const dciCode = String(cells[0] ?? "").trim();
    const owner = String(cells[1] ?? "").trim();
    const name = String(cells[2] ?? "").trim();
    if (!dciCode && !owner && !name) continue;
    if (isHeaderRow([dciCode, owner, name])) continue;
    rows.push({ dciCode, owner, name });
  }
  return rows;
}

function parseDciBatchCsv(text: string): DciBatchRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  return normalizeBatchRows(lines.map(parseCsvLine));
}

async function parseDciBatchSpreadsheet(file: File): Promise<DciBatchRow[]> {
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
  return normalizeBatchRows(
    raw.map((row) => row.map((cell) => String(cell ?? "").trim())),
  );
}

export async function parseDciBatchFile(file: File): Promise<DciBatchRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!DCI_BATCH_ACCEPT_EXT.includes(ext as (typeof DCI_BATCH_ACCEPT_EXT)[number])) {
    throw new Error("仅支持 CSV、XLS、XLSX 格式");
  }
  if (ext === "csv") {
    return parseDciBatchCsv(await file.text());
  }
  return parseDciBatchSpreadsheet(file);
}

export function validateDciBatchRows(rows: DciBatchRow[]): string | null {
  if (!rows.length) return "文件中没有可核验的数据行";
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const lineNo = i + 2;
    const err = validateDciForm(row);
    if (err) return `第 ${lineNo} 行：${err}`;
    const code = normalizeDciCode(row.dciCode);
    if (seen.has(code)) return `第 ${lineNo} 行：DCI 码重复（${code}）`;
    seen.add(code);
  }
  if (seen.size > DCI_BATCH_LIMIT) {
    return `单次批量上限 ${DCI_BATCH_LIMIT} 条（去重后 ${seen.size} 条）`;
  }
  return null;
}

export function downloadDciBatchTemplate() {
  const header = DCI_BATCH_TEMPLATE_HEADERS.map(escapeCsvCell).join(",");
  const sample = ["DCI-SWDEMO0001", "演示著作权人", "演示软件登记"].map(escapeCsvCell).join(",");
  const blob = new Blob(["\uFEFF" + header + "\n" + sample + "\n"], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "DCI批量核验模板.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function parseDciInputList(text: string): string[] {
  return text
    .split(/[\n,，;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatMismatchTags(
  result: DciVerifyResult,
): string {
  if (!result.mismatches?.length) return "";
  return result.mismatches
    .map((f) => (f === "owner" ? "著作权人" : DCI_NAME_LABEL))
    .join("、");
}

/** 详情抽屉：提交信息字段后的失败原因 */
export function dciFieldFailReason(
  result: DciVerifyResult,
  field: "dciCode" | "owner" | "name",
): string | null {
  if (result.status === "pass") return null;
  if (field === "dciCode" && result.status === "not_found") {
    return result.message || "DCI不存在";
  }
  if (field === "owner" && result.mismatches?.includes("owner")) {
    return "著作权人不一致";
  }
  if (field === "name" && result.mismatches?.includes("name")) {
    return `${DCI_NAME_LABEL}不一致`;
  }
  return null;
}

/** 详情抽屉失败细节文案，如「著作权人不一致」 */
export function formatDciFailReasons(result: DciVerifyResult): string[] {
  if (result.status === "pass") return [];
  if (result.status === "not_found") {
    return [result.message || "DCI不存在"];
  }
  if (result.mismatches?.length) {
    return result.mismatches.map((f) =>
      f === "owner" ? "著作权人不一致" : `${DCI_NAME_LABEL}不一致`,
    );
  }
  return result.message ? [result.message] : ["核验未通过"];
}
