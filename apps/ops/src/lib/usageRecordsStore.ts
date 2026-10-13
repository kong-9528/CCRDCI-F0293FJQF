/**
 * 产品使用记录（运营侧）
 * 字段与 customer 端核验/审核记录对齐，并挂上机构账号维度。
 */

export type UsageProductTab = "dci" | "info" | "certificate" | "workReview";

export const USAGE_PRODUCT_TAB_LABEL: Record<UsageProductTab, string> = {
  dci: "DCI核验",
  info: "版权登记信息核验",
  certificate: "版权登记证书核验",
  workReview: "作品智能辅助审核",
};

export type UsageChannel = "WebUI" | "API";
export type UsageWorkType = "software" | "work" | "dataset";

type AccountRef = {
  customerId: string;
  account: string;
  companyName: string;
};

export type DciMismatchField = "owner" | "name";
export type InfoMismatchField = "name" | "owner";
export type CertMismatchField = "certNo" | "workName" | "owner";

/** 与 customer 端对齐：DCI 码核验 / 上传作品样本 / 输入作品哈希 */
export type DciVerifyKind = "code" | "sample_file" | "sample_hash";

/** 详情态：fail 含 not_found，列表筛选仍用 pass|fail */
export type DciDetailStatus = "pass" | "not_found" | "fail";
export type InfoDetailStatus = "match" | "mismatch" | "not_found";

export type CertRecognition = {
  certTitleNo: string;
  workName: string;
  owner: string;
  acquireMethod: string;
  rightScope: string;
  registerDate: string;
  registerNo: string;
};

export type DciUsageRecord = AccountRef & {
  id: string;
  verifyCode: string;
  verifier: string;
  verifiedAt: string;
  dciCode: string;
  workType: UsageWorkType;
  /** 码核验：与 queryOwner 同为「著作权人/作品名称」；样本哈希：存哈希值；样本文件：可与 fileName 一致 */
  queryName: string;
  queryOwner: string;
  channel: UsageChannel;
  verifyKind: DciVerifyKind;
  /** 上传作品样本时的文件名（暂不提供预览） */
  fileName?: string;
  /** 列表/筛选：pass | fail（fail 含 not_found） */
  status: "pass" | "fail";
  detailStatus: DciDetailStatus;
  mismatches?: DciMismatchField[];
  message?: string;
};

export type InfoUsageRecord = AccountRef & {
  id: string;
  verifyCode: string;
  verifiedAt: string;
  workType: UsageWorkType;
  regNo: string;
  name: string;
  owner: string;
  channel: UsageChannel;
  status: "pass" | "fail";
  detailStatus: InfoDetailStatus;
  mismatches?: InfoMismatchField[];
  message?: string;
};

export type CertUsageRecord = AccountRef & {
  id: string;
  verifyCode: string;
  verifier: string;
  verifiedAt: string;
  fileName: string;
  fileUrl: string;
  channel: UsageChannel;
  status: "pass" | "fail";
  recognition: CertRecognition;
  mismatches?: CertMismatchField[];
  message?: string;
};

export type ReviewUsageRecord = AccountRef & {
  id: string;
  submittedAt: string;
  finishedAt: string | null;
  taskId: string;
  apiName: string;
  status: "success" | "fail" | "reviewing";
  /** 详情抽屉结论摘要 */
  resultSummary: string;
};

export const DCI_STATUS_LABEL = { pass: "核验通过", fail: "核验不通过" } as const;
export const INFO_STATUS_LABEL = { pass: "核验通过", fail: "核验不通过" } as const;
export const CERT_STATUS_LABEL = { pass: "通过", fail: "未通过" } as const;
export const REVIEW_STATUS_LABEL = {
  success: "成功",
  fail: "失败",
  reviewing: "正在审核",
} as const;

export const INFO_WORK_TYPE_LABEL = {
  software: "软件",
  work: "作品",
  dataset: "数据作品",
} as const;

export const DCI_NAME_LABEL = "作品名称";
export const DCI_SUBJECT_LABEL = "著作权人/作品名称";

export function isSampleVerifyKind(kind: DciVerifyKind): boolean {
  return kind === "sample_file" || kind === "sample_hash";
}

