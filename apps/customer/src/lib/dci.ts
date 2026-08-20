export type DciWorkType = "software" | "work" | "dataset";

export type DciVerifyStatus = "pass" | "not_found";

export type DciChannel = "manual" | "api";

export type DciVerifyResult = {
  id: string;
  dciCode: string;
  workType: DciWorkType;
  status: DciVerifyStatus;
  verifiedAt: string;
  channel: DciChannel;
  /** 通过时的登记快照 */
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
  pass: "通过",
  not_found: "DCI不存在",
};

export const CHANNEL_LABEL: Record<DciChannel, string> = {
  manual: "手动",
  api: "API",
};

/** 单次批量上限 / 每日上限（演示常量） */
export const DCI_BATCH_LIMIT = 100;
export const DCI_DAILY_LIMIT = 1000;
export const DCI_EXPORT_LIMIT = 5000;
export const DCI_DEFAULT_DAYS = 30;
export const PAGE_SIZES = [10, 20, 30, 50] as const;

/** 前端初步合法性：DCI- 前缀 + 8~24 位字母数字 */
export function isValidDciCode(code: string): boolean {
  return /^DCI-[A-Z0-9]{8,24}$/i.test(code.trim());
}

export function normalizeDciCode(code: string): string {
  return code.trim().toUpperCase();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

const SEED: Omit<DciVerifyResult, "id">[] = [
  {
    dciCode: "DCI-SW20240001",
    workType: "software",
    status: "pass",
    verifiedAt: daysAgo(1),
    channel: "manual",
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
    dciCode: "DCI-WK20241188",
    workType: "work",
    status: "pass",
    verifiedAt: daysAgo(2),
    channel: "api",
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
    dciCode: "DCI-DS20240901",
    workType: "dataset",
    status: "pass",
    verifiedAt: daysAgo(5),
    channel: "manual",
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
    dciCode: "DCI-UNKNOWN001",
    workType: "software",
    status: "not_found",
    verifiedAt: daysAgo(3),
    channel: "manual",
    message: "系统中无该DCI码记录",
  },
  {
    dciCode: "DCI-SW20238888",
    workType: "software",
    status: "pass",
    verifiedAt: daysAgo(8),
    channel: "api",
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

export async function verifyDciOnce(
  rawCode: string,
  workType: DciWorkType,
  channel: DciChannel = "manual",
): Promise<DciVerifyResult> {
  await new Promise((r) => setTimeout(r, 420));
  const dciCode = normalizeDciCode(rawCode);
  const hit = MOCK_REGISTRY[dciCode];
  seq += 1;
  const id = `rec-${seq}`;
  const verifiedAt = nowStamp();

  let result: DciVerifyResult;
  if (hit && hit.workType === workType) {
    const { workType: _t, ...snapshot } = hit;
    result = {
      id,
      dciCode,
      workType,
      status: "pass",
      verifiedAt,
      channel,
      snapshot,
    };
  } else if (hit && hit.workType !== workType) {
    result = {
      id,
      dciCode,
      workType,
      status: "not_found",
      verifiedAt,
      channel,
      message: "系统中无该DCI码记录（作品类型不匹配）",
    };
  } else {
    result = {
      id,
      dciCode,
      workType,
      status: "not_found",
      verifiedAt,
      channel,
      message: "系统中无该DCI码记录",
    };
  }

  MOCK_DCI_RECORDS = [result, ...MOCK_DCI_RECORDS];
  return result;
}

export async function verifyDciBatch(
  codes: string[],
  workType: DciWorkType,
): Promise<DciVerifyResult[]> {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const c of codes) {
    const n = normalizeDciCode(c);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    unique.push(n);
  }
  const results: DciVerifyResult[] = [];
  for (const code of unique) {
    results.push(await verifyDciOnce(code, workType));
  }
  return results;
}

export function parseDciInputList(text: string): string[] {
  return text
    .split(/[\n,，;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
