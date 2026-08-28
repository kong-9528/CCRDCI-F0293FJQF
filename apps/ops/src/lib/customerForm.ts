import type {
  ContractFile,
  CustomerAccount,
  CustomerContract,
  ProductCode,
  ProductServiceConfig,
  QuotaType,
  BusinessType,
  UsageChannel,
} from "@/lib/catalog";
import {
  isVerifyProduct,
  formatBusinessTypes,
  formatUsageChannels,
  productName,
  generateStrongPassword,
  isStrongPassword,
  isValidAccount,
  primaryContract,
} from "@/lib/catalog";

export type ProductFormRow = {
  key: string;
  product: ProductCode | "";
  quotaType: QuotaType;
  quotaTotal: string;
  startDate: string;
  endDate: string;
  stopped: boolean;
  usedCount: number;
  businessTypes: BusinessType[];
  usageChannels: UsageChannel[];
  /** 本次编辑过程中新增的配置行（可移除、可改选产品） */
  isNew?: boolean;
};

export type CustomerFormState = {
  customerType: "enterprise";
  creditCode: string;
  companyName: string;
  legalPerson: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  contractNo: string;
  contractFiles: ContractFile[];
  contractStart: string;
  contractEnd: string;
  contractAmount: string;
  account: string;
  password: string;
  productServices: ProductFormRow[];
};

export function emptyProductRow(defaults?: {
  startDate?: string;
  endDate?: string;
}): ProductFormRow {
  return {
    key: `p-${Math.random().toString(36).slice(2, 9)}`,
    product: "",
    quotaType: "total",
    quotaTotal: "",
    startDate: defaults?.startDate ?? "",
    endDate: defaults?.endDate ?? "",
    stopped: false,
    usedCount: 0,
    businessTypes: [],
    usageChannels: [],
    isNew: true,
  };
}

export function emptyCustomerForm(): CustomerFormState {
  return {
    customerType: "enterprise",
    creditCode: "",
    companyName: "",
    legalPerson: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    contractNo: "",
    contractFiles: [],
    contractStart: "",
    contractEnd: "",
    contractAmount: "",
    account: "",
    password: generateStrongPassword(),
    productServices: [emptyProductRow()],
  };
}

export function customerToForm(c: CustomerAccount): CustomerFormState {
  const primary = primaryContract(c.contracts);
  return {
    customerType: "enterprise",
    creditCode: c.creditCode,
    companyName: c.companyName,
    legalPerson: c.legalPerson,
    contactName: c.contactName,
    contactPhone: c.contactPhone,
    contactEmail: c.contactEmail,
    address: c.address,
    contractNo: primary?.contractNo ?? "",
    contractFiles: [...c.contractFiles],
    contractStart: c.contractStart,
    contractEnd: c.contractEnd,
    contractAmount: c.contractAmount == null ? "" : String(c.contractAmount),
    account: c.account,
    password: "",
    productServices:
      c.productServices.length > 0
        ? c.productServices.map((s) => ({
            key: `p-${s.product}`,
            product: s.product,
            quotaType: "total",
            quotaTotal: s.quotaTotal == null ? "" : String(s.quotaTotal),
            startDate: s.startDate,
            endDate: s.endDate,
            stopped: s.stopped,
            usedCount: s.usedCount,
            businessTypes: s.businessTypes ? [...s.businessTypes] : [],
            usageChannels: s.usageChannels ? [...s.usageChannels] : [],
            isNew: false,
          }))
        : [emptyProductRow({ startDate: c.contractStart, endDate: c.contractEnd })],
  };
}

function productRowLabel(row: ProductFormRow, index: number) {
  if (row.product) {
    return `「${productName(row.product)}」`;
  }
  return `第 ${index + 1} 行配置`;
}

