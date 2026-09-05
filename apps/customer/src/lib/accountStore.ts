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

let profile: TenantProfile = { ...MOCK_TENANT };
let contract: TenantContract = primaryContract();
let history: ApplyHistoryRecord[] = sortHistory(MOCK_APPLY_HISTORY);
let applyStatus: ApplyHistoryStatus = history[0]?.status ?? "approved";

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

export function getApplyStatus() {
  return applyStatus;
}

export function validateAccountDraft(form: AccountProfileDraft): string | null {
  if (!form.companyName.trim()) return "请填写机构名称";
  if (!form.creditCode.trim()) return "请填写统一社会信用代码";
  if (!form.address.trim()) return "请填写联系地址";
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
  if (idx >= 0) {
    history = history.map((r, i) => (i === idx ? { ...r, status: "withdrawn" as const } : r));
  }
  applyStatus = "withdrawn";
  emit();
  return { ok: true };
}

/** 保存机构信息；已撤回/不通过时会重新提交进入审核中 */
export function saveAccountProfile(
  draft: AccountProfileDraft,
): { ok: true; resubmitted: boolean } | { ok: false; error: string } {
  if (applyStatus === "pending") {
    return { ok: false, error: "申请审核中，请先撤回后再编辑" };
  }
  const err = validateAccountDraft(draft);
  if (err) return { ok: false, error: err };

  const nextProfile: TenantProfile = {
    companyName: draft.companyName.trim(),
    creditCode: draft.creditCode.trim(),
    address: draft.address.trim(),
    contactName: draft.contactName.trim(),
    contactPhone: draft.contactPhone.replace(/[\s-]/g, "").trim(),
  };
  const nextFiles = draft.contractFiles.map((f) => ({ ...f }));
  contract = {
    ...contract,
    startDate: draft.contractStart.trim(),
    endDate: draft.contractEnd.trim(),
    files: nextFiles,
  };
  profile = nextProfile;

  const shouldResubmit = applyStatus === "withdrawn" || applyStatus === "rejected";
  if (shouldResubmit) {
    const stamp = nowStamp();
    const record: ApplyHistoryRecord = {
      id: `ah-${Date.now()}`,
      submittedAt: stamp,
      status: "pending",
      companyName: nextProfile.companyName,
      creditCode: nextProfile.creditCode,
      address: nextProfile.address,
      contractStart: contract.startDate,
      contractEnd: contract.endDate,
      contractFiles: nextFiles,
      contactName: nextProfile.contactName,
      contactPhone: nextProfile.contactPhone,
    };
    history = [record, ...history];
    applyStatus = "pending";
  }

  emit();
  return { ok: true, resubmitted: shouldResubmit };
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
  };
}
