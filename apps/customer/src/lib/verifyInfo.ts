export type InfoWorkType = "software" | "work" | "dataset";

export type InfoVerifyStatus = "match" | "mismatch";

export type InfoVerifyResult = {
  id: string;
  workType: InfoWorkType;
  regNo: string;
  name: string;
  owner: string;
  workCategory?: string;
  version?: string;
  status: InfoVerifyStatus;
  verifiedAt: string;
  channel: "WebUI" | "API";
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
};

export const INFO_DEFAULT_DAYS = 30;
export const INFO_EXPORT_LIMIT = 5000;
export const PAGE_SIZES = [10, 20, 30, 50] as const;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

const REGISTRY: Record<
  string,
  { workType: InfoWorkType; name: string; owner: string; workCategory?: string; version?: string }
> = {
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
};

const SEED: Omit<InfoVerifyResult, "id">[] = [
  {
    workType: "software",
    regNo: "2024SR001234",
    name: "华信OA系统",
    owner: "北京华信科技",
    version: "V2.0",
    status: "match",
    verifiedAt: daysAgo(1),
    channel: "WebUI",
  },
  {
    workType: "software",
    regNo: "2023SR009876",
    name: "数据中台V3",
    owner: "华信科技",
    status: "mismatch",
    verifiedAt: daysAgo(2),
    channel: "WebUI",
    message: "登记信息与系统记录不一致",
  },
  {
    workType: "work",
    regNo: "2024ZP001234",
    name: "春江水暖图",
    owner: "北京华信科技",
    workCategory: "美术作品",
    status: "match",
    verifiedAt: daysAgo(4),
    channel: "API",
  },
];

let seq = 100;
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

export async function verifyInfoOnce(
  workType: InfoWorkType,
  input: InfoVerifyInput,
): Promise<InfoVerifyResult> {
  await new Promise((r) => setTimeout(r, 380));
  const regNo = input.regNo.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();

  seq += 1;
  const hit = REGISTRY[regNo];
  let status: InfoVerifyStatus = "mismatch";
  let message: string | undefined = "登记信息与系统记录不一致";

  if (hit && hit.workType === workType && hit.name === name && hit.owner === owner) {
    status = "match";
    message = undefined;
  } else if (!hit) {
    message = "未找到该登记号";
  }

  const result: InfoVerifyResult = {
    id: `info-${seq}`,
    workType,
    regNo,
    name,
    owner,
    version: input.version?.trim() || hit?.version,
    workCategory: input.workCategory?.trim() || hit?.workCategory,
    status,
    verifiedAt: nowStamp(),
    channel: "WebUI",
    message,
  };

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
