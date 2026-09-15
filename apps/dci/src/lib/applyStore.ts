import type { ServiceKind } from "@/lib/serviceAccess";

export type RegistryOrgType = "内容平台" | "专业服务";

export type RegistryApplyForm = {
  orgName: string;
  orgPinyin: string;
  /** 组织机构代码 */
  orgCode: string;
  orgAddress: string;
  inviteCode: string;
  orgType: RegistryOrgType;
  cooperationField: string;
  contractStart: string;
  contractEnd: string;
  contractFileName: string;
  contactName: string;
  contactPhone: string;
};

export type TechApplyForm = {
  companyName: string;
  /** 组织机构代码（原统一社会信用代码） */
  orgCode: string;
  companyAddress: string;
  inviteCode: string;
  cooperationField: string;
  contractStart: string;
  contractEnd: string;
  contractFileName: string;
  contactName: string;
  contactPhone: string;
};

export type ApplyHistoryItem = {
  id: string;
  kind: ServiceKind;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  summary: string;
  rejectionReason?: string;
};

const FORM_KEY = "dci-portal-apply-forms";
const HISTORY_KEY = "dci-portal-apply-history";

type FormStore = Record<
  string,
  {
    registry?: RegistryApplyForm;
    tech?: TechApplyForm;
    registryRejectReason?: string;
    techRejectReason?: string;
  }
>;

function readForms(): FormStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(FORM_KEY) || "{}") as FormStore;
  } catch {
    return {};
  }
}

function writeForms(store: FormStore) {
  window.localStorage.setItem(FORM_KEY, JSON.stringify(store));
}

function readHistory(): ApplyHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]") as ApplyHistoryItem[];
  } catch {
    return [];
  }
}

