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
  type QuotaType,
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
        field: "账号状态",
        before: cur.status === "enabled" ? "已启用" : "已停用",
        after: status === "enabled" ? "已启用" : "已停用",
      },
    ],
    status === "enabled" ? "enable" : "disable",
    status === "enabled" ? "启用账号" : "停用账号",
  );
}

export function updateCustomerProductService(
  customerId: string,
  product: ProductServiceConfig["product"],
  patch: {
    quotaType: QuotaType;
    quotaTotal: number | null;
    startDate: string;
    endDate: string;
  },
): string | null {
  const cur = getCustomerById(customerId);
  if (!cur) return "客户不存在";
  const before = cur.productServices.find((s) => s.product === product);
  if (!before) return "服务项不存在";

  if (!patch.startDate || !patch.endDate) return "请填写产品有效期";
  if (patch.startDate > patch.endDate) return "有效期开始不能晚于结束";

  if (patch.quotaType === "total") {
    const total = patch.quotaTotal ?? 0;
    if (!Number.isInteger(total) || total <= 0) return "按总量时，额度须为正整数";
    if (total < before.usedCount) {
      return `新额度不能小于已用次数 ${before.usedCount}`;
    }
  }

  const nextSvc: ProductServiceConfig = {
    ...before,
    quotaType: patch.quotaType,
    quotaTotal: patch.quotaType === "unlimited" ? null : patch.quotaTotal,
    startDate: patch.startDate,
    endDate: patch.endDate,
  };

  const next: CustomerAccount = {
    ...cur,
    productServices: cur.productServices.map((s) =>
      s.product === product ? nextSvc : s,
    ),
  };

  const changes: { field: string; before: string; after: string }[] = [];
  const bq = before.quotaType === "unlimited" ? "不限量" : `总量 ${before.quotaTotal}`;
  const aq =
    nextSvc.quotaType === "unlimited" ? "不限量" : `总量 ${nextSvc.quotaTotal}`;
  if (bq !== aq) {
    changes.push({
      field: `${productName(product)}·额度`,
      before: bq,
      after: aq,
    });
  }
  const br = `${before.startDate}~${before.endDate}`;
  const ar = `${nextSvc.startDate}~${nextSvc.endDate}`;
  if (br !== ar) {
    changes.push({
      field: `${productName(product)}·有效期`,
      before: br,
      after: ar,
    });
  }

  updateCustomer(
    customerId,
    next,
    changes.length ? changes : [{ field: productName(product), before: "—", after: "已更新" }],
    "service",
    "编辑产品服务项",
  );
  return null;
}

export function addCustomerProductService(
  customerId: string,
  input: {
    product: ProductServiceConfig["product"];
    quotaType: QuotaType;
    quotaTotal: number | null;
    startDate: string;
    endDate: string;
  },
): string | null {
  const cur = getCustomerById(customerId);
  if (!cur) return "客户不存在";
  if (cur.productServices.some((s) => s.product === input.product)) {
    return "该客户已开通此产品";
  }
  if (!input.startDate || !input.endDate) return "请填写产品有效期";
  if (input.startDate > input.endDate) return "有效期开始不能晚于结束";

  let quotaTotal: number | null = null;
  if (input.quotaType === "total") {
    const total = input.quotaTotal ?? 0;
    if (!Number.isInteger(total) || total <= 0) return "按总量时，额度须为正整数";
    quotaTotal = total;
  }

  const nextSvc: ProductServiceConfig = {
    product: input.product,
    quotaType: input.quotaType,
    quotaTotal,
    usedCount: 0,
    startDate: input.startDate,
    endDate: input.endDate,
    stopped: false,
  };

  const next: CustomerAccount = {
    ...cur,
    productServices: [...cur.productServices, nextSvc],
  };

  const quotaLabel =
    nextSvc.quotaType === "unlimited" ? "不限量" : `总量 ${nextSvc.quotaTotal}`;
  updateCustomer(
    customerId,
    next,
    [
      {
        field: `产品·${productName(input.product)}`,
        before: "未开通",
        after: `${quotaLabel}｜${nextSvc.startDate}~${nextSvc.endDate}`,
      },
    ],
    "service",
    "新增产品服务项",
  );
  return null;
}

export function setCustomerProductStopped(
  customerId: string,
  product: ProductServiceConfig["product"],
  stopped: boolean,
): boolean {
  const cur = getCustomerById(customerId);
  if (!cur) return false;
  const before = cur.productServices.find((s) => s.product === product);
  if (!before || before.stopped === stopped) return false;
  const next: CustomerAccount = {
    ...cur,
    productServices: cur.productServices.map((s) =>
      s.product === product ? { ...s, stopped } : s,
    ),
  };
  updateCustomer(
    customerId,
    next,
    [
      {
        field: productName(product),
        before: before.stopped ? "已停止" : "可使用",
        after: stopped ? "已停止" : "已恢复",
      },
    ],
    "service",
    stopped ? "停止产品服务" : "恢复产品服务",
  );
  return true;
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
    updateProductService: updateCustomerProductService,
    addProductService: addCustomerProductService,
    setProductStopped: setCustomerProductStopped,
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
