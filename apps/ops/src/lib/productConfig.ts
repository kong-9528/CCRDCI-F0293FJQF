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

export type PackageServiceFormRow = {
  key: string;
  product: ProductCode | "";
  businessTypes: BusinessType[];
  usageChannels: UsageChannel[];
  /** 本次编辑新增的服务行（可移除、可改选） */
  isNew?: boolean;
};

export type PackageFormRow = {
  key: string;
  name: string;
  quotaTotal: string;
  startDate: string;
  endDate: string;
  stopped: boolean;
  usedCount: number;
  services: PackageServiceFormRow[];
  /** 本次编辑新增的套餐包 */
  isNew?: boolean;
};

/** 作品智能辅助审核：页面表现为单项服务，底层仍是单服务套餐包 */
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
  /** 核验服务套餐包 */
  packages: PackageFormRow[];
  /** 作品智能辅助审核（未开通时为 null） */
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
    isNew: true,
  };
}

export function emptyPackageRow(defaults?: {
  startDate?: string;
  endDate?: string;
  name?: string;
}): PackageFormRow {
  return {
    key: newKey("pkg"),
    name: defaults?.name ?? "",
    quotaTotal: "",
    startDate: defaults?.startDate ?? "",
    endDate: defaults?.endDate ?? "",
    stopped: false,
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
        name: "套餐 1",
      }),
    ],
    auditService: null,
  };
}

