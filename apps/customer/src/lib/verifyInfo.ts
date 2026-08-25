export type InfoWorkType = "software" | "work" | "dataset";

export type InfoVerifyStatus = "match" | "mismatch" | "not_found";

export type InfoMismatchField = "name" | "owner" | "workCategory";

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
  dataset: "数据集",
};

export const INFO_STATUS_LABEL: Record<InfoVerifyStatus, string> = {
  match: "匹配",
  mismatch: "未匹配",
  not_found: "未找到",
};

export const INFO_MISMATCH_LABEL: Record<InfoMismatchField, string> = {
  name: "名称",
  owner: "著作权人",
  workCategory: "作品类型",
};

export const INFO_WORK_CATEGORIES = ["美术作品", "文字作品", "音乐作品", "视听作品"] as const;

export const INFO_DEFAULT_DAYS = 30;
export const INFO_EXPORT_LIMIT = 5000;
export const PAGE_SIZES = [10, 20, 30, 50] as const;

export function infoNameLabel(workType: InfoWorkType): string {
  if (workType === "software") return "软件名称";
  if (workType === "work") return "作品名称";
  return "数据集名称";
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
    name: "用户行为数据集",
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
    workCategory: "视听作品",
    status: "mismatch",
    verifiedAt: daysAgo(5),
    channel: "WebUI",
    mismatches: ["owner", "workCategory"],
    message: "著作权人、作品类型不一致",
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
    name: "用户行为数据集",
    owner: "北京华信科技",
    status: "match",
    verifiedAt: daysAgo(6),
    channel: "API",
    snapshot: {
      name: "用户行为数据集",
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
  version?: string;
  workCategory?: string;
};

function mismatchMessage(mismatches: InfoMismatchField[], workType: InfoWorkType): string {
  const parts = mismatches.map((f) => {
    if (f === "owner") return "著作权人";
    if (f === "workCategory") return "作品类型";
    return infoNameLabel(workType);
  });
  return `${parts.join("、")}不一致`;
}

export function formatInfoMismatchTags(result: InfoVerifyResult): string {
  if (!result.mismatches?.length) return "";
  return result.mismatches
    .map((f) => {
      if (f === "owner") return "著作权人";
      if (f === "workCategory") return "作品类型";
      return infoNameLabel(result.workType);
    })
    .join("、");
}

/** 详情抽屉失败细节文案，如「作品名称不一致」 */
export function formatInfoFailReasons(result: InfoVerifyResult): string[] {
  if (result.status === "match") return [];
  if (result.status === "not_found") {
    return [result.message || "未找到该登记号"];
  }
  if (result.mismatches?.length) {
    return result.mismatches.map((f) => {
      if (f === "owner") return "著作权人不一致";
      if (f === "workCategory") return "作品类型不一致";
      return `${infoNameLabel(result.workType)}不一致`;
    });
  }
  return result.message ? [result.message] : ["登记信息与系统记录不一致"];
}

export async function verifyInfoOnce(
  workType: InfoWorkType,
  input: InfoVerifyInput,
): Promise<InfoVerifyResult> {
  await new Promise((r) => setTimeout(r, 380));
  const regNo = input.regNo.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  const version = input.version?.trim() || undefined;
  const workCategory = input.workCategory?.trim() || undefined;
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
      version,
      workCategory,
      status: "not_found",
      verifiedAt: nowStamp(),
      channel: "WebUI",
      message:
        hit && hit.workType !== workType
          ? "未找到该登记号（作品类型不匹配）"
          : "未找到该登记号",
    };
  } else {
    const snapshot = {
      name: hit.name,
      owner: hit.owner,
      workCategory: hit.workCategory,
      version: hit.version,
    };
    const mismatches: InfoMismatchField[] = [];
    if (normCompare(name) !== normCompare(hit.name)) mismatches.push("name");
    if (normCompare(owner) !== normCompare(hit.owner)) mismatches.push("owner");
    if (
      workType === "work" &&
      workCategory &&
      hit.workCategory &&
      normCompare(workCategory) !== normCompare(hit.workCategory)
    ) {
      mismatches.push("workCategory");
    }

    if (mismatches.length) {
      result = {
        id,
        verifyCode,
        workType,
        regNo,
        name,
        owner,
        version: version || hit.version,
        workCategory: workCategory || hit.workCategory,
        status: "mismatch",
        verifiedAt: nowStamp(),
        channel: "WebUI",
        mismatches,
        snapshot,
        message: mismatchMessage(mismatches, workType),
      };
    } else {
      result = {
        id,
        verifyCode,
        workType,
        regNo,
        name,
        owner,
        version: version || hit.version,
        workCategory: workCategory || hit.workCategory,
        status: "match",
        verifiedAt: nowStamp(),
        channel: "WebUI",
        snapshot,
      };
    }
  }

  MOCK_INFO_RECORDS = [result, ...MOCK_INFO_RECORDS];
  return result;
}

export function emptyInfoForm(workType: InfoWorkType): InfoVerifyInput {
  if (workType === "software") {
    return { regNo: "", name: "", owner: "", version: "" };
  }
  if (workType === "work") {
    return { regNo: "", name: "", owner: "", workCategory: "" };
  }
  return { regNo: "", name: "", owner: "" };
}

export function validateInfoForm(workType: InfoWorkType, input: InfoVerifyInput): string | null {
  if (!input.regNo.trim()) return "请填写登记号";
  if (!input.name.trim()) {
    if (workType === "software") return "请填写软件名称";
    if (workType === "work") return "请填写作品名称";
    return "请填写数据集名称";
  }
  if (!input.owner.trim()) return "请填写著作权人";
  return null;
}
