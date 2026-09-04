import { useEffect, useState } from "react";
import type { ProductCode } from "@/lib/catalog";

/**
 * 控制台访问门禁：
 * - unsubmitted：外系统已注册账号，尚未提交入驻申请
 * - pending：已提交，待运营审核（可撤回）
 * - rejected：审核未通过（可查看原因并重新提交）
 * - approved：审核通过，开放完整控制台
 *
 * 演示：默认未提交，便于联调申请流；通过页内「演示」操作或 localStorage 切换。
 */
export type AccessStatus = "unsubmitted" | "pending" | "rejected" | "approved";

export type OnboardingContractFile = {
  id: string;
  name: string;
  size: number;
};

export type OnboardingApplication = {
  id: string;
  /** draft：已填写/撤回后待提交；pending：审核中；rejected：已驳回 */
  status: "draft" | "pending" | "rejected";
  /** 统一社会信用代码（选填，仅企业通常有） */
  creditCode: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  address: string;
  contractNo: string;
  contractFiles: OnboardingContractFile[];
  contractStart: string;
  contractEnd: string;
  contractAmount: number | null;
  /** 外系统已注册的登录账号（只读展示） */
  account: string;
  requestedProducts: ProductCode[];
  submittedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
};

export type OnboardingFormInput = {
  creditCode: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  address: string;
  contractNo: string;
  contractFiles: OnboardingContractFile[];
  contractStart: string;
  contractEnd: string;
  contractAmount: string;
  requestedProducts: ProductCode[];
};

const STORAGE_KEY = "ctp.customer.accessStatus";
const APP_STORAGE_KEY = "ctp.customer.onboardingApplication";

/** 外系统已登录的控制台账号（演示） */
export const EXTERNAL_LOGIN_ACCOUNT = "pending_user";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function readAccessStatus(): AccessStatus {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "unsubmitted" || v === "pending" || v === "rejected" || v === "approved") {
      return v;
    }
  } catch {
    /* ignore */
  }
  return "unsubmitted";
}

function writeAccessStatus(status: AccessStatus) {
  try {
    localStorage.setItem(STORAGE_KEY, status);
  } catch {
    /* ignore */
  }
}

function readApplication(): OnboardingApplication | null {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingApplication;
  } catch {
    return null;
  }
}

function writeApplication(app: OnboardingApplication | null) {
  try {
    if (!app) localStorage.removeItem(APP_STORAGE_KEY);
    else localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(app));
  } catch {
    /* ignore */
  }
}

let accessStatus: AccessStatus = readAccessStatus();
let application: OnboardingApplication | null = readApplication();

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function isConsoleUnlocked() {
  return accessStatus === "approved";
}

export function getAccessStatus() {
  return accessStatus;
}

export function getOnboardingApplication() {
  return application;
}

export function emptyOnboardingForm(): OnboardingFormInput {
  return {
    creditCode: "",
    companyName: "",
    contactName: "",
    contactPhone: "",
    address: "",
    contractNo: "",
    contractFiles: [],
    contractStart: "",
    contractEnd: "",
    contractAmount: "",
    requestedProducts: [],
  };
}

export function applicationToForm(app: OnboardingApplication): OnboardingFormInput {
  return {
    creditCode: app.creditCode,
    companyName: app.companyName,
    contactName: app.contactName,
    contactPhone: app.contactPhone,
    address: app.address,
    contractNo: app.contractNo,
    contractFiles: [...app.contractFiles],
    contractStart: app.contractStart,
    contractEnd: app.contractEnd,
    contractAmount: app.contractAmount == null ? "" : String(app.contractAmount),
    requestedProducts: [...app.requestedProducts],
  };
}

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

export function isValidMobile(phone: string) {
  return /^1\d{10}$/.test(normalizePhone(phone));
}

