import { useEffect, useState } from "react";
import {
  MOCK_APPLY_HISTORY,
  type ApplyHistoryRecord,
  type ApplyHistoryStatus,
} from "@/lib/applyHistory";
import {
  MOCK_TENANT,
  MOCK_TENANT_CONTRACTS,
  type TenantContract,
  type TenantProfile,
} from "@/lib/tenant";

export type AccountContractFile = {
  id: string;
  name: string;
  size?: number;
};

export type AccountProfileDraft = TenantProfile & {
  contractStart: string;
  contractEnd: string;
  contractFiles: AccountContractFile[];
};

/** 工作台机构信息仅两种状态：已通过 / 审核中 */
export type AccountWorkbenchStatus = "approved" | "pending";

function sortHistory(rows: ApplyHistoryRecord[]) {
  return [...rows].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function primaryContract(): TenantContract {
  const primary =
    MOCK_TENANT_CONTRACTS.find((c) => c.periodStatus === "active") ?? MOCK_TENANT_CONTRACTS[0];
  return { ...primary, files: primary.files.map((f) => ({ ...f })) };
}

/** 工作台状态：有审核中申请则为审核中，否则为已通过 */
function deriveWorkbenchStatus(rows: ApplyHistoryRecord[]): AccountWorkbenchStatus {
  return rows.some((r) => r.status === "pending") ? "pending" : "approved";
}

let profile: TenantProfile = { ...MOCK_TENANT };
let contract: TenantContract = primaryContract();
let history: ApplyHistoryRecord[] = sortHistory(MOCK_APPLY_HISTORY);
let applyStatus: AccountWorkbenchStatus = deriveWorkbenchStatus(history);

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

export function getAccountProfile() {
  return profile;
}

export function getAccountContract() {
  return contract;
}

export function getApplyHistory() {
  return history;
}

export function getApplyStatus(): AccountWorkbenchStatus {
  return applyStatus;
}

export function validateAccountDraft(form: AccountProfileDraft): string | null {
  if (!form.cooperationField.trim()) return "请填写合作领域";
  if (form.cooperationField.trim().length > 300) return "合作领域不能超过300字";
  if (!form.companyName.trim()) return "请填写机构名称";
  if (!form.creditCode.trim()) return "请填写组织机构代码";
  if (!form.address.trim()) return "请填写机构地址";
  if (!form.contractStart.trim()) return "请填写合同开始日期";
  if (!form.contractEnd.trim()) return "请填写合同结束日期";
  if (form.contractStart > form.contractEnd) return "合同结束日期不能早于开始日期";
  if (form.contractFiles.length === 0) return "请至少上传一份合同附件";
  if (!form.contactName.trim()) return "请填写联系人";
  if (!form.contactPhone.trim()) return "请填写联系人手机号";
  if (!/^1\d{10}$/.test(form.contactPhone.replace(/[\s-]/g, ""))) {
    return "联系人手机号格式不正确";
  }
  return null;
}

export function withdrawAccountApplication(): { ok: true } | { ok: false; error: string } {
  if (applyStatus !== "pending") {
    return { ok: false, error: "当前没有可撤回的审核中申请" };
  }
  const idx = history.findIndex((r) => r.status === "pending");
  if (idx < 0) {
    return { ok: false, error: "当前没有可撤回的审核中申请" };
  }
  history = history.map((r, i) => (i === idx ? { ...r, status: "withdrawn" as const } : r));
  /** 撤回后工作台仍为已通过，展示最后一次审核通过的机构信息 */
  applyStatus = "approved";
  emit();
  return { ok: true };
}

/**
 * 编辑后提交变更申请：
 * - 不改动工作台已通过的机构信息
 * - 写入一条审核中申请记录
 * - 撤回 / 驳回仅体现在申请记录中
 */
export function saveAccountProfile(
  draft: AccountProfileDraft,
): { ok: true; resubmitted: boolean } | { ok: false; error: string } {
  if (applyStatus === "pending") {
    return { ok: false, error: "申请审核中，请先撤回后再编辑" };
  }
  const err = validateAccountDraft(draft);
  if (err) return { ok: false, error: err };

  const nextFiles = draft.contractFiles.map((f) => ({ ...f }));
  const stamp = nowStamp();
  const record: ApplyHistoryRecord = {
    id: `ah-${Date.now()}`,
    submittedAt: stamp,
    status: "pending",
    companyName: draft.companyName.trim(),
    creditCode: draft.creditCode.trim(),
    address: draft.address.trim(),
    cooperationField: draft.cooperationField.trim(),
    contractStart: draft.contractStart.trim(),
    contractEnd: draft.contractEnd.trim(),
    contractFiles: nextFiles,
    contactName: draft.contactName.trim(),
    contactPhone: draft.contactPhone.replace(/[\s-]/g, "").trim(),
  };
  history = [record, ...history];
  applyStatus = "pending";
  emit();
  return { ok: true, resubmitted: true };
}

/** 演示：运营驳回当前审核中申请（工作台仍回已通过，资料不变） */
export function rejectPendingApplication(reason: string): { ok: true } | { ok: false; error: string } {
  if (applyStatus !== "pending") {
    return { ok: false, error: "当前没有审核中的申请" };
  }
  const idx = history.findIndex((r) => r.status === "pending");
  if (idx < 0) return { ok: false, error: "当前没有审核中的申请" };
  history = history.map((r, i) =>
    i === idx
      ? { ...r, status: "rejected" as const, rejectReason: reason.trim() || "资料不符合要求，请修改后重新提交。" }
      : r,
  );
  applyStatus = "approved";
  emit();
  return { ok: true };
}

/** 演示：运营通过当前审核中申请（写入工作台机构信息） */
export function approvePendingApplication(): { ok: true } | { ok: false; error: string } {
  if (applyStatus !== "pending") {
    return { ok: false, error: "当前没有审核中的申请" };
  }
  const idx = history.findIndex((r) => r.status === "pending");
  if (idx < 0) return { ok: false, error: "当前没有审核中的申请" };
  const row = history[idx];
  history = history.map((r, i) => (i === idx ? { ...r, status: "approved" as const } : r));
  profile = {
    companyName: row.companyName,
    creditCode: row.creditCode,
    address: row.address,
    cooperationField: row.cooperationField,
    inviteCode: profile.inviteCode,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
  };
  contract = {
    ...contract,
    startDate: row.contractStart,
    endDate: row.contractEnd,
    files: row.contractFiles.map((f) => ({ ...f })),
  };
  applyStatus = "approved";
  emit();
  return { ok: true };
}

export function useAccountStore() {
  const [, tick] = useState(0);
  useEffect(() => subscribe(() => tick((n) => n + 1)), []);
  return {
    profile,
    contract,
    history,
    applyStatus,
    withdrawAccountApplication,
    saveAccountProfile,
    rejectPendingApplication,
    approvePendingApplication,
  };
}

/** 兼容历史类型引用 */
export type { ApplyHistoryStatus };
