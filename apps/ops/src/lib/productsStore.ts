import { useEffect, useState } from "react";
import {
  PRODUCTS,
  productName,
  type ProductCode,
} from "@/lib/catalog";

/** 产品上线状态 */
export type ShelfStatus = "online" | "offline";

export type ManagedProduct = {
  code: ProductCode;
  shelfStatus: ShelfStatus;
  /** 是否支持页面提交 */
  pageSubmitEnabled: boolean;
  /** 是否支持 API 调用 */
  apiEnabled: boolean;
};

export type ProductSection = {
  id: string;
  title: string;
  category: "verify" | "audit" | string;
};

/** 板块定义：后续可在此追加新类型板块 */
export const PRODUCT_SECTIONS: ProductSection[] = [
  { id: "verify", title: "版权核验产品", category: "verify" },
  { id: "audit", title: "智能辅助审核产品", category: "audit" },
];

export const SHELF_STATUS_LABEL: Record<ShelfStatus, string> = {
  online: "上线",
  offline: "下线",
};

const INITIAL: ManagedProduct[] = PRODUCTS.map((p) => ({
  code: p.code,
  shelfStatus: p.code === "infringement" ? "offline" : "online",
  // 原 webui：核验产品 + 内容安全默认支持页面提交
  pageSubmitEnabled: p.category === "verify" || p.code === "safety",
  apiEnabled: true,
}));

let products: ManagedProduct[] = structuredClone(INITIAL);
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

export function getManagedProducts(): ManagedProduct[] {
  return products;
}

export function getProductsByCategory(category: string): ManagedProduct[] {
  return products.filter((item) => {
    const meta = PRODUCTS.find((p) => p.code === item.code);
    return meta?.category === category;
  });
}

export function setShelfStatus(code: ProductCode, shelfStatus: ShelfStatus) {
  products = products.map((p) => (p.code === code ? { ...p, shelfStatus } : p));
  emit();
}

export function setPageSubmitEnabled(code: ProductCode, pageSubmitEnabled: boolean) {
  products = products.map((p) => (p.code === code ? { ...p, pageSubmitEnabled } : p));
  emit();
}

export function setApiEnabled(code: ProductCode, apiEnabled: boolean) {
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
    setShelfStatus,
    setPageSubmitEnabled,
    setApiEnabled,
    productName,
  };
}
