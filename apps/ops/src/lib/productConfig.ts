import type { BusinessType, CustomerAccount, UsageChannel } from "@/lib/catalog";
import {
  formatBusinessTypes,
  formatUsageChannels,
  isVerifyProduct,
  productName,
} from "@/lib/catalog";
import {
  emptyProductRow,
  parseProductServices,
  type ProductFormRow,
} from "@/lib/customerForm";

export type ProductConfigState = {
  productRows: ProductFormRow[];
};

export function emptyProductConfig(defaultRange?: {
  startDate?: string;
  endDate?: string;
}): ProductConfigState {
  return {
    productRows: [emptyProductRow(defaultRange)],
  };
}

export function defaultProductConfigForApplication(app: {
  contractStart: string;
  contractEnd: string;
}): ProductConfigState {
  return emptyProductConfig({
    startDate: app.contractStart,
    endDate: app.contractEnd,
  });
}

export function customerToProductConfig(customer: CustomerAccount): ProductConfigState {
  return {
    productRows:
      customer.productServices.length > 0
        ? customer.productServices.map((s) => ({
            key: `p-${s.product}`,
            product: s.product,
            quotaType: s.quotaType,
            quotaTotal: s.quotaTotal == null ? "" : String(s.quotaTotal),
            startDate: s.startDate,
            endDate: s.endDate,
            stopped: s.stopped,
            usedCount: s.usedCount,
            businessTypes: s.businessTypes ? [...s.businessTypes] : [],
            usageChannels: s.usageChannels ? [...s.usageChannels] : [],
            isNew: false,
          }))
        : [emptyProductRow({
            startDate: customer.contractStart,
            endDate: customer.contractEnd,
          })],
  };
}

export function validateProductConfig(state: ProductConfigState): string | null {
  const products = parseProductServices(state.productRows);
  if (!products.ok) return products.error;
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
  afterProductRows: ProductFormRow[],
): { field: string; before: string; after: string }[] {
  const changes: { field: string; before: string; after: string }[] = [];
  const push = (field: string, a: string, b: string) => {
    if (a !== b) changes.push({ field, before: a || "—", after: b || "—" });
  };

  const parsed = parseProductServices(afterProductRows);
  if (!parsed.ok) return changes;

  const beforeMap = new Map(before.productServices.map((s) => [s.product, s]));
  const afterMap = new Map(parsed.value.map((s) => [s.product, s]));
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
        `${a.quotaType === "unlimited" ? "不限量" : `总量${a.quotaTotal}`}｜${a.startDate}~${a.endDate}${extra}`,
      );
    } else if (b && a) {
      const bq = b.quotaType === "unlimited" ? "不限量" : `总量${b.quotaTotal}`;
      const aq = a.quotaType === "unlimited" ? "不限量" : `总量${a.quotaTotal}`;
      push(
        `产品·${name}`,
        `${bq}｜${b.startDate}~${b.endDate}${b.stopped ? "｜已停止" : ""}`,
        `${aq}｜${a.startDate}~${a.endDate}${a.stopped ? "｜已停止" : ""}`,
      );
      if (b.stopped !== a.stopped) {
        push(
          `产品·${name}·服务状态`,
          b.stopped ? "已停止" : "可使用",
          a.stopped ? "已停止" : "已恢复",
        );
      }
      if (isVerifyProduct(code)) {
        push(
          `产品·${name}·开通业务类型`,
          formatBusinessTypes(b.businessTypes ?? []),
          formatBusinessTypes(a.businessTypes ?? []),
        );
        push(
          `产品·${name}·使用方式`,
          formatUsageChannels(b.usageChannels ?? []),
          formatUsageChannels(a.usageChannels ?? []),
        );
      }
    }
  }

  return changes;
}