export function parseProductServices(
  rows: ProductFormRow[],
): { ok: true; value: ProductServiceConfig[] } | { ok: false; error: string } {
  if (rows.length === 0) {
    return { ok: false, error: "请至少配置一项产品服务" };
  }
  const seen = new Set<string>();
  const value: ProductServiceConfig[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const label = productRowLabel(r, i);
    if (!r.product) {
      return { ok: false, error: `${label}：请选择产品` };
    }
    if (seen.has(r.product)) {
      return {
        ok: false,
        error: `产品${label}只能配置一条`,
      };
    }
    seen.add(r.product);
    if (!r.quotaTotal.trim()) {
      return { ok: false, error: `${label}：请填写授权总量` };
    }
    const n = Number(r.quotaTotal);
    if (!Number.isInteger(n) || n <= 0) {
      return { ok: false, error: `${label}：授权总量须为正整数` };
    }
    if (n < r.usedCount) {
      return {
        ok: false,
        error: `${label}：授权总量不能小于已用次数 ${r.usedCount}`,
      };
    }
    const quotaTotal = n;
    if (!r.startDate && !r.endDate) {
      return { ok: false, error: `${label}：请填写有效期起止日期` };
    }
    if (!r.startDate) {
      return { ok: false, error: `${label}：请填写有效期开始日期` };
    }
    if (!r.endDate) {
      return { ok: false, error: `${label}：请填写有效期结束日期` };
    }
    if (r.startDate > r.endDate) {
      return { ok: false, error: `${label}：有效期开始日期不能晚于结束日期` };
    }
    if (isVerifyProduct(r.product)) {
      if (r.businessTypes.length === 0) {
        return { ok: false, error: `${label}：请至少选择一项开通业务类型` };
      }
      if (r.usageChannels.length === 0) {
        return { ok: false, error: `${label}：请至少选择一种产品使用方式` };
      }
    }
    const item: ProductServiceConfig = {
      product: r.product as ProductCode,
      quotaType: "total",
      quotaTotal,
      usedCount: r.usedCount,
      startDate: r.startDate,
      endDate: r.endDate,
      stopped: r.stopped,
    };
    if (isVerifyProduct(r.product)) {
      item.businessTypes = [...r.businessTypes];
      item.usageChannels = [...r.usageChannels];
    }
    value.push(item);
  }
  return { ok: true, value };
}

export type ValidateMode = "create" | "edit";

export function validateCustomerForm(
  form: CustomerFormState,
  mode: ValidateMode,
  opts?: { accountTaken?: boolean },
): string | null {
  if (!form.creditCode.trim()) return "请填写统一社会信用代码";
  if (!form.companyName.trim()) return "请填写公司全称";
  if (!form.contactName.trim()) return "请填写联系人姓名";
  if (!form.contactPhone.trim()) return "请填写联系人电话";
  if (!/^1\d{10}$/.test(form.contactPhone.trim()) && !/^0\d{2,3}-?\d{7,8}$/.test(form.contactPhone.trim())) {
    return "联系人电话格式不正确";
  }
  if (!form.contactEmail.trim()) return "请填写联系人邮箱";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
    return "联系人邮箱格式不正确";
  }
  if (mode === "create") {
    if (!form.contractNo.trim()) return "请输入合同编号";
    if (form.contractNo.trim().length > 200) return "合同编号不能超过 200 个字符";
    if (!form.contractStart || !form.contractEnd) return "请填写合作起止日期";
    if (form.contractStart > form.contractEnd) return "合作开始日期不能晚于结束日期";
    if (form.contractAmount.trim()) {
      const amount = Number(form.contractAmount);
      if (!Number.isFinite(amount) || amount < 0) return "合同总金额须为非负数字";
    }
  }

  if (mode === "create") {
    if (!isValidAccount(form.account.trim())) {
      return "账号须字母开头，仅含字母/数字/下划线，长度 6–20";
    }
    if (opts?.accountTaken) return "账号已被占用";
    if (!isStrongPassword(form.password)) {
      return "密码须至少 8 位，且大写/小写/数字/特殊符{!_@#}中至少满足 3 种";
    }
  } else if (form.password && !isStrongPassword(form.password)) {
    return "新密码须至少 8 位，且大写/小写/数字/特殊符{!_@#}中至少满足 3 种";
  }

  const products = parseProductServices(form.productServices);
  if (!products.ok) return products.error;
  return null;
}

