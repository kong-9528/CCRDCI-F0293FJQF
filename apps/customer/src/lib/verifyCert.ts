import { daysAgo as demoDaysAgo, nowStamp as demoNowStamp } from "@/lib/demoClock";

export type CertVerifyStatus = "pass" | "fail";

export type CertFileKind = "image" | "pdf";

/** 失败时标记不一致的字段 */
export type CertMismatchField = "certNo" | "workName" | "owner";

export type CertRecognition = {
  /** 证书号，如 软著登字第…号 */
  certTitleNo: string;
  workName: string;
  owner: string;
  acquireMethod: string;
  rightScope: string;
  registerDate: string;
  /** 登记号 */
  registerNo: string;
};

export type CertOcrDraft = {
  fileName: string;
  fileUrl: string;
  fileKind: CertFileKind;
  /** OCR 识别结果（用户可在确认弹窗中修改） */
  recognition: CertRecognition;
};

export type CertVerifyResult = {
  id: string;
  verifyCode: string;
  verifier: string;
  certNo: string;
  workName: string;
  owner: string;
  registerDate: string;
  status: CertVerifyStatus;
  verifiedAt: string;
  channel: "WebUI" | "API";
  fileName: string;
  fileUrl: string;
  fileKind: CertFileKind;
  recognition: CertRecognition;
  mismatches?: CertMismatchField[];
  message?: string;
};

export const CERT_STATUS_LABEL: Record<CertVerifyStatus, string> = {
  pass: "核验通过",
  fail: "核验不通过",
};

export const CERT_RECOGNITION_FIELDS: { key: keyof CertRecognition; label: string }[] = [
  { key: "certTitleNo", label: "证书号" },
  { key: "workName", label: "软件名称" },
  { key: "owner", label: "著作权人" },
  { key: "acquireMethod", label: "权利取得方式" },
  { key: "rightScope", label: "权利范围" },
  { key: "registerDate", label: "登记日期" },
  { key: "registerNo", label: "登记号" },
];

export const CERT_MISMATCH_LABEL: Record<CertMismatchField, string> = {
  certNo: "证书编号不一致",
  workName: "软件名称不一致",
  owner: "著作权人不一致",
};

export const CERT_DEFAULT_VERIFIER = "admin2";
export const CERT_DEFAULT_DAYS = 30;
export const CERT_EXPORT_LIMIT = 5000;
export const PAGE_SIZES = [10, 20, 30, 50] as const;
export const CERT_MAX_BYTES = 100 * 1024 * 1024;

export function formatCertFailReasons(result: CertVerifyResult): string[] {
  if (result.status === "pass") return [];
  if (result.mismatches?.length) {
    return result.mismatches.map((f) => CERT_MISMATCH_LABEL[f]);
  }
  return result.message ? [result.message] : ["证书信息与登记库不一致"];
}

function daysAgo(n: number, hour = 10, minute = 0) {
  return demoDaysAgo(n, hour, minute);
}

function nowStamp() {
  return demoNowStamp();
}

function normCompare(a: string) {
  return a.trim().toLowerCase().replace(/\s+/g, "");
}

let seq = 100;

function nextVerifyCode() {
  seq += 1;
  const n = String(1187530000000 + seq).padStart(13, "0");
  return `R${n}`;
}

/** 演示用证书缩略图（SVG data URL） */
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

export function detectCertFileKind(fileName: string): CertFileKind {
  return /\.pdf$/i.test(fileName) ? "pdf" : "image";
}

const REGISTRY: Record<
  string,
  { workName: string; owner: string; registerDate: string; certTitleNo: string }
> = {
  "2024SR001234": {
    workName: "智慧OA系统",
    owner: "北京天宇科技",
    registerDate: "2024-03-15",
    certTitleNo: "软著登字第17467968号",
  },
  "2023SR009876": {
    workName: "数字区块平台V3",
    owner: "深圳创新科技",
    registerDate: "2023-08-20",
    certTitleNo: "软著登字第16328001号",
  },
};

type CertSeed = Omit<CertVerifyResult, "id">;