/** 列表「提交内容」摘要（对齐 customer /verify/dci） */
export function formatDciSubmitSummary(result: DciUsageRecord): string {
  if (result.verifyKind === "sample_file") {
    return (result.fileName || result.queryName || "").trim() || "—";
  }
  if (result.verifyKind === "sample_hash") {
    return (result.queryName || "").trim() || "—";
  }
  const code = (result.dciCode || "").trim();
  const who = (result.queryOwner || result.queryName || "").trim();
  if (code && who) return `${code} · ${who}`;
  if (code) return code;
  if (who) return who;
  return "—";
}

/** 详情抽屉「提交信息」行 */
export function dciSubmittedFieldRows(result: DciUsageRecord) {
  if (result.verifyKind === "sample_file") {
    return [
      {
        label: "作品样本文件名",
        value: (result.fileName || result.queryName || "").trim() || "—",
        field: "fileName" as const,
      },
    ];
  }
  if (result.verifyKind === "sample_hash") {
    return [
      {
        label: "作品样本哈希值",
        value: (result.queryName || "").trim() || "—",
        field: "hash" as const,
      },
    ];
  }
  const who = (result.queryOwner || result.queryName || "").trim() || "—";
  return [
    { label: "DCI 码", value: result.dciCode || "—", field: "dciCode" as const },
    { label: DCI_SUBJECT_LABEL, value: who, field: "subject" as const },
  ];
}

export const CERT_MISMATCH_LABEL: Record<CertMismatchField, string> = {
  certNo: "证书编号不一致",
  workName: "软件名称不一致",
  owner: "著作权人不一致",
};

export const USAGE_DEFAULT_DAYS = 30;
export const USAGE_PAGE_SIZES = [10, 20, 30, 50] as const;
export const USAGE_DEFAULT_VERIFIER = "admin2";

const ACCOUNTS = [
  { customerId: "1", account: "acme_corp", companyName: "艾克米文化传媒有限公司" },
  { customerId: "2", account: "north_press", companyName: "北方出版集团股份有限公司" },
  { customerId: "3", account: "pixel_lab", companyName: "像素实验室（深圳）有限公司" },
  { customerId: "101", account: "zhilian_sz", companyName: "前海智链科技有限公司" },
  { customerId: "4", account: "ocean_music", companyName: "瀚海音乐文化有限公司" },
] as const;

function pick(i: number): AccountRef {
  return { ...ACCOUNTS[i % ACCOUNTS.length]! };
}

