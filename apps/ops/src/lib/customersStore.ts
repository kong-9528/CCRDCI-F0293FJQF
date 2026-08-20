import { useEffect, useState } from "react";
import {
  MOCK_CUSTOMERS,
  MOCK_OP_LOGS,
  derivePeriodStatus,
  deriveServiceStatus,
  productName,
  type AccountStatus,
  type CustomerAccount,
  type CustomerOpLog,
  type ProductServiceConfig,
  type ProductUsageStat,
} from "@/lib/catalog";

let customers: CustomerAccount[] = structuredClone(MOCK_CUSTOMERS);
let opLogs: CustomerOpLog[] = structuredClone(MOCK_OP_LOGS);
let seq = 100;
let logSeq = 100;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getCustomers(): CustomerAccount[] {
  return customers;
}

export function getCustomerById(id: string): CustomerAccount | undefined {
  return customers.find((c) => c.id === id);
}

export function isAccountTaken(account: string, excludeId?: string): boolean {
  const a = account.trim().toLowerCase();
  return customers.some(
    (c) => c.account.toLowerCase() === a && c.id !== excludeId,
  );
}

export function createCustomer(
  input: Omit<CustomerAccount, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: AccountStatus;
  },
): CustomerAccount {
  seq += 1;
  const stamp = nowStamp();
  const row: CustomerAccount = {
    ...input,
    id: String(seq),
    status: input.status ?? "enabled",
    createdAt: stamp,
    updatedAt: stamp,
  };
  customers = [row, ...customers];
  appendLog({
    customerId: row.id,
    action: "create",
    summary: "创建客户账号",
    changes: [
      { field: "账号", before: "—", after: row.account },
      { field: "公司全称", before: "—", after: row.companyName },
      {
        field: "开通产品",
        before: "—",
        after: row.productServices.map((s) => productName(s.product)).join("、") || "无",
      },
    ],
    operator: "运营管理员",
  });
  emit();
  return row;
}

export function updateCustomer(
  id: string,
  next: CustomerAccount,
  changes: CustomerOpLog["changes"],
  action: CustomerOpLog["action"] = "edit",
  summary = "编辑客户信息",
): CustomerAccount | null {
  const idx = customers.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const stamp = nowStamp();
  const row = { ...next, id, updatedAt: stamp };
  customers = customers.map((c) => (c.id === id ? row : c));
  if (changes.length) {
    appendLog({
      customerId: id,
      action,
      summary,
      changes,
      operator: "运营管理员",
    });
  }
  emit();
  return row;
}

export function setCustomerStatus(id: string, status: AccountStatus): void {
  const cur = getCustomerById(id);
  if (!cur || cur.status === status) return;
  updateCustomer(
    id,
    { ...cur, status },
    [
      {
        field: "状态",
        before: cur.status === "enabled" ? "已启用" : "已停用",
        after: status === "enabled" ? "已启用" : "已停用",
      },
    ],
    status === "enabled" ? "enable" : "disable",
    status === "enabled" ? "启用账号" : "停用账号",
  );
}

function appendLog(
  input: Omit<CustomerOpLog, "id" | "at"> & { at?: string },
) {
  logSeq += 1;
  opLogs = [
    {
      id: `log-${logSeq}`,
      at: input.at ?? nowStamp(),
      customerId: input.customerId,
      action: input.action,
      summary: input.summary,
      changes: input.changes,
      operator: input.operator,
    },
    ...opLogs,
  ];
}

export function getCustomerLogs(customerId: string): CustomerOpLog[] {
  return opLogs.filter((l) => l.customerId === customerId);
}

export function getCustomerUsage(customer: CustomerAccount): ProductUsageStat[] {
  return customer.productServices.map((svc) => ({
    account: customer.account,
    product: svc.product,
    serviceStatus: deriveServiceStatus(svc),
    totalCalls: svc.usedCount,
    successRate: svc.usedCount === 0 ? 100 : Math.min(99.8, 92 + (svc.usedCount % 7)),
  }));
}

export function listPeriodStatus(c: CustomerAccount) {
  return derivePeriodStatus(c.contractStart, c.contractEnd);
}

export function useCustomerStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    customers: getCustomers(),
    getById: getCustomerById,
    create: createCustomer,
    update: updateCustomer,
    setStatus: setCustomerStatus,
    getLogs: getCustomerLogs,
    getUsage: getCustomerUsage,
    isAccountTaken,
  };
}

export function describeService(svc: ProductServiceConfig): string {
  const quota =
    svc.quotaType === "unlimited"
      ? "不限量"
      : `总量 ${svc.quotaTotal ?? 0}`;
  return `${productName(svc.product)}｜${quota}｜${svc.startDate}~${svc.endDate}${svc.stopped ? "｜已停止" : ""}`;
}