function certSeedPass(opts: {
  code: string;
  days: number;
  hour?: number;
  minute?: number;
  channel: "WebUI" | "API";
  registerNo: string;
  workName: string;
  owner: string;
  registerDate: string;
  certTitleNo: string;
  fileName: string;
  fileKind: CertFileKind;
  tone?: "ok" | "info";
  verifier?: string;
}): CertSeed {
  const hour = opts.hour ?? 10;
  const minute = opts.minute ?? 0;
  return {
    verifyCode: opts.code,
    verifier: opts.verifier ?? CERT_DEFAULT_VERIFIER,
    certNo: opts.registerNo,
    workName: opts.workName,
    owner: opts.owner,
    registerDate: opts.registerDate,
    status: "pass",
    verifiedAt: daysAgo(opts.days, hour, minute),
    channel: opts.channel,
    fileName: opts.fileName,
    fileKind: opts.fileKind,
    fileUrl: demoCertImage(opts.registerNo, opts.tone ?? "ok"),
    recognition: {
      certTitleNo: opts.certTitleNo,
      workName: opts.workName,
      owner: opts.owner,
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: opts.registerDate,
      registerNo: opts.registerNo,
    },
  };
}

/** 默认种子；beijian 账号默认查询近 30 日需 >10 条，故补齐至 12 条 */
const SEED: CertSeed[] = [
  certSeedPass({
    code: "R1187530000985",
    days: 0,
    hour: 12,
    minute: 5,
    channel: "WebUI",
    registerNo: "2024SR088801",
    workName: "检察业务辅助系统",
    owner: "北京市人民检察院",
    registerDate: "2024-06-18",
    certTitleNo: "软著登字第19467968号",
    fileName: "软著证书-检察业务辅助系统.pdf",
    fileKind: "pdf",
    verifier: "beijian",
  }),
  certSeedPass({
    code: "R1187530000988",
    days: 1,
    hour: 15,
    minute: 20,
    channel: "API",
    registerNo: "2025SR010088",
    workName: "案件材料管理系统",
    owner: "北京市人民检察院",
    registerDate: "2025-01-20",
    certTitleNo: "软著登字第20110088号",
    fileName: "软著证书-案件材料管理系统.pdf",
    fileKind: "pdf",
    tone: "info",
    verifier: "beijian",
  }),
  {
    verifyCode: "R1187530000989",
    verifier: "beijian",
    certNo: "2024ZP088810",
    workName: "公开课课件合集",
    owner: "北京市人民检察院",
    registerDate: "2024-09-12",
    status: "fail",
    verifiedAt: daysAgo(2, 10, 8),
    channel: "WebUI",
    fileName: "证书扫描-公开课课件.pdf",
    fileKind: "pdf",
    fileUrl: demoCertImage("2024ZP088810", "warn"),
    recognition: {
      certTitleNo: "作登字第18881088号",
      workName: "公开课课件合集V2",
      owner: "北京市人民检察院",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2024-09-12",
      registerNo: "2024ZP088810",
    },
    mismatches: ["workName"],
    message: "软件名称不一致",
  },
  certSeedPass({
    code: "R1187530000986",
    days: 3,
    hour: 14,
    minute: 18,
    channel: "API",
    registerNo: "2024ZP088802",
    workName: "法治宣传短片",
    owner: "北京市人民检察院",
    registerDate: "2024-08-10",
    certTitleNo: "作登字第18221088号",
    fileName: "证书扫描件-法治宣传.jpg",
    fileKind: "image",
    tone: "info",
    verifier: "beijian",
  }),
  {
    verifyCode: "R1187530000987",
    verifier: "beijian",
    certNo: "2026SR0253688",
    workName: "检察业务辅助系统V2.0",
    owner: "北京市人民检察院",
    registerDate: "2026-02-09",
    status: "fail",
    verifiedAt: daysAgo(5, 9, 45),
    channel: "WebUI",
    fileName: "fail-证书-bj.png",
    fileKind: "image",
    fileUrl: demoCertImage("BJ-fail", "warn"),
    recognition: {
      certTitleNo: "软著登字第16328088号",
      workName: "检察业务辅助系统V2.0",
      owner: "北京市人民检察院",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2026-02-09",
      registerNo: "2026SR0253688",
    },
    mismatches: ["certNo", "workName"],
    message: "证书编号不一致、软件名称不一致",
  },
  certSeedPass({
    code: "R1187530000990",
    days: 7,
    hour: 11,
    minute: 12,
    channel: "WebUI",
    registerNo: "2024SR088820",
    workName: "证据材料电子化平台",
    owner: "北京市人民检察院",
    registerDate: "2024-11-02",
    certTitleNo: "软著登字第19550020号",
    fileName: "软著证书-证据材料电子化平台.pdf",
    fileKind: "pdf",
    verifier: "beijian",
  }),
  certSeedPass({
    code: "R1187530000991",
    days: 9,
    hour: 16,
    minute: 40,
    channel: "API",
    registerNo: "2025SR010120",
    workName: "检察公开案例检索系统",
    owner: "北京市人民检察院",
    registerDate: "2025-03-08",
    certTitleNo: "软著登字第20120120号",
    fileName: "软著证书-公开案例检索.pdf",
    fileKind: "pdf",
    tone: "info",
    verifier: "beijian",
  }),
  {
    verifyCode: "R1187530000992",
    verifier: "beijian",
    certNo: "2024SR088899",
    workName: "案件材料管理系统",
    owner: "错误著作权人",
    registerDate: "2025-01-20",
    status: "fail",
    verifiedAt: daysAgo(12, 13, 5),
    channel: "WebUI",
    fileName: "证书-著作权人不一致.jpg",
    fileKind: "image",
    fileUrl: demoCertImage("owner-mismatch", "warn"),
    recognition: {
      certTitleNo: "软著登字第20110088号",
      workName: "案件材料管理系统",
      owner: "北京市人民检察院",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2025-01-20",
      registerNo: "2025SR010088",
    },
    mismatches: ["owner"],
    message: "著作权人不一致",
  },
  certSeedPass({
    code: "R1187530000993",
    days: 15,
    hour: 9,
    minute: 30,
    channel: "API",
    registerNo: "2023SR077701",
    workName: "检察办公协同套件",
    owner: "北京市人民检察院",
    registerDate: "2023-12-01",
    certTitleNo: "软著登字第16887701号",
    fileName: "软著证书-办公协同套件.pdf",
    fileKind: "pdf",
    verifier: "beijian",
  }),
  certSeedPass({
    code: "R1187530000994",
    days: 18,
    hour: 17,
    minute: 8,
    channel: "WebUI",
    registerNo: "2024ZP088830",
    workName: "法治微视频合集",
    owner: "北京市人民检察院",
    registerDate: "2024-07-22",
    certTitleNo: "作登字第18221030号",
    fileName: "作品证书-法治微视频.jpg",
    fileKind: "image",
    tone: "info",
    verifier: "beijian",
  }),
  certSeedPass({
    code: "R1187530000995",
    days: 22,
    hour: 10,
    minute: 55,
    channel: "API",
    registerNo: "2025SR010200",
    workName: "检务公开数据看板",
    owner: "北京市人民检察院",
    registerDate: "2025-05-16",
    certTitleNo: "软著登字第20130200号",
    fileName: "软著证书-检务公开数据看板.pdf",
    fileKind: "pdf",
    verifier: "beijian",
  }),
  {
    verifyCode: "R1187530000996",
    verifier: "beijian",
    certNo: "2099SR000099",
    workName: "不存在的证书",
    owner: "北京市人民检察院",
    registerDate: "2024-01-01",
    status: "fail",
    verifiedAt: daysAgo(26, 14, 22),
    channel: "WebUI",
    fileName: "invalid-cert.png",
    fileKind: "image",
    fileUrl: demoCertImage("invalid", "warn"),
    recognition: {
      certTitleNo: "软著登字第00000000号",
      workName: "不存在的证书",
      owner: "北京市人民检察院",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2024-01-01",
      registerNo: "2099SR000099",
    },
    mismatches: ["certNo"],
    message: "证书编号不一致",
  },
];

