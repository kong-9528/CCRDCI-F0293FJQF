import type {
  BusinessType,
  CustomerAccount,
  PackageServiceItem,
  ProductCode,
  ServicePackage,
  UsageChannel,
} from "@/lib/catalog";
import {
  flattenServicePackages,
  formatBusinessTypes,
  formatUsageChannels,
  isVerifyProduct,
  productName,
  resolveAuditServicePackage,
  resolveServicePackages,
} from "@/lib/catalog";

/** 核验单元内的产品行 */
export type PackageServiceFormRow = {
  key: string;
  product: ProductCode | "";
  businessTypes: BusinessType[];
  usageChannels: UsageChannel[];
  /** 每作品消耗次数 */
  consumePerWork: string;
  /** 产品级停用 */
  stopped: boolean;
  isNew?: boolean;
};

/**
 * 核验服务：固定至多一个配置单元。
 * 额度/时间共享；其内可选 1~3 个核验产品。
 */
export type PackageFormRow = {
  key: string;
  quotaTotal: string;
  startDate: string;
  endDate: string;
  usedCount: number;
  services: PackageServiceFormRow[];
  /** 本次编辑新开通 */
  isNew?: boolean;
};

/** 作品智能辅助审核 */
export type AuditServiceFormRow = {
  key: string;
  quotaTotal: string;
  startDate: string;
  endDate: string;
  stopped: boolean;
  usedCount: number;
  isNew?: boolean;
};

export type ProductConfigState = {
  /** 核验服务：0 或 1 个单元 */
  packages: PackageFormRow[];
  auditService: AuditServiceFormRow | null;
};