function packageToForm(pkg: ServicePackage, index: number): PackageFormRow {
  return {
    key: pkg.id || newKey("pkg"),
    name: pkg.name?.trim() || `套餐 ${index + 1}`,
    quotaTotal: pkg.quotaTotal == null ? "" : String(pkg.quotaTotal),
    startDate: pkg.startDate,
    endDate: pkg.endDate,
    stopped: pkg.stopped,
    usedCount: pkg.usedCount,
    isNew: false,
    services:
      pkg.services.length > 0
        ? pkg.services.map((s) => ({
            key: `svc-${normalizeKey(s.product)}`,
            product: s.product,
            businessTypes: s.businessTypes ? [...s.businessTypes] : [],
            usageChannels: s.usageChannels ? [...s.usageChannels] : [],
            isNew: false,
          }))
        : pkg.stopped
          ? []
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

function normalizeKey(code: string) {
  return code.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function customerToProductConfig(customer: CustomerAccount): ProductConfigState {
  const packages = resolveServicePackages(customer);
  const auditPkg = resolveAuditServicePackage(customer);
  return {
    packages:
      packages.length > 0
        ? packages.map((pkg, i) => packageToForm(pkg, i))
        : [
            emptyPackageRow({
              startDate: customer.contractStart,
              endDate: customer.contractEnd,
              name: "套餐 1",
            }),
          ],
    auditService: auditPkg ? auditPackageToForm(auditPkg) : null,
  };
}

function packageLabel(row: PackageFormRow, index: number) {
  const name = row.name.trim();
  return name ? `「${name}」` : `第 ${index + 1} 个套餐包`;
}

function serviceLabel(row: PackageServiceFormRow, index: number) {
  if (row.product) return `「${productName(row.product)}」`;
  return `第 ${index + 1} 项技术服务`;
}

export function parseServicePackages(
  rows: PackageFormRow[],
  opts?: { allowEmpty?: boolean },
): { ok: true; value: ServicePackage[] } | { ok: false; error: string } {
  const effective = opts?.allowEmpty
    ? rows.filter(
        (r) =>
          r.services.some((s) => Boolean(s.product)) ||
          r.quotaTotal.trim() ||
          r.startDate ||
          r.endDate ||
          r.name.trim(),
      )
    : rows;

  if (effective.length === 0) {
    if (opts?.allowEmpty) return { ok: true, value: [] };
    return { ok: false, error: "请至少配置一个核验技术服务套餐包" };
  }

  const globalProducts = new Set<string>();
  const value: ServicePackage[] = [];

  for (let pi = 0; pi < effective.length; pi++) {
    const pkg = effective[pi]!;
    const label = packageLabel(pkg, pi);

    if (!pkg.quotaTotal.trim()) {
      return { ok: false, error: `${label}：请填写套餐授权总量` };
    }
    const n = Number(pkg.quotaTotal);
    if (!Number.isInteger(n) || n <= 0) {
      return { ok: false, error: `${label}：授权总量须为正整数` };
    }
    if (n < pkg.usedCount) {
      return {
        ok: false,
        error: `${label}：授权总量不能小于已用次数 ${pkg.usedCount}`,
      };
    }
    if (!pkg.startDate) {
      return { ok: false, error: `${label}：请填写生效开始日期` };
    }
    if (!pkg.endDate) {
      return { ok: false, error: `${label}：请填写生效结束日期` };
    }
    if (pkg.startDate > pkg.endDate) {
      return { ok: false, error: `${label}：生效开始日期不能晚于结束日期` };
    }

    const filled = pkg.services.filter((s) => Boolean(s.product));
    if (filled.length === 0) {
      if (!pkg.stopped) {
        return { ok: false, error: `${label}：请至少添加一项技术服务` };
      }
    }

    const services: PackageServiceItem[] = [];
    for (let si = 0; si < filled.length; si++) {
      const svc = filled[si]!;
      const sLabel = `${label} · ${serviceLabel(svc, si)}`;
      if (!svc.product) {
        return { ok: false, error: `${sLabel}：请选择技术服务` };
      }
      if (!isVerifyProduct(svc.product)) {
        return {
          ok: false,
          error: `${sLabel}：核验套餐包仅支持 DCI核验、版权登记信息核验、版权登记证书核验`,
        };
      }
      if (globalProducts.has(svc.product)) {
        return {
          ok: false,
          error: `技术服务「${productName(svc.product)}」不可在多个套餐包中重复配置`,
        };
      }
      globalProducts.add(svc.product);

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
      });
    }

    value.push({
      id: pkg.key,
      name: pkg.name.trim() || `套餐 ${pi + 1}`,
      quotaType: "total",
      quotaTotal: n,
      usedCount: pkg.usedCount,
      startDate: pkg.startDate,
      endDate: pkg.endDate,
      stopped: pkg.stopped,
      services,
    });
  }

  return { ok: true, value };
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

/** 解析完整配置：核验套餐 + 审核套餐 */
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
  // 空白占位套餐/未填写审核在解析时忽略；再按场景要求「至少一项」或允许全空
  const parsed = parseAllServicePackages(state, { allowEmpty: true });
  if (!parsed.ok) return parsed.error;
  if (!opts?.allowEmpty && parsed.value.length === 0) {
    return "请至少配置核验套餐或作品智能辅助审核中的一项";
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
            const extra =
              isVerifyProduct(s.product) && s.businessTypes && s.usageChannels
                ? `（${formatBusinessTypes(s.businessTypes)}｜${formatUsageChannels(s.usageChannels)}）`
                : "";
            return `${productName(s.product)}${extra}`;
          })
          .join("、");
        return `${p.name || "套餐"}：${quota}｜${p.startDate}~${p.endDate}｜${svcs}${p.stopped ? "｜已停止" : ""}`;
      })
      .join("；");

  push("技术服务套餐包", describe(beforePkgs), describe(afterPackages));

  const beforeFlat = flattenServicePackages(beforePkgs);
  const afterFlat = flattenServicePackages(afterPackages);
  const beforeMap = new Map(beforeFlat.map((s) => [s.product, s]));
  const afterMap = new Map(afterFlat.map((s) => [s.product, s]));
  for (const code of new Set([...beforeMap.keys(), ...afterMap.keys()])) {
    const b = beforeMap.get(code);
    const a = afterMap.get(code);
    if (!b && a) {
      push(`技术服务·${productName(code)}`, "未开通", "已纳入套餐");
    } else if (b && !a) {
      push(`技术服务·${productName(code)}`, "已开通", "已移除");
    }
  }

  return changes;
}