export let MOCK_CERT_RECORDS: CertVerifyResult[] = SEED.map((item, i) => ({
  ...item,
  id: `cert-${i + 1}`,
}));

export type CertSelectedFile = {
  file: File;
  fileName: string;
  fileUrl: string;
  fileKind: CertFileKind;
};

/** 选择文件后生成本地预览（尚未 OCR） */
export function createCertSelectedFile(file: File): CertSelectedFile {
  const fileKind = detectCertFileKind(file.name);
  const fileUrl =
    fileKind === "image" ? URL.createObjectURL(file) : demoCertImage(file.name, "info");
  return { file, fileName: file.name, fileUrl, fileKind };
}

/** 模拟 OCR：根据文件名选取演示数据；可复用已生成的预览 URL */
export async function ocrCertFile(
  file: File,
  preset?: Pick<CertSelectedFile, "fileUrl" | "fileKind" | "fileName">,
): Promise<CertOcrDraft> {
  await new Promise((r) => setTimeout(r, 900));
  const fileKind = preset?.fileKind ?? detectCertFileKind(file.name);
  const fileName = preset?.fileName ?? file.name;
  const fileUrl =
    preset?.fileUrl ??
    (fileKind === "image" ? URL.createObjectURL(file) : demoCertImage(file.name, "info"));
  const lower = fileName.toLowerCase();
  if (lower.includes("fail") || lower.includes("invalid") || lower.includes("missing")) {
    return {
      fileName,
      fileUrl,
      fileKind,
      recognition: {
        certTitleNo: "软著登字第15947675号",
        workName: "众创指购AI智能解梦分析系统",
        owner: "厦门众创指购科技股份有限公司",
        acquireMethod: "原始取得",
        rightScope: "全部权利",
        registerDate: "2025-07-17",
        registerNo: "2025SR1291477",
      },
    };
  }
  const hit = REGISTRY["2024SR001234"]!;
  return {
    fileName,
    fileUrl,
    fileKind,
    recognition: {
      certTitleNo: hit.certTitleNo,
      workName: hit.workName,
      owner: hit.owner,
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: hit.registerDate,
      registerNo: "2024SR001234",
    },
  };
}

