import { useEffect, useState } from "react";
import {
  PRODUCTS,
  productName,
  type ProductCode,
} from "@/lib/catalog";

/** 产品上架状态 */
export type ShelfStatus = "online" | "offline";

export type ManagedProduct = {
  code: ProductCode;
  shelfStatus: ShelfStatus;
  /** 是否支持页面提交（WebUI） */
  webuiEnabled: boolean;
};

export type ProductSection = {
  id: string;
  title: string;
  category: "verify" | "audit" | string;
};

/** 板块定义：后续可在此追加新类型板块 */
export const PRODUCT_SECTIONS: ProductSection[] = [
  { id: "verify", title: "版权核验服务产品", category: "verify" },
  { id: "audit", title: "智能辅助审核服务产品", category: "audit" },
];

export const SHELF_STATUS_LABEL: Record<ShelfStatus, string> = {
  online: "上架",
  offline: "下架",
};

export const WEBUI_LABEL = {
  on: "支持",
  off: "不支持",
} as const;

const INITIAL: ManagedProduct[] = PRODUCTS.map((p) => ({
  code: p.code,
  shelfStatus: p.code === "infringement" ? "offline" : "online",
  webuiEnabled: p.category === "verify" || p.code === "safety",
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

export function setWebuiEnabled(code: ProductCode, webuiEnabled: boolean) {
  products = products.map((p) => (p.code === code ? { ...p, webuiEnabled } : p));
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
    setWebuiEnabled,
    productName,
  };
}
