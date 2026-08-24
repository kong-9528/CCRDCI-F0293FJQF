export type CertVerifyStatus = "pass" | "fail";

export type CertOcrDraft = {
  certNo: string;
  workName: string;
  owner: string;
  registerDate: string;
  fileName: string;
};

export type CertVerifyResult = {
  id: string;
  certNo: string;
  workName: string;
  owner: string;
  registerDate: string;
  status: CertVerifyStatus;
  verifiedAt: string;
  channel: "WebUI" | "API";
  fileName: string;
  message?: string;
};

export const CERT_STATUS_LABEL: Record<CertVerifyStatus, string> = {
  pass: "核验通过",
  fail: "核验失败",
};

export const CERT_DEFAULT_DAYS = 30;
export const PAGE_SIZES = [10, 20, 30, 50] as const;
export const CERT_MAX_BYTES = 10 * 1024 * 1024;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

const REGISTRY: Record<string, Omit<CertOcrDraft, "fileName">> = {
  "2024SR001234": {
    certNo: "2024SR001234",
    workName: "智慧OA系统",
    owner: "北京天宇科技",
    registerDate: "2024-03-15",
  },
  "2023SR009876": {
    certNo: "2023SR009876",
    workName: "数字区块平台V3",
    owner: "深圳创新科技",
    registerDate: "2023-08-20",
  },
};

const SEED: Omit<CertVerifyResult, "id">[] = [
  {
    certNo: "2024SR001234",
    workName: "智慧OA系统",
    owner: "北京天宇科技",
    registerDate: "2024-03-15",
    status: "pass",
    verifiedAt: daysAgo(1),
    channel: "WebUI",
    fileName: "certificate-001.pdf",
  },
  {
    certNo: "2023SR009876",
    workName: "数字区块平台V3",
    owner: "深圳创新科技",
    registerDate: "2023-08-20",
    status: "fail",
    verifiedAt: daysAgo(3),
    channel: "WebUI",
    fileName: "cert-scan.png",
    message: "证书信息与登记库不一致",
  },
  {
    certNo: "2024SR005566",
    workName: "在线学习系统",
    owner: "上海云端教育",
    registerDate: "2024-05-10",
    status: "pass",
    verifiedAt: daysAgo(5),
    channel: "WebUI",
    fileName: "study-cert.pdf",
  },
];

let seq = 100;
export let MOCK_CERT_RECORDS: CertVerifyResult[] = SEED.map((item, i) => ({
  ...item,
  id: `cert-${i + 1}`,
}));

/** 模拟 OCR：根据文件名或随机选取演示数据 */
export async function ocrCertFile(file: File): Promise<CertOcrDraft> {
  await new Promise((r) => setTimeout(r, 600));
  const lower = file.name.toLowerCase();
  if (lower.includes("fail") || lower.includes("invalid")) {
    return {
      certNo: "2099SR000000",
      workName: "无法识别作品",
      owner: "未知",
      registerDate: "2099-01-01",
      fileName: file.name,
    };
  }
  const hit = REGISTRY["2024SR001234"];
  return { ...hit, fileName: file.name };
}

export async function confirmCertVerify(draft: CertOcrDraft): Promise<CertVerifyResult> {
  await new Promise((r) => setTimeout(r, 420));
  seq += 1;
  const hit = REGISTRY[draft.certNo];
  const pass = Boolean(hit && hit.workName === draft.workName && hit.owner === draft.owner);

  const result: CertVerifyResult = {
    id: `cert-${seq}`,
    certNo: draft.certNo,
    workName: draft.workName,
    owner: draft.owner,
    registerDate: draft.registerDate,
    status: pass ? "pass" : "fail",
    verifiedAt: nowStamp(),
    channel: "WebUI",
    fileName: draft.fileName,
    message: pass ? undefined : "证书信息与登记库不一致",
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