export function validateOnboardingForm(form: OnboardingFormInput): string | null {
  if (!form.companyName.trim()) return "请填写机构名称";
  if (!form.contactName.trim()) return "请填写联系人姓名";
  if (!form.contactPhone.trim()) return "请填写联系人手机号";
  if (!isValidMobile(form.contactPhone)) return "联系人手机号格式不正确";
  if (!form.address.trim()) return "请填写联系地址";
  if (form.creditCode.trim() && form.creditCode.trim().length < 8) {
    return "统一社会信用代码格式不正确";
  }
  if (!form.contractNo.trim()) return "请填写合同编号";
  if (!form.contractStart || !form.contractEnd) return "请填写合同起止日期";
  if (form.contractStart > form.contractEnd) return "合同开始日期不能晚于结束日期";
  if (form.contractFiles.length === 0) return "请上传至少一份合同附件";
  if (form.contractAmount.trim()) {
    const n = Number(form.contractAmount);
    if (!Number.isFinite(n) || n < 0) return "合同金额须为非负数字";
  }
  return null;
}

function formToApplication(
  form: OnboardingFormInput,
  status: "draft" | "pending" | "rejected",
  prev?: OnboardingApplication | null,
): OnboardingApplication {
  const amount = form.contractAmount.trim() ? Number(form.contractAmount) : null;
  return {
    id: prev?.id ?? `app-local-${Date.now()}`,
    status,
    creditCode: form.creditCode.trim(),
    companyName: form.companyName.trim(),
    contactName: form.contactName.trim(),
    contactPhone: normalizePhone(form.contactPhone.trim()),
    address: form.address.trim(),
    contractNo: form.contractNo.trim(),
    contractFiles: [...form.contractFiles],
    contractStart: form.contractStart,
    contractEnd: form.contractEnd,
    contractAmount: amount != null && Number.isFinite(amount) ? amount : null,
    account: EXTERNAL_LOGIN_ACCOUNT,
    requestedProducts: [...form.requestedProducts],
    submittedAt: status === "pending" ? nowStamp() : prev?.submittedAt ?? "",
    reviewedAt: undefined,
    rejectReason: undefined,
  };
}

/** 提交或重新提交入驻申请 */
export function submitOnboardingApplication(
  form: OnboardingFormInput,
): { ok: true } | { ok: false; error: string } {
  if (accessStatus === "approved") {
    return { ok: false, error: "账号已开通，无需重复申请" };
  }
  if (accessStatus === "pending") {
    return { ok: false, error: "申请正在审核中，如需修改请先撤回" };
  }
  const err = validateOnboardingForm(form);
  if (err) return { ok: false, error: err };

  application = formToApplication(form, "pending", application);
  accessStatus = "pending";
  writeAccessStatus(accessStatus);
  writeApplication(application);
  emit();
  return { ok: true };
}

/** 待审核阶段撤回申请：回到待提交，保留已填字段与附件 */
export function withdrawOnboardingApplication(): { ok: true } | { ok: false; error: string } {
  if (accessStatus !== "pending" || !application) {
    return { ok: false, error: "当前没有可撤回的待审核申请" };
  }
  application = {
    ...application,
    status: "draft",
    reviewedAt: undefined,
    rejectReason: undefined,
  };
  accessStatus = "unsubmitted";
  writeAccessStatus(accessStatus);
  writeApplication(application);
  emit();
  return { ok: true };
}

/** 演示：模拟运营审核通过 */
export function demoApproveOnboarding() {
  if (accessStatus !== "pending") return;
  accessStatus = "approved";
  writeAccessStatus(accessStatus);
  emit();
}

/** 演示：模拟运营驳回 */
export function demoRejectOnboarding(reason = "提交的合同附件不完整，请补充盖章版合同后重新申请。") {
  if (accessStatus !== "pending" || !application) return;
  application = {
    ...application,
    status: "rejected",
    reviewedAt: nowStamp(),
    rejectReason: reason,
  };
  accessStatus = "rejected";
  writeAccessStatus(accessStatus);
  writeApplication(application);
  emit();
}

/** 演示：重置为未提交 */
export function demoResetOnboarding() {
  application = null;
  accessStatus = "unsubmitted";
  writeAccessStatus(accessStatus);
  writeApplication(null);
  emit();
}

/** 演示：直接设为已开通（恢复完整控制台） */
export function demoSetApproved() {
  accessStatus = "approved";
  writeAccessStatus(accessStatus);
  emit();
}

export function useOnboardingStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  return {
    accessStatus,
    application,
    unlocked: isConsoleUnlocked(),
    submitOnboardingApplication,
    withdrawOnboardingApplication,
    demoApproveOnboarding,
    demoRejectOnboarding,
    demoResetOnboarding,
    demoSetApproved,
  };
}