function newKey(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyPackageServiceRow(): PackageServiceFormRow {
  return {
    key: newKey("svc"),
    product: "",
    businessTypes: [],
    usageChannels: [],
    consumePerWork: "1",
    stopped: false,
    isNew: true,
  };
}

export function emptyPackageRow(defaults?: {
  startDate?: string;
  endDate?: string;
}): PackageFormRow {
  return {
    key: newKey("verify"),
    quotaTotal: "",
    startDate: defaults?.startDate ?? "",
    endDate: defaults?.endDate ?? "",
    usedCount: 0,
    services: [emptyPackageServiceRow()],
    isNew: true,
  };
}

export function emptyAuditServiceRow(defaults?: {
  startDate?: string;
  endDate?: string;
}): AuditServiceFormRow {
  return {
    key: newKey("audit"),
    quotaTotal: "",
    startDate: defaults?.startDate ?? "",
    endDate: defaults?.endDate ?? "",
    stopped: false,
    usedCount: 0,
    isNew: true,
  };
}

export function emptyProductConfig(_defaultRange?: {
  startDate?: string;
  endDate?: string;
}): ProductConfigState {
  return {
    packages: [],
    auditService: null,
  };
}

export function defaultProductConfigForApplication(app: {
  contractStart: string;
  contractEnd: string;
}): ProductConfigState {
  return {
    packages: [
      emptyPackageRow({
        startDate: app.contractStart,
        endDate: app.contractEnd,
      }),
    ],
    auditService: null,
  };
}

function normalizeKey(code: string) {
  return code.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function packageToForm(pkg: ServicePackage): PackageFormRow {
  return {
    key: pkg.id || newKey("verify"),
    quotaTotal: pkg.quotaTotal == null ? "" : String(pkg.quotaTotal),
    startDate: pkg.startDate,
    endDate: pkg.endDate,
    usedCount: pkg.usedCount,
    isNew: false,
    services:
      pkg.services.length > 0
        ? pkg.services.map((s) => ({
            key: `svc-${normalizeKey(s.product)}`,
            product: s.product,
            businessTypes: s.businessTypes ? [...s.businessTypes] : [],
            usageChannels: s.usageChannels ? [...s.usageChannels] : [],
            consumePerWork:
              typeof s.consumePerWork === "number" && s.consumePerWork > 0
                ? String(Math.floor(s.consumePerWork))
                : "1",
            stopped: Boolean(s.stopped),
            isNew: false,
          }))
        : [emptyPackageServiceRow()],
  };
}

function auditPackageToForm(pkg: ServicePackage): AuditServiceFormRow {
  return {
    key: pkg.id || newKey("audit"),
    quotaTotal: pkg.quotaTotal == null ? "" : String(pkg.quotaTotal),
    startDate: pkg.startDate,
    endDate: pkg.endDate,
    stopped: pkg.stopped,
    usedCount: pkg.usedCount,
    isNew: false,
  };
}

export function customerToProductConfig(customer: CustomerAccount): ProductConfigState {
  const packages = resolveServicePackages(customer);
  const auditPkg = resolveAuditServicePackage(customer);
  return {
    packages: packages.length > 0 ? [packageToForm(packages[0]!)] : [],
    auditService: auditPkg ? auditPackageToForm(auditPkg) : null,
  };
}

function serviceLabel(row: PackageServiceFormRow, index: number) {
  if (row.product) return `「${productName(row.product)}」`;
  return `第 ${index + 1} 项核验产品`;
}

export function parseServicePackages(
  rows: PackageFormRow[],
  opts?: { allowEmpty?: boolean },
): { ok: true; value: ServicePackage[] } | { ok: false; error: string } {
  // 核验服务写死至多一个单元
  const unit = rows[0];
  if (!unit) {
    if (opts?.allowEmpty) return { ok: true, value: [] };
    return { ok: false, error: "请配置版权核验服务" };
  }

  const hasContent =
    unit.services.some((s) => Boolean(s.product)) ||
    unit.quotaTotal.trim() ||
    unit.startDate ||
    unit.endDate ||
    !unit.isNew;

  if (!hasContent && opts?.allowEmpty) {
    return { ok: true, value: [] };
  }

  const label = "版权核验服务";
  if (!unit.quotaTotal.trim()) {
    return { ok: false, error: `${label}：请填写授权总量` };
  }
  const n = Number(unit.quotaTotal);
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false, error: `${label}：授权总量须为正整数` };
  }
  if (n < unit.usedCount) {
    return {
      ok: false,
      error: `${label}：授权总量不能小于已用次数 ${unit.usedCount}`,
    };
  }
  if (!unit.startDate) {
    return { ok: false, error: `${label}：请填写生效开始日期` };
  }
  if (!unit.endDate) {
    return { ok: false, error: `${label}：请填写生效结束日期` };
  }
  if (unit.startDate > unit.endDate) {
    return { ok: false, error: `${label}：生效开始日期不能晚于结束日期` };
  }

  const filled = unit.services.filter((s) => Boolean(s.product));
  if (filled.length === 0) {
    return { ok: false, error: `${label}：请至少添加一项核验产品` };
  }

  const seen = new Set<string>();
  const services: PackageServiceItem[] = [];

  for (let si = 0; si < filled.length; si++) {
    const svc = filled[si]!;
    const sLabel = `${label} · ${serviceLabel(svc, si)}`;
    if (!isVerifyProduct(svc.product)) {
      return {
        ok: false,
        error: `${sLabel}：仅支持 DCI核验、版权登记信息核验、版权登记证书核验`,
      };
    }
    if (seen.has(svc.product)) {
      return {
        ok: false,
        error: `核验产品「${productName(svc.product)}」不可重复配置`,
      };
    }
    seen.add(svc.product);

    if (!svc.consumePerWork.trim()) {
      return { ok: false, error: `${sLabel}：请填写每作品消耗次数` };
    }
    const consume = Number(svc.consumePerWork);
    if (!Number.isInteger(consume) || consume <= 0) {
      return { ok: false, error: `${sLabel}：每作品消耗次数须为正整数` };
    }
    if (svc.businessTypes.length === 0) {
      return { ok: false, error: `${sLabel}：请至少选择一项开通业务类型` };
    }
    if (svc.usageChannels.length === 0) {
      return { ok: false, error: `${sLabel}：请至少选择一种产品使用方式` };
    }

    services.push({
      product: svc.product,
      businessTypes: [...svc.businessTypes],
      usageChannels: [...svc.usageChannels],
      consumePerWork: consume,
      stopped: Boolean(svc.stopped),
    });
  }

  return {
    ok: true,
    value: [
      {
        id: unit.key.includes("__") ? unit.key.split("__")[0]! : unit.key,
        name: "版权核验服务",
        quotaType: "total",
        quotaTotal: n,
        usedCount: unit.usedCount,
        startDate: unit.startDate,
        endDate: unit.endDate,
        stopped: false,
        services,
      },
    ],
  };
}

