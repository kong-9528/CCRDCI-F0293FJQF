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
  fail: "核验失败",
};

export const CERT_MISMATCH_LABEL: Record<CertMismatchField, string> = {
  certNo: "证书编号不一致",
  workName: "软件名称不一致",
  owner: "著作权人不一致",
};

export const CERT_DEFAULT_VERIFIER = "admin2";
export const CERT_DEFAULT_DAYS = 30;
export const CERT_EXPORT_LIMIT = 5000;
export const PAGE_SIZES = [10, 20, 30, 50] as const;
export const CERT_MAX_BYTES = 10 * 1024 * 1024;

export function formatCertFailReasons(result: CertVerifyResult): string[] {
  if (result.status === "pass") return [];
  if (result.mismatches?.length) {
    return result.mismatches.map((f) => CERT_MISMATCH_LABEL[f]);
  }
  return result.message ? [result.message] : ["证书信息与登记库不一致"];
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

const SEED: Omit<CertVerifyResult, "id">[] = [
  {
    verifyCode: "R1187530000885",
    verifier: CERT_DEFAULT_VERIFIER,
    certNo: "2024SR001234",
    workName: "智慧OA系统",
    owner: "北京天宇科技",
    registerDate: "2024-03-15",
    status: "pass",
    verifiedAt: daysAgo(1),
    channel: "WebUI",
    fileName: "certificate-001.jpg",
    fileKind: "image",
    fileUrl: demoCertImage("2024SR001234", "ok"),
    recognition: {
      certTitleNo: "软著登字第17467968号",
      workName: "智慧OA系统",
      owner: "北京天宇科技",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2024-03-15",
      registerNo: "2024SR001234",
    },
  },
  {
    verifyCode: "R1187530000886",
    verifier: CERT_DEFAULT_VERIFIER,
    certNo: "2099SR000001",
    workName: "错误软件名称",
    owner: "深圳创新科技",
    registerDate: "2023-08-20",
    status: "fail",
    verifiedAt: daysAgo(3),
    channel: "WebUI",
    fileName: "R11.png",
    fileKind: "image",
    fileUrl: demoCertImage("R11.png", "warn"),
    recognition: {
      certTitleNo: "软著登字第16328001号",
      workName: "基于深度学习的流量特征智能分析与异常检测系统V1.0",
      owner: "国家电网有限公司客户服务中心",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2026-02-09",
      registerNo: "2026SR0253687",
    },
    mismatches: ["certNo", "workName"],
    message: "证书编号不一致、软件名称不一致",
  },
  {
    verifyCode: "R1187530000887",
    verifier: CERT_DEFAULT_VERIFIER,
    certNo: "2024SR005566",
    workName: "在线学习系统",
    owner: "上海云端教育",
    registerDate: "2024-05-10",
    status: "pass",
    verifiedAt: daysAgo(5),
    channel: "API",
    fileName: "study-cert.pdf",
    fileKind: "pdf",
    fileUrl: demoCertImage("2024SR005566 · PDF", "info"),
    recognition: {
      certTitleNo: "软著登字第18221005号",
      workName: "在线学习系统",
      owner: "上海云端教育",
      acquireMethod: "原始取得",
      rightScope: "全部权利",
      registerDate: "2024-05-10",
      registerNo: "2024SR005566",
    },
  },
];

export let MOCK_CERT_RECORDS: CertVerifyResult[] = SEED.map((item, i) => ({
  ...item,
  id: `cert-${i + 1}`,
}));

/** 模拟 OCR：根据文件名或随机选取演示数据 */
export async function ocrCertFile(file: File): Promise<CertOcrDraft> {
  await new Promise((r) => setTimeout(r, 600));
  const fileKind = detectCertFileKind(file.name);
  const fileUrl =
    fileKind === "image" ? URL.createObjectURL(file) : demoCertImage(file.name, "info");
  const lower = file.name.toLowerCase();
  if (lower.includes("fail") || lower.includes("invalid")) {
    return {
      fileName: file.name,
      fileUrl,
      fileKind,
      recognition: {
        certTitleNo: "软著登字第00000000号",
        workName: "无法识别作品",
        owner: "未知",
        acquireMethod: "原始取得",
        rightScope: "全部权利",
        registerDate: "2099-01-01",
        registerNo: "2099SR000000",
      },
    };
  }
  const hit = REGISTRY["2024SR001234"];
  return {
    fileName: file.name,
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

  const mismatches: CertMismatchField[] = [];
  if (!hit) {
    mismatches.push("certNo");
  } else {
    if (normCompare(recognition.workName) !== normCompare(hit.workName)) {
      mismatches.push("workName");
    }
    if (normCompare(recognition.owner) !== normCompare(hit.owner)) {
      mismatches.push("owner");
    }
  }

  const pass = Boolean(hit && mismatches.length === 0);

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
  if (file.size > CERT_MAX_BYTES) return "单文件不超过 10MB";
  return null;
}