function writeHistory(items: ApplyHistoryItem[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
}

export const EMPTY_REGISTRY_FORM: RegistryApplyForm = {
  orgName: "",
  orgPinyin: "",
  orgCode: "",
  orgAddress: "",
  inviteCode: "",
  orgType: "内容平台",
  cooperationField: "",
  contractStart: "",
  contractEnd: "",
  contractFileName: "",
  contactName: "",
  contactPhone: "",
};

export const EMPTY_TECH_FORM: TechApplyForm = {
  companyName: "",
  orgCode: "",
  companyAddress: "",
  inviteCode: "",
  cooperationField: "",
  contractStart: "",
  contractEnd: "",
  contractFileName: "",
  contactName: "",
  contactPhone: "",
};

/** 演示账号默认预填（未本地保存时） */
export function defaultRegistryForm(username: string): RegistryApplyForm {
  if (username === "mayi" || username === "mayi2") {
    return {
      ...EMPTY_REGISTRY_FORM,
      orgName: "太极计算机股份有限公司",
      orgPinyin: "taijijisuanjigufenyouxiangongsi",
      orgCode: "91110000710934001X",
      orgAddress: "北京市海淀区",
      inviteCode: "YQ2026001",
      orgType: "专业服务",
      cooperationField: "数字版权登记与数据运营",
      contractStart: "2026-01-01",
      contractEnd: "2027-12-31",
      contractFileName: "合同附件.pdf",
      contactName: "张三",
      contactPhone: "13800008000",
    };
  }
  if (username === "mayi1") {
    return {
      ...EMPTY_REGISTRY_FORM,
      orgName: "太极计算机股份有限公司",
      orgPinyin: "taijijisuanjigufenyouxiangongsi",
      orgCode: "91110000710934002Y",
      orgAddress: "北京市海淀区",
      inviteCode: "YQ2026002",
      orgType: "内容平台",
      cooperationField: "数字内容发行",
      contractStart: "2026-02-01",
      contractEnd: "2027-01-31",
      contractFileName: "合同附件.pdf",
      contactName: "李四",
      contactPhone: "13800008001",
    };
  }
  if (username === "yachang") {
    return {
      ...EMPTY_REGISTRY_FORM,
      orgName: "雅昌文化集团",
      orgPinyin: "yachangwenhuajituan",
      orgCode: "91110000710933999Z",
      orgAddress: "北京市海淀区上地七街12号",
      inviteCode: "22222",
      orgType: "内容平台",
      cooperationField: "摄影作品、书法作品、美术作品...",
      contractStart: "2026-08-04",
      contractEnd: "2026-09-04",
      contractFileName: "合同附件.pdf",
      contactName: "李雅昌",
      contactPhone: "13800138001",
    };
  }
  return { ...EMPTY_REGISTRY_FORM };
}

export function defaultTechForm(username: string): TechApplyForm {
  if (username === "mayi" || username === "mayi1" || username === "mayi2") {
    return {
      ...EMPTY_TECH_FORM,
      companyName: "太极计算机股份有限公司",
      orgCode: "91110000710934001X",
      companyAddress: "北京市海淀区",
      inviteCode: "TS2026001",
      cooperationField: "版权核验与内容安全审核",
      contractStart: "2026-01-01",
      contractEnd: "2026-12-31",
      contractFileName: "技术服务合同.pdf",
      contactName: username === "mayi1" ? "李四" : "张三",
      contactPhone: username === "mayi1" ? "13800008001" : "13800008000",
    };
  }
  return { ...EMPTY_TECH_FORM };
}

export function loadRegistryForm(username: string): RegistryApplyForm {
  const saved = readForms()[username]?.registry as (RegistryApplyForm & { creditCode?: string }) | undefined;
  if (!saved) return defaultRegistryForm(username);
  const { creditCode, ...rest } = saved;
  return {
    ...EMPTY_REGISTRY_FORM,
    ...rest,
    orgCode: saved.orgCode || creditCode || "",
  };
}

export function saveRegistryForm(username: string, form: RegistryApplyForm) {
  const store = readForms();
  store[username] = { ...store[username], registry: form };
  writeForms(store);
}

export function loadTechForm(username: string): TechApplyForm {
  const saved = readForms()[username]?.tech as (TechApplyForm & { creditCode?: string }) | undefined;
  if (!saved) return defaultTechForm(username);
  const { creditCode, ...rest } = saved;
  return {
    ...EMPTY_TECH_FORM,
    ...rest,
    orgCode: saved.orgCode || creditCode || "",
  };
}

export function saveTechForm(username: string, form: TechApplyForm) {
  const store = readForms();
  store[username] = { ...store[username], tech: form };
  writeForms(store);
}

export function getRejectReason(username: string, kind: ServiceKind) {
  const row = readForms()[username];
  if (kind === "registry") {
    return row?.registryRejectReason || "资料不完整，请补充合同及机构证明材料后重新提交。";
  }
  return row?.techRejectReason || "邀请码无效或合同信息与主体不一致，请修改后重新提交。";
}

export function setRejectReason(username: string, kind: ServiceKind, reason: string) {
  const store = readForms();
  store[username] = {
    ...store[username],
    ...(kind === "registry" ? { registryRejectReason: reason } : { techRejectReason: reason }),
  };
  writeForms(store);
}

export function listApplyHistory(username: string, kind: ServiceKind) {
  return readHistory().filter((h) => h.id.startsWith(`${username}:${kind}:`));
}

export function pushApplyHistory(username: string, item: Omit<ApplyHistoryItem, "id"> & { id?: string }) {
  const id = item.id || `${username}:${item.kind}:${Date.now()}`;
  const next: ApplyHistoryItem = { ...item, id };
  const all = readHistory().filter((h) => h.id !== id);
  all.unshift(next);
  writeHistory(all);
  return next;
}

export function markHistoryWithdrawn(username: string, kind: ServiceKind) {
  const all = readHistory();
  let changed = false;
  for (const h of all) {
    if (h.id.startsWith(`${username}:${kind}:`) && (h.status === "pending")) {
      h.status = "withdrawn";
      changed = true;
      break;
    }
  }
  if (changed) writeHistory(all);
}