export function parseAuditService(
  row: AuditServiceFormRow | null,
  opts?: { allowEmpty?: boolean },
): { ok: true; value: ServicePackage | null } | { ok: false; error: string } {
  if (!row) return { ok: true, value: null };

  const hasContent =
    row.quotaTotal.trim() || row.startDate || row.endDate || !row.isNew;
  if (!hasContent && opts?.allowEmpty) {
    return { ok: true, value: null };
  }

  const label = "作品智能辅助审核";
  if (!row.quotaTotal.trim()) {
    return { ok: false, error: `${label}：请填写授权总量` };
  }
  const n = Number(row.quotaTotal);
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false, error: `${label}：授权总量须为正整数` };
  }
  if (n < row.usedCount) {
    return {
      ok: false,
      error: `${label}：授权总量不能小于已用次数 ${row.usedCount}`,
    };
  }
  if (!row.startDate) {
    return { ok: false, error: `${label}：请填写生效开始日期` };
  }
  if (!row.endDate) {
    return { ok: false, error: `${label}：请填写生效结束日期` };
  }
  if (row.startDate > row.endDate) {
    return { ok: false, error: `${label}：生效开始日期不能晚于结束日期` };
  }

  return {
    ok: true,
    value: {
      id: row.key,
      name: label,
      quotaType: "total",
      quotaTotal: n,
      usedCount: row.usedCount,
      startDate: row.startDate,
      endDate: row.endDate,
      stopped: row.stopped,
      services: [{ product: "workReview" }],
    },
  };
}

export function parseAllServicePackages(
  state: ProductConfigState,
  opts?: { allowEmpty?: boolean },
): { ok: true; value: ServicePackage[] } | { ok: false; error: string } {
  const verify = parseServicePackages(state.packages, opts);
  if (!verify.ok) return verify;
  const audit = parseAuditService(state.auditService, opts);
  if (!audit.ok) return audit;
  return {
    ok: true,
    value: audit.value ? [...verify.value, audit.value] : verify.value,
  };
}

export function validateProductConfig(
  state: ProductConfigState,
  opts?: { allowEmpty?: boolean },
): string | null {
  const parsed = parseAllServicePackages(state, { allowEmpty: true });
  if (!parsed.ok) return parsed.error;
  if (!opts?.allowEmpty && parsed.value.length === 0) {
    return "请至少配置版权核验服务或作品智能辅助审核中的一项";
  }
  return null;
}

export function toggleBusinessType(list: BusinessType[], code: BusinessType): BusinessType[] {
  return list.includes(code) ? list.filter((item) => item !== code) : [...list, code];
}

export function toggleUsageChannel(list: UsageChannel[], code: UsageChannel): UsageChannel[] {
  return list.includes(code) ? list.filter((item) => item !== code) : [...list, code];
}

export function diffProductConfig(
  before: CustomerAccount,
  afterPackages: ServicePackage[],
): { field: string; before: string; after: string }[] {
  const changes: { field: string; before: string; after: string }[] = [];
  const push = (field: string, a: string, b: string) => {
    if (a !== b) changes.push({ field, before: a || "—", after: b || "—" });
  };

  const beforeAudit = resolveAuditServicePackage(before);
  const beforePkgs = [
    ...resolveServicePackages(before),
    ...(beforeAudit ? [beforeAudit] : []),
  ];
  const describe = (pkgs: ServicePackage[]) =>
    pkgs
      .map((p) => {
        const quota = p.quotaType === "unlimited" ? "不限量" : `总量${p.quotaTotal}`;
        const svcs = p.services
          .map((s) => {
            const consume =
              isVerifyProduct(s.product) && s.consumePerWork
                ? `｜每作品${s.consumePerWork}次`
                : "";
            const stop = isVerifyProduct(s.product) && s.stopped ? "｜已停止" : "";
            const extra =
              isVerifyProduct(s.product) && s.businessTypes && s.usageChannels
                ? `（${formatBusinessTypes(s.businessTypes)}｜${formatUsageChannels(s.usageChannels)}${consume}${stop}）`
                : "";
            return `${productName(s.product)}${extra}`;
          })
          .join("、");
        return `${p.name || "服务"}：${quota}｜${p.startDate}~${p.endDate}｜${svcs}${
          !p.services.some((s) => isVerifyProduct(s.product)) && p.stopped ? "｜已停止" : ""
        }`;
      })
      .join("；");

  push("技术服务配置", describe(beforePkgs), describe(afterPackages));

  const beforeFlat = flattenServicePackages(beforePkgs);
  const afterFlat = flattenServicePackages(afterPackages);
  const beforeMap = new Map(beforeFlat.map((s) => [s.product, s]));
  const afterMap = new Map(afterFlat.map((s) => [s.product, s]));
  for (const code of new Set([...beforeMap.keys(), ...afterMap.keys()])) {
    const b = beforeMap.get(code);
    const a = afterMap.get(code);
    if (!b && a) {
      push(`技术服务·${productName(code)}`, "未开通", "已开通");
    } else if (b && !a) {
      push(`技术服务·${productName(code)}`, "已开通", "已移除");
    }
  }

  return changes;
}