function daysAgo(n: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 12, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function demoCertImage(label: string, tone: "ok" | "warn" | "info"): string {
  const bg = tone === "ok" ? "#e8f5ee" : tone === "warn" ? "#fef3e8" : "#e8f1fb";
  const accent = tone === "ok" ? "#1a7f4b" : tone === "warn" ? "#c26a16" : "#0b62b8";
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="480" viewBox="0 0 360 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="360" height="480" fill="url(#g)"/>
  <rect x="24" y="24" width="312" height="432" rx="12" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="6 4" opacity="0.55"/>
  <circle cx="180" cy="120" r="42" fill="${accent}" opacity="0.15"/>
  <circle cx="180" cy="120" r="28" fill="none" stroke="${accent}" stroke-width="3"/>
  <text x="180" y="128" text-anchor="middle" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="18" font-weight="700" fill="${accent}">证</text>
  <text x="180" y="210" text-anchor="middle" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="20" font-weight="700" fill="#1a2b3c">版权登记证书</text>
  <text x="180" y="248" text-anchor="middle" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="13" fill="#5a6b7c">${label}</text>
  <rect x="72" y="290" width="216" height="10" rx="5" fill="${accent}" opacity="0.18"/>
  <rect x="96" y="318" width="168" height="8" rx="4" fill="#c5d0db" opacity="0.7"/>
  <rect x="110" y="342" width="140" height="8" rx="4" fill="#c5d0db" opacity="0.55"/>
  <text x="180" y="420" text-anchor="middle" font-family="Segoe UI, Microsoft YaHei, sans-serif" font-size="11" fill="#8a9aac">演示样张 · 仅供预览</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function formatDciFailReasons(result: DciUsageRecord): string[] {
  if (result.detailStatus === "pass") return [];
  if (result.detailStatus === "not_found") {
    return [result.message || "DCI不存在"];
  }
  if (result.mismatches?.length) {
    return result.mismatches.map((f) =>
      f === "owner" ? "著作权人不一致" : `${DCI_NAME_LABEL}不一致`,
    );
  }
  return result.message ? [result.message] : ["核验未通过"];
}

export function formatInfoFailReasons(result: InfoUsageRecord): string[] {
  if (result.detailStatus === "match") return [];
  if (result.detailStatus === "not_found") {
    return [result.message || "未找到该登记号"];
  }
  if (result.mismatches?.length) {
    return result.mismatches.map((f) =>
      f === "owner" ? "著作权人不一致" : `${INFO_WORK_TYPE_LABEL[result.workType]}名称不一致`,
    );
  }
  return result.message ? [result.message] : ["登记信息与系统记录不一致"];
}

export function formatCertFailReasons(result: CertUsageRecord): string[] {
  if (result.status === "pass") return [];
  if (result.mismatches?.length) {
    return result.mismatches.map((f) => CERT_MISMATCH_LABEL[f]);
  }
  return result.message ? [result.message] : ["证书信息与登记库不一致"];
}

function infoNameLabel(workType: UsageWorkType) {
  return workType === "software"
    ? "软件名称"
    : workType === "work"
      ? "作品名称"
      : "数据作品名称";
}

/** 结果区仅展示用户提交过的字段；合并提交时合并为单一「著作权人/名称」 */
export function infoSubmittedFieldRows(result: InfoUsageRecord) {
  const rows: { label: string; value: string; field: "regNo" | "name" | "owner" | "subject" }[] = [
    { label: "登记号", value: result.regNo || "—", field: "regNo" },
  ];
  const name = (result.name || "").trim();
  const owner = (result.owner || "").trim();
  if (name && owner && name.toLowerCase() === owner.toLowerCase()) {
    rows.push({
      label: `著作权人/${infoNameLabel(result.workType)}`,
      value: owner,
      field: "subject",
    });
  } else if (name || owner) {
    // 合并字段提交：只展示一个值，不拼接两侧
    rows.push({
      label: `著作权人/${infoNameLabel(result.workType)}`,
      value: owner || name,
      field: "subject",
    });
  }
  return rows;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export { copyText };

/** 与 customer `dci.ts` DCI_MOCK 保持一致（真实 DCI 码格式） */
const DCI_MOCK = {
  swDemo: "DCI:RQZSW0ANT.156.20250115B2C4D6E8F0",
  wkDemo: "DCI:RQZWK0ANT.156.20240620M2N4P6Q8R0",
  dsDemo: "DCI:RQZDS0ANT.156.20250301X2Y4Z6A8B0",
  swRec1: "DCI:RQZ010ANT.156.20240318A7K3M9P2Q1",
  swRec2: "DCI:RQZ011ANT.156.20230901H4J6K8L0M2",
  wkRec1: "DCI:RQZWK1ANT.156.20240208G1H3J5K7L9",
  dsRec1: "DCI:RQZDS1ANT.156.20240712S1T3U5V7W9",
  unknown: "DCI:RQZUNKANT.156.20240101C0D0E0F0G1",
  sampleHashPass: "a5fcfdb5bacd146cd9881cca1b7d8402",
} as const;

const DCI_SAMPLE_FAIL_HINT =
  "请确认提交的作品样本是否为 DCI 申领时上传的作品样本，以及内容是否正确。";

const DCI_RECORDS: DciUsageRecord[] = [
  {
    id: "dci-1",
    ...pick(0),
    verifyCode: "R1138840000979",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(1, 14, 22),
    dciCode: DCI_MOCK.swRec1,
    workType: "software",
    queryName: "版权核验助手",
    queryOwner: "版权核验助手",
    channel: "WebUI",
    verifyKind: "code",
    status: "pass",
    detailStatus: "pass",
  },
  {
    id: "dci-2",
    ...pick(1),
    verifyCode: "R1138840000980",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(2, 9, 15),
    dciCode: DCI_MOCK.wkRec1,
    workType: "work",
    queryName: "极光之城",
    queryOwner: "极光之城",
    channel: "API",
    verifyKind: "code",
    status: "pass",
    detailStatus: "pass",
  },
  {
    id: "dci-3",
    ...pick(2),
    verifyCode: "R1138840000983",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(3, 16, 40),
    dciCode: DCI_MOCK.swRec1,
    workType: "software",
    queryName: "错误著作权人",
    queryOwner: "错误著作权人",
    channel: "WebUI",
    verifyKind: "code",
    status: "fail",
    detailStatus: "fail",
    mismatches: ["owner"],
    message: "著作权人不一致",
  },
  {
    id: "dci-4",
    ...pick(3),
    verifyCode: "R1138840000984",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(5, 11, 8),
    dciCode: DCI_MOCK.swRec2,
    workType: "software",
    queryName: "合同比对引擎",
    queryOwner: "合同比对引擎",
    channel: "API",
    verifyKind: "code",
    status: "pass",
    detailStatus: "pass",
  },
  {
    id: "dci-5",
    ...pick(0),
    verifyCode: "R1138840000982",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(8, 18, 3),
    dciCode: DCI_MOCK.unknown,
    workType: "software",
    queryName: "某科技有限公司",
    queryOwner: "某科技有限公司",
    channel: "WebUI",
    verifyKind: "code",
    status: "fail",
    detailStatus: "not_found",
    message: "系统中无该DCI码记录",
  },
  {
    id: "dci-6",
    ...pick(4),
    verifyCode: "R1138840000981",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(12, 10, 55),
    dciCode: DCI_MOCK.dsRec1,
    workType: "dataset",
    queryName: "开源图像标注集",
    queryOwner: "开源图像标注集",
    channel: "API",
    verifyKind: "code",
    status: "pass",
    detailStatus: "pass",
  },
  {
    id: "dci-7",
    ...pick(0),
    verifyCode: "R1138840000985",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(1, 11, 5),
    dciCode: "",
    workType: "work",
    queryName: "申领作品样本.pdf",
    queryOwner: "",
    channel: "WebUI",
    verifyKind: "sample_file",
    fileName: "申领作品样本.pdf",
    status: "pass",
    detailStatus: "pass",
  },
  {
    id: "dci-8",
    ...pick(2),
    verifyCode: "R1138840000986",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(2, 15, 40),
    dciCode: "",
    workType: "work",
    queryName: "deadbeefcafebabe0123456789abcdef",
    queryOwner: "",
    channel: "API",
    verifyKind: "sample_hash",
    status: "fail",
    detailStatus: "fail",
    message: DCI_SAMPLE_FAIL_HINT,
  },
];

const INFO_RECORDS: InfoUsageRecord[] = [
  {
    id: "info-1",
    ...pick(0),
    verifyCode: "I2145500000101",
    verifiedAt: daysAgo(1, 15, 10),
    workType: "software",
    regNo: "2024SR001234",
    name: "版权核验助手",
    owner: "版权核验助手",
    channel: "WebUI",
    status: "pass",
    detailStatus: "match",
  },
  {
    id: "info-2",
    ...pick(1),
    verifyCode: "I2145500000102",
    verifiedAt: daysAgo(2, 11, 20),
    workType: "work",
    regNo: "2024ZP001234",
    name: "极光之城",
    owner: "极光之城",
    channel: "API",
    status: "pass",
    detailStatus: "match",
  },
  {
    id: "info-3",
    ...pick(2),
    verifyCode: "I2145500000103",
    verifiedAt: daysAgo(4, 9, 40),
    workType: "dataset",
    regNo: "2024SJ001234",
    name: "开源图像标注集-改",
    owner: "开源图像标注集-改",
    channel: "WebUI",
    status: "fail",
    detailStatus: "mismatch",
    mismatches: ["name"],
    message: "数据作品名称不一致",
  },
  {
    id: "info-4",
    ...pick(3),
    verifyCode: "I2145500000104",
    verifiedAt: daysAgo(7, 13, 5),
    workType: "software",
    regNo: "2023SR998877",
    name: "智链核验平台",
    owner: "智链核验平台",
    channel: "API",
    status: "pass",
    detailStatus: "match",
  },
  {
    id: "info-5",
    ...pick(4),
    verifyCode: "I2145500000105",
    verifiedAt: daysAgo(14, 17, 30),
    workType: "work",
    regNo: "2024ZP009999",
    name: "李四",
    owner: "李四",
    channel: "WebUI",
    status: "fail",
    detailStatus: "not_found",
    message: "未找到该登记号",
  },
];

const CERT_RECORDS: CertUsageRecord[] = [
  {
    id: "cert-1",
    ...pick(0),
    verifyCode: "R1187530000885",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(1, 12, 0),
    fileName: "软著证书-版权核验助手.pdf",
    fileUrl: demoCertImage("2024SR001234", "ok"),
    channel: "WebUI",
    status: "pass",
    recognition: {
      certTitleNo: "软著登字第17467968号",
      workName: "版权核验助手",
      owner: "艾克米文化传媒有限公司",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2024-03-15",
      registerNo: "2024SR001234",
    },
  },
  {
    id: "cert-2",
    ...pick(1),
    verifyCode: "R1187530000887",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(3, 14, 18),
    fileName: "证书扫描件.jpg",
    fileUrl: demoCertImage("2024SR005566", "info"),
    channel: "API",
    status: "pass",
    recognition: {
      certTitleNo: "软著登字第18221005号",
      workName: "在线学习系统",
      owner: "北方出版集团股份有限公司",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2024-05-10",
      registerNo: "2024SR005566",
    },
  },
  {
    id: "cert-3",
    ...pick(2),
    verifyCode: "R1187530000886",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(6, 9, 45),
    fileName: "fail-证书.png",
    fileUrl: demoCertImage("R11.png", "warn"),
    channel: "WebUI",
    status: "fail",
    recognition: {
      certTitleNo: "软著登字第16328001号",
      workName: "基于深度学习的流量特征智能分析与异常检测系统V1.0",
      owner: "像素实验室（深圳）有限公司",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2026-02-09",
      registerNo: "2026SR0253687",
    },
    mismatches: ["certNo", "workName"],
    message: "证书编号不一致、软件名称不一致",
  },
  {
    id: "cert-4",
    ...pick(3),
    verifyCode: "R1187530000888",
    verifier: USAGE_DEFAULT_VERIFIER,
    verifiedAt: daysAgo(10, 16, 22),
    fileName: "智链软著登字.pdf",
    fileUrl: demoCertImage("2023SR998877", "ok"),
    channel: "API",
    status: "pass",
    recognition: {
      certTitleNo: "软著登字第16399001号",
      workName: "智链核验平台",
      owner: "前海智链科技有限公司",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2023-11-20",
      registerNo: "2023SR998877",
    },
  },
];

const REVIEW_RECORDS: ReviewUsageRecord[] = [
  {
    id: "rev-1",
    ...pick(0),
    submittedAt: daysAgo(1, 17, 10),
    finishedAt: daysAgo(1, 17, 12),
    taskId: "WR20260819171000421",
    apiName: "疑似侵权审核",
    status: "success",
    resultSummary: "未发现明显疑似侵权风险，可继续后续登记流程。",
  },
  {
    id: "rev-2",
    ...pick(1),
    submittedAt: daysAgo(1, 16, 55),
    finishedAt: null,
    taskId: "WR20260819165500388",
    apiName: "内容安全审核",
    status: "reviewing",
    resultSummary: "任务仍在审核中，请稍后再次查询。",
  },
  {
    id: "rev-3",
    ...pick(2),
    submittedAt: daysAgo(2, 16, 30),
    finishedAt: daysAgo(2, 16, 31),
    taskId: "WR20260819163000291",
    apiName: "作品登记查重",
    status: "success",
    resultSummary: "与已登记样本比对通过，未检出高度雷同样本。",
  },
  {
    id: "rev-4",
    ...pick(3),
    submittedAt: daysAgo(3, 15, 22),
    finishedAt: daysAgo(3, 15, 25),
    taskId: "WR20260819152200156",
    apiName: "疑似侵权审核",
    status: "fail",
    resultSummary: "检出疑似肖像/商标风险，建议人工复核后处理。",
  },
  {
    id: "rev-5",
    ...pick(4),
    submittedAt: daysAgo(5, 14, 55),
    finishedAt: null,
    taskId: "WR20260819145500102",
    apiName: "作品登记查重",
    status: "reviewing",
    resultSummary: "任务仍在审核中，请稍后再次查询。",
  },
  {
    id: "rev-6",
    ...pick(0),
    submittedAt: daysAgo(8, 13, 20),
    finishedAt: daysAgo(8, 13, 20),
    taskId: "WR20260819132000087",
    apiName: "内容安全审核",
    status: "fail",
    resultSummary: "检出内容安全风险，任务失败。",
  },
];

export function listDciUsageRecords() {
  return DCI_RECORDS.slice().sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
}

export function listInfoUsageRecords() {
  return INFO_RECORDS.slice().sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
}

export function listCertUsageRecords() {
  return CERT_RECORDS.slice().sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
}

export function listReviewUsageRecords() {
  return REVIEW_RECORDS.slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function defaultUsageDateRange(days = USAGE_DEFAULT_DAYS) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}
