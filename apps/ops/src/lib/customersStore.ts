import { useEffect, useState } from "react";
import {
  MOCK_CUSTOMERS,
  MOCK_OP_LOGS,
  deriveAccountContractPeriod,
  deriveServiceStatus,
  ensureCustomerContracts,
  productName,
  withContractSummary,
  type AccountStatus,
  type ContractFile,
  type CustomerAccount,
  type CustomerContract,
  type CustomerOpLog,
  type ProductServiceConfig,
  type ProductUsageStat,
  type QuotaType,
} from "@/lib/catalog";
import {
  diffProductConfig,
  validateProductConfig,
  type ProductConfigState,
} from "@/lib/productConfig";
import { parseProductServices } from "@/lib/customerForm";

let customers: CustomerAccount[] = structuredClone(MOCK_CUSTOMERS).map(ensureCustomerContracts);
let opLogs: CustomerOpLog[] = structuredClone(MOCK_OP_LOGS);
let seq = 100;
let logSeq = 100;
let contractSeq = 1000;

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
  const contracts = (input.contracts ?? []).map((ct) => ({
    ...ct,
    id: ct.id || `ct-${seq}-${++contractSeq}`,
    createdAt: ct.createdAt || stamp,
    updatedAt: ct.updatedAt || stamp,
  }));
  if (contracts.length === 0 && (input.contractStart || input.contractEnd)) {
    contracts.push({
      id: `ct-${seq}-${++contractSeq}`,
      contractNo: `HT${String(seq).padStart(6, "0")}`,
      startDate: input.contractStart,
      endDate: input.contractEnd,
      amount: input.contractAmount,
      files: [...(input.contractFiles ?? [])],
      createdAt: stamp,
      updatedAt: stamp,
    });
  }
  const row = withContractSummary({
    ...input,
    id: String(seq),
    contracts,
    status: input.status ?? "enabled",
    createdAt: stamp,
    updatedAt: stamp,
  });
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
  const row = withContractSummary({ ...next, id, updatedAt: stamp });
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

export type ContractInput = {
  contractNo: string;
  startDate: string;
  endDate: string;
  amount: number | null;
  files: ContractFile[];
};

function validateContractInput(input: ContractInput): string | null {
  const no = input.contractNo.trim();
  if (!no) return "请输入合同编号";
  if (no.length > 200) return "合同编号不能超过 200 个字符";
  if (!input.startDate || !input.endDate) return "请填写合作起止日期";
  if (input.startDate > input.endDate) return "合作开始日期不能晚于结束日期";
  if (input.amount != null && (!Number.isFinite(input.amount) || input.amount < 0)) {
    return "合同总金额须为非负数字";
  }
  return null;
}

export function addCustomerContract(
  customerId: string,
  input: ContractInput,
): string | null {
  const cur = getCustomerById(customerId);
  if (!cur) return "客户不存在";
  const err = validateContractInput(input);
  if (err) return err;
  const stamp = nowStamp();
  const nextContract: CustomerContract = {
    id: `ct-${++contractSeq}`,
    contractNo: input.contractNo.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    amount: input.amount,
    files: [...input.files],
    createdAt: stamp,
    updatedAt: stamp,
  };
  updateCustomer(
    customerId,
    { ...cur, contracts: [...cur.contracts, nextContract] },
    [
      {
        field: "合同",
        before: "—",
        after: `${nextContract.contractNo}｜${nextContract.startDate}~${nextContract.endDate}`,
      },
    ],
    "edit",
    "新增合同",
  );
  return null;
}

export function updateCustomerContract(
  customerId: string,
  contractId: string,
  input: ContractInput,
): string | null {
  const cur = getCustomerById(customerId);
  if (!cur) return "客户不存在";
  const before = cur.contracts.find((c) => c.id === contractId);
  if (!before) return "合同不存在";
  const err = validateContractInput(input);
  if (err) return err;
  const stamp = nowStamp();
  const nextContracts = cur.contracts.map((c) =>
    c.id === contractId
      ? {
          ...c,
          contractNo: input.contractNo.trim(),
          startDate: input.startDate,
          endDate: input.endDate,
          amount: input.amount,
          files: [...input.files],
          updatedAt: stamp,
        }
      : c,
  );
  updateCustomer(
    customerId,
    { ...cur, contracts: nextContracts },
    [
      {
        field: `合同·${input.contractNo.trim()}`,
        before: `${before.contractNo}｜${before.startDate}~${before.endDate}`,
        after: `${input.contractNo.trim()}｜${input.startDate}~${input.endDate}`,
      },
    ],
    "edit",
    "修改合同",
  );
  return null;
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
  }));
}

export function listContractPeriod(c: CustomerAccount) {
  return deriveAccountContractPeriod(c.contracts);
}

export function listPeriodStatus(c: CustomerAccount) {
  return listContractPeriod(c).status;
}

export function saveCustomerProductConfig(
  customerId: string,
  state: ProductConfigState,
): string | null {
  const cur = getCustomerById(customerId);
  if (!cur) return "客户不存在";

  const validationError = validateProductConfig(state);
  if (validationError) return validationError;

  const parsed = parseProductServices(state.productRows);
  if (!parsed.ok) return parsed.error;

  for (const existing of cur.productServices) {
    if (!parsed.value.some((svc) => svc.product === existing.product)) {
      return `不可移除已开通产品「${productName(existing.product)}」`;
    }
  }

  const nextServices = parsed.value.map((svc) => {
    const existing = cur.productServices.find((s) => s.product === svc.product);
    return {
      ...svc,
      usedCount: existing?.usedCount ?? 0,
    };
  });

  for (const svc of nextServices) {
    if (svc.quotaType === "total" && svc.quotaTotal != null && svc.quotaTotal < svc.usedCount) {
      return `产品「${productName(svc.product)}」的新额度不能小于已用次数 ${svc.usedCount}`;
    }
  }

  const next: CustomerAccount = {
    ...cur,
    productServices: nextServices,
  };

  const changes = diffProductConfig(cur, state.productRows);

  updateCustomer(
    customerId,
    next,
    changes.length ? changes : [{ field: "产品服务配置", before: "—", after: "已更新" }],
    "service",
    "编辑产品服务配置",
  );
  return null;
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
    saveProductConfig: saveCustomerProductConfig,
    addContract: addCustomerContract,
    updateContract: updateCustomerContract,
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
