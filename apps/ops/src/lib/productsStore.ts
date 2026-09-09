import { useEffect, useState } from "react";
import {
  PRODUCTS,
  productName,
  type LegacyAuditProductCode,
  type ProductCode,
} from "@/lib/catalog";

/** 产品上线状态 */
export type ShelfStatus = "online" | "offline";

export type ProductCategory = "verify" | "audit";

/** 作品智能辅助审核下的子能力（API 能力级上下架） */
export type AuditCapabilityCode = LegacyAuditProductCode;

export type AuditCapability = {
  code: AuditCapabilityCode;
  name: string;
  shelfStatus: ShelfStatus;
};

export const WORK_REVIEW_SHELF_PRODUCT_NAME = "作品智能辅助审核";

export const AUDIT_CAPABILITY_DEFS: { code: AuditCapabilityCode; name: string }[] = [
  { code: "safety", name: "内容安全审核" },
  { code: "duplicate", name: "作品登记查重" },
  { code: "infringement", name: "疑似侵权审核" },
];

export type BusinessLine = "software" | "work" | "dataset";

export type ManagedProduct = {
  code: string;
  name: string;
  category: ProductCategory;
  description: string;
  businessLines: BusinessLine[];
  shelfStatus: ShelfStatus;
  pageSubmitEnabled: boolean;
  apiEnabled: boolean;
  /** 内置种子产品（来自 catalog） */
  builtin?: boolean;
};

export type ProductCreateInput = {
  category: ProductCategory;
  name: string;
  description: string;
  businessLines: BusinessLine[];
};

export type ProductUpdateInput = {
  category: ProductCategory;
  name: string;
  description: string;
  businessLines: BusinessLine[];
};

export type ProductSection = {
  id: string;
  title: string;
  category: ProductCategory;
};

export const PRODUCT_SECTIONS: ProductSection[] = [
  { id: "verify", title: "版权核验产品", category: "verify" },
  { id: "audit", title: "智能辅助审核产品", category: "audit" },
];

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  verify: "版权核验产品",
  audit: "智能辅助审核产品",
};

export function productListPath(category: ProductCategory): string {
  return category === "audit" ? "/products/audit" : "/products/verify";
}

export const BUSINESS_LINE_LABEL: Record<BusinessLine, string> = {
  software: "软件",
  work: "作品",
  dataset: "数据汇编作品",
};

export const BUSINESS_LINE_OPTIONS: BusinessLine[] = ["software", "work", "dataset"];

export const SHELF_STATUS_LABEL: Record<ShelfStatus, string> = {
  online: "上线",
  offline: "下线",
};

export const PRODUCT_DESCRIPTION_MAX = 2000;

const INITIAL: ManagedProduct[] = PRODUCTS.map((p) => ({
  code: p.code,
  name: p.name,
  category: p.category as ProductCategory,
  description: "",
  businessLines: ["software", "work", "dataset"],
  shelfStatus: "online",
  pageSubmitEnabled: p.category === "verify" || p.code === "workReview",
  apiEnabled: true,
  builtin: true,
}));

let products: ManagedProduct[] = structuredClone(INITIAL);
const INITIAL_AUDIT_CAPABILITIES: AuditCapability[] = AUDIT_CAPABILITY_DEFS.map((item) => ({
  ...item,
  shelfStatus: item.code === "infringement" ? "offline" : "online",
}));
let auditCapabilities: AuditCapability[] = structuredClone(INITIAL_AUDIT_CAPABILITIES);
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

function newProductCode() {
  return `custom-${Date.now()}`;
}

export function getManagedProducts(): ManagedProduct[] {
  return products;
}

export function getManagedProduct(code: string): ManagedProduct | undefined {
  return products.find((p) => p.code === code);
}

export function getProductsByCategory(category: ProductCategory): ManagedProduct[] {
  return products.filter((item) => item.category === category);
}

export function getWorkReviewProduct(): ManagedProduct | undefined {
  return products.find((p) => p.code === "workReview");
}

export function getAuditCapabilities(): AuditCapability[] {
  return auditCapabilities;
}

export function getAuditCapability(code: AuditCapabilityCode): AuditCapability | undefined {
  return auditCapabilities.find((item) => item.code === code);
}

export function resolveProductName(code: string): string {
  const row = getManagedProduct(code);
  if (row) return row.name;
  return productName(code as ProductCode);
}

function normalizeProductFields(input: ProductCreateInput | ProductUpdateInput) {
  const name = input.name.trim();
  if (!name) throw new Error("请填写产品名称");
  if (input.description.length > PRODUCT_DESCRIPTION_MAX) {
    throw new Error(`服务说明不能超过 ${PRODUCT_DESCRIPTION_MAX} 字`);
  }
  const businessLines = BUSINESS_LINE_OPTIONS.filter((line) =>
    input.businessLines.includes(line),
  );
  if (businessLines.length === 0) {
    throw new Error("请至少选择一项业务线");
  }
  return {
    name,
    category: input.category,
    description: input.description.trim(),
    businessLines,
  };
}

export function createProduct(input: ProductCreateInput): ManagedProduct {
  const fields = normalizeProductFields(input);
  const created: ManagedProduct = {
    code: newProductCode(),
    ...fields,
    shelfStatus: "offline",
    pageSubmitEnabled: false,
    apiEnabled: false,
    builtin: false,
  };
  products = [...products, created];
  emit();
  return created;
}

/** 更新产品信息，不改动上下架与服务方式开关 */
export function updateProduct(code: string, input: ProductUpdateInput): ManagedProduct {
  const idx = products.findIndex((p) => p.code === code);
  if (idx < 0) throw new Error("产品不存在");
  const fields = normalizeProductFields(input);
  const next: ManagedProduct = {
    ...products[idx],
    ...fields,
  };
  products = products.map((p, i) => (i === idx ? next : p));
  emit();
  return next;
}

export function setShelfStatus(code: string, shelfStatus: ShelfStatus) {
  products = products.map((p) => (p.code === code ? { ...p, shelfStatus } : p));
  emit();
}

export function setAuditCapabilityShelfStatus(
  code: AuditCapabilityCode,
  shelfStatus: ShelfStatus,
) {
  auditCapabilities = auditCapabilities.map((item) =>
    item.code === code ? { ...item, shelfStatus } : item,
  );
  emit();
}

export function setPageSubmitEnabled(code: string, pageSubmitEnabled: boolean) {
  products = products.map((p) => (p.code === code ? { ...p, pageSubmitEnabled } : p));
  emit();
}

export function setApiEnabled(code: string, apiEnabled: boolean) {
  products = products.map((p) => (p.code === code ? { ...p, apiEnabled } : p));
  emit();
}

export function useProductsStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    products: getManagedProducts(),
    getByCategory: getProductsByCategory,
    getWorkReviewProduct,
    getAuditCapabilities,
    create: createProduct,
    update: updateProduct,
    setShelfStatus,
    setAuditCapabilityShelfStatus,
    setPageSubmitEnabled,
    setApiEnabled,
    productName: resolveProductName,
  };
}
