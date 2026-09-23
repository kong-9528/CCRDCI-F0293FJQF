import { useEffect, useState } from "react";
import {
  MOCK_CUSTOMERS,
  MOCK_OP_LOGS,
  deriveAccountContractPeriod,
  deriveServiceStatus,
  ensureCustomerContracts,
  flattenServicePackages,
  isVerifyProduct,
  mergePackageAndStandaloneServices,
  productName,
  resolveAuditServicePackage,
  resolveServicePackages,
  withContractSummary,
  type AccountStatus,
  type ContractFile,
  type CustomerAccount,
  type CustomerContract,
  type CustomerOpLog,
  type ProductServiceConfig,
  type ProductUsageStat,
  type ServicePackage,
} from "@/lib/catalog";
import {
  diffProductConfig,
  parseAllServicePackages,
  validateProductConfig,
  type ProductConfigState,
} from "@/lib/productConfig";

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
    summary: "创建机构账号",
    changes: [
      { field: "账号", before: "—", after: row.account },
      { field: "机构名称", before: "—", after: row.companyName },
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
    quotaTotal: number;
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

  const total = patch.quotaTotal;
  if (!Number.isInteger(total) || total <= 0) return "授权总量须为正整数";
  if (total < before.usedCount) {
    return `授权总量不能小于已用次数 ${before.usedCount}`;
  }

  const nextSvc: ProductServiceConfig = {
    ...before,
    quotaType: "total",
    quotaTotal: total,
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
  const bq =
    before.quotaType === "unlimited" ? "不限量" : `授权总量 ${before.quotaTotal}`;
  const aq = `授权总量 ${nextSvc.quotaTotal}`;
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
    quotaTotal: number;
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

  const quotaTotal = input.quotaTotal;
  if (!Number.isInteger(quotaTotal) || quotaTotal <= 0) {
    return "授权总量须为正整数";
  }

  const nextSvc: ProductServiceConfig = {
    product: input.product,
    quotaType: "total",
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

  const quotaLabel = `授权总量 ${nextSvc.quotaTotal}`;
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

export function setCustomerPackageStopped(
  customerId: string,
  packageId: string,
  stopped: boolean,
): boolean {
  const cur = getCustomerById(customerId);
  if (!cur) return false;
  const verifyPkgs = resolveServicePackages(cur);
  const auditPkg = resolveAuditServicePackage(cur);
  const packages = [...verifyPkgs, ...(auditPkg ? [auditPkg] : [])];
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg || pkg.stopped === stopped) return false;
  if (!stopped && pkg.services.length === 0) return false;

  // 核验单元不走包级停用（请用 setCustomerProductStopped）
  const isVerify =
    pkg.services.length > 0 &&
    pkg.services.every((s) => isVerifyProduct(s.product));
  if (isVerify) return false;

  const nextPackages = packages.map((p) =>
    p.id === pkg.id ? { ...p, stopped } : p,
  );
  const next: CustomerAccount = {
    ...cur,
    servicePackages: nextPackages,
    productServices: mergePackageAndStandaloneServices(nextPackages),
  };
  updateCustomer(
    customerId,
    next,
    [
      {
        field: pkg.name || "作品智能辅助审核",
        before: pkg.stopped ? "已停止" : "可使用",
        after: stopped ? "已停止" : "已恢复",
      },
    ],
    "service",
    stopped ? "停止技术服务" : "恢复技术服务",
  );
  return true;
}

export function setCustomerProductStopped(
  customerId: string,
  product: ProductServiceConfig["product"],
  stopped: boolean,
): boolean {
  const cur = getCustomerById(customerId);
  if (!cur) return false;
  const verifyPkgs = resolveServicePackages(cur);
  const auditPkg = resolveAuditServicePackage(cur);

  if (product === "workReview" && auditPkg) {
    return setCustomerPackageStopped(customerId, auditPkg.id, stopped);
  }

  const verify = verifyPkgs[0];
  if (!verify) return false;
  const svc = verify.services.find((s) => s.product === product);
  if (!svc) return false;
  const curStopped = Boolean(svc.stopped);
  if (curStopped === stopped) return false;

  const nextVerify: ServicePackage = {
    ...verify,
    stopped: false,
    services: verify.services.map((s) =>
      s.product === product ? { ...s, stopped } : s,
    ),
  };
  const nextPackages = [
    nextVerify,
    ...(auditPkg ? [auditPkg] : []),
  ];
  const next: CustomerAccount = {
    ...cur,
    servicePackages: nextPackages,
    productServices: mergePackageAndStandaloneServices(nextPackages),
  };
  updateCustomer(
    customerId,
    next,
    [
      {
        field: productName(product),
        before: curStopped ? "已停止" : "可使用",
        after: stopped ? "已停止" : "已恢复",
      },
    ],
    "service",
    stopped ? "停止核验产品" : "恢复核验产品",
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

  const parsed = parseAllServicePackages(state, { allowEmpty: true });
  if (!parsed.ok) return parsed.error;

  const beforeVerify = resolveServicePackages(cur);
  const beforeAudit = resolveAuditServicePackage(cur);
  const beforePkgs = [...beforeVerify, ...(beforeAudit ? [beforeAudit] : [])];
  const nextPackages = parsed.value.map((pkg) => {
    const isAudit = pkg.services.some((s) => s.product === "workReview");
    const existing = beforePkgs.find((p) => {
      if (p.id === pkg.id) return true;
      const pAudit = p.services.some((s) => s.product === "workReview");
      return isAudit === pAudit;
    });
    return {
      ...pkg,
      usedCount: existing?.usedCount ?? 0,
    };
  });

  for (const pkg of nextPackages) {
    if (pkg.quotaType === "total" && pkg.quotaTotal != null && pkg.quotaTotal < pkg.usedCount) {
      return `「${pkg.name || pkg.id}」的新额度不能小于已用次数 ${pkg.usedCount}`;
    }
  }

  const next: CustomerAccount = {
    ...cur,
    servicePackages: nextPackages,
    productServices: flattenServicePackages(nextPackages),
  };

  const changes = diffProductConfig(cur, nextPackages);

  updateCustomer(
    customerId,
    next,
    changes.length ? changes : [{ field: "技术服务套餐配置", before: "—", after: "已更新" }],
    "service",
    "编辑技术服务套餐配置",
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
    setPackageStopped: setCustomerPackageStopped,
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