export async function confirmCertVerify(draft: CertOcrDraft): Promise<CertVerifyResult> {
  await new Promise((r) => setTimeout(r, 420));
  const recognition: CertRecognition = {
    certTitleNo: draft.recognition.certTitleNo.trim(),
    workName: draft.recognition.workName.trim(),
    owner: draft.recognition.owner.trim(),
    acquireMethod: draft.recognition.acquireMethod.trim() || "原始取得",
    rightScope: draft.recognition.rightScope.trim() || "全部权利",
    registerDate: draft.recognition.registerDate.trim(),
    registerNo: draft.recognition.registerNo.trim(),
  };
  const hit = REGISTRY[recognition.registerNo];
  const verifyCode = nextVerifyCode();

  if (!hit) {
    const result: CertVerifyResult = {
      id: `cert-${seq}`,
      verifyCode,
      verifier: CERT_DEFAULT_VERIFIER,
      certNo: recognition.registerNo,
      workName: recognition.workName,
      owner: recognition.owner,
      registerDate: recognition.registerDate,
      status: "fail",
      verifiedAt: nowStamp(),
      channel: "WebUI",
      fileName: draft.fileName,
      fileUrl: draft.fileUrl,
      fileKind: draft.fileKind,
      recognition,
      message: "证书不存在",
    };
    MOCK_CERT_RECORDS = [result, ...MOCK_CERT_RECORDS];
    return result;
  }

  const mismatches: CertMismatchField[] = [];
  if (normCompare(recognition.workName) !== normCompare(hit.workName)) {
    mismatches.push("workName");
  }
  if (normCompare(recognition.owner) !== normCompare(hit.owner)) {
    mismatches.push("owner");
  }
  if (normCompare(recognition.certTitleNo) !== normCompare(hit.certTitleNo)) {
    mismatches.push("certNo");
  }

  const pass = mismatches.length === 0;

  const result: CertVerifyResult = {
    id: `cert-${seq}`,
    verifyCode,
    verifier: CERT_DEFAULT_VERIFIER,
    certNo: recognition.registerNo,
    workName: recognition.workName,
    owner: recognition.owner,
    registerDate: recognition.registerDate,
    status: pass ? "pass" : "fail",
    verifiedAt: nowStamp(),
    channel: "WebUI",
    fileName: draft.fileName,
    fileUrl: draft.fileUrl,
    fileKind: draft.fileKind,
    recognition,
    mismatches: pass ? undefined : mismatches,
    message: pass ? undefined : mismatches.map((f) => CERT_MISMATCH_LABEL[f]).join("、"),
  };

  MOCK_CERT_RECORDS = [result, ...MOCK_CERT_RECORDS];
  return result;
}

export function isCertFileAllowed(file: File): string | null {
  const okExt = /\.(pdf|jpe?g|png)$/i.test(file.name);
  if (!okExt) return "仅支持 PDF、JPG、PNG 格式";
  if (file.size > CERT_MAX_BYTES) return "请上传 100M 以内的文件";
  return null;
}