export function formToCustomerPayload(
  form: CustomerFormState,
  base?: CustomerAccount,
): Omit<CustomerAccount, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: CustomerAccount["status"];
  passwordHint: string;
} {
  const products = parseProductServices(form.productServices);
  if (!products.ok) throw new Error(products.error);

  const amount = form.contractAmount.trim()
    ? Number(form.contractAmount)
    : null;

  const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  let contracts: CustomerContract[] = base?.contracts ? [...base.contracts] : [];

  if (!base) {
    contracts = [
      {
        id: `ct-new-${Date.now()}`,
        contractNo: form.contractNo.trim(),
        startDate: form.contractStart,
        endDate: form.contractEnd,
        amount,
        files: [...form.contractFiles],
        createdAt: stamp,
        updatedAt: stamp,
      },
    ];
  }

  const summary = base
    ? {
        contracts,
        contractFiles: base.contractFiles,
        contractStart: base.contractStart,
        contractEnd: base.contractEnd,
        contractAmount: base.contractAmount,
      }
    : {
        contracts,
        contractFiles: form.contractFiles,
        contractStart: form.contractStart,
        contractEnd: form.contractEnd,
        contractAmount: amount,
      };

  return {
    customerType: "enterprise",
    creditCode: form.creditCode.trim(),
    companyName: form.companyName.trim(),
    legalPerson: form.legalPerson.trim(),
    contactName: form.contactName.trim(),
    contactPhone: form.contactPhone.trim(),
    contactEmail: form.contactEmail.trim(),
    address: form.address.trim(),
    contracts: summary.contracts,
    contractFiles: summary.contractFiles,
    contractStart: summary.contractStart,
    contractEnd: summary.contractEnd,
    contractAmount: summary.contractAmount,
    account: form.account.trim(),
    passwordHint: form.password
      ? form.password
      : (base?.passwordHint ?? ""),
    productServices: products.value,
    status: base?.status,
  };
}

export function diffCustomer(
  before: CustomerAccount,
  after: CustomerAccount,
): { field: string; before: string; after: string }[] {
  const changes: { field: string; before: string; after: string }[] = [];
  const push = (field: string, a: string, b: string) => {
    if (a !== b) changes.push({ field, before: a || "—", after: b || "—" });
  };

  push("联系人姓名", before.contactName, after.contactName);
  push("联系人电话", before.contactPhone, after.contactPhone);
  push("联系人邮箱", before.contactEmail, after.contactEmail);
  push("有效联系地址", before.address, after.address);
  push(
    "合同总金额",
    before.contractAmount == null ? "" : String(before.contractAmount),
    after.contractAmount == null ? "" : String(after.contractAmount),
  );
  push("合作起止", `${before.contractStart}~${before.contractEnd}`, `${after.contractStart}~${after.contractEnd}`);
  if (before.passwordHint !== after.passwordHint) {
    push("密码", "******", "已重置");
  }

  const beforeMap = new Map(before.productServices.map((s) => [s.product, s]));
  const afterMap = new Map(after.productServices.map((s) => [s.product, s]));
  const codes = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  for (const code of codes) {
    const b = beforeMap.get(code);
    const a = afterMap.get(code);
    const name = productName(code);
    if (!b && a) {
      const extra =
        isVerifyProduct(code) && a.businessTypes && a.usageChannels
          ? `｜${formatBusinessTypes(a.businessTypes)}｜${formatUsageChannels(a.usageChannels)}`
          : "";
      push(
        `产品·${name}`,
        "未开通",
        `${a.quotaType === "unlimited" ? "不限量" : `授权总量${a.quotaTotal}`}｜${a.startDate}~${a.endDate}${extra}`,
      );
    } else if (b && !a) {
      push(`产品·${name}`, "已配置", "已移除");
    } else if (b && a) {
      const bq = b.quotaType === "unlimited" ? "不限量" : `授权总量${b.quotaTotal}`;
      const aq = a.quotaType === "unlimited" ? "不限量" : `授权总量${a.quotaTotal}`;
      const bizDiff =
        isVerifyProduct(code) && a.businessTypes && a.usageChannels
          ? {
              biz: formatBusinessTypes(b.businessTypes ?? []),
              bizAfter: formatBusinessTypes(a.businessTypes),
              usage: formatUsageChannels(b.usageChannels ?? []),
              usageAfter: formatUsageChannels(a.usageChannels),
            }
          : null;
      push(
        `产品·${name}`,
        `${bq}｜${b.startDate}~${b.endDate}${b.stopped ? "｜已停止" : ""}`,
        `${aq}｜${a.startDate}~${a.endDate}${a.stopped ? "｜已停止" : ""}`,
      );
      if (bizDiff && bizDiff.biz !== bizDiff.bizAfter) {
        push(`产品·${name}·开通业务类型`, bizDiff.biz, bizDiff.bizAfter);
      }
      if (bizDiff && bizDiff.usage !== bizDiff.usageAfter) {
        push(`产品·${name}·使用方式`, bizDiff.usage, bizDiff.usageAfter);
      }
    }
  }
  return changes;
}
