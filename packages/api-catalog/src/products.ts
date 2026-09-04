import type { ApiDocProductMeta, ApiServiceTab, ProductCode } from "./types";

/** 控制台 API 文档 / ops 接口服务：4 个产品 */
export const API_DOC_PRODUCTS_META: ApiDocProductMeta[] = [
  {
    id: "dci",
    productCode: "dci",
    name: "DCI核验接口",
    summary: "DCI编码核验 · 作品信息核验 · 证书核验",
    category: "verify",
  },
  {
    id: "info",
    productCode: "info",
    name: "版权登记信息核验接口",
    summary: "作品信息检索 · 权属链查询 · 登记状态查询",
    category: "verify",
  },
  {
    id: "certificate",
    productCode: "certificate",
    name: "版权登记证书核验接口",
    summary: "证书真伪验证 · 证书下载 · 批量核验",
    category: "verify",
  },
  {
    id: "workReview",
    productCode: "workReview",
    name: "作品智能辅助审核接口",
    summary: "内容安全 · 登记查重 · 疑似侵权审核",
    category: "audit",
  },
];

export const PRODUCT_NAME: Record<ProductCode, string> = {
  dci: "DCI核验",
  info: "版权登记信息核验",
  certificate: "版权登记证书核验",
  workReview: "作品智能辅助审核",
};

export const API_TAB_LABEL: Record<ApiServiceTab, string> = {
  verify: "版权核验接口管理",
  audit: "智能审核接口管理",
};

export const API_STATUS_LABEL: Record<"online" | "offline", string> = {
  online: "已上架",
  offline: "已下架",
};

/**
 * 文档 URL 别名 → 产品文档 id
 * 兼容历史路由：/api-docs/cert、/api-docs/safety 等
 */
export const PRODUCT_DOC_ALIASES: Record<string, string> = {
  cert: "certificate",
  safety: "workReview",
  dedup: "workReview",
  duplicate: "workReview",
  infringe: "workReview",
  infringement: "workReview",
};

export function resolveDocProductId(id: string): string {
  return PRODUCT_DOC_ALIASES[id] ?? id;
}

export function getDocProductMeta(id: string): ApiDocProductMeta | undefined {
  const resolved = resolveDocProductId(id);
  return API_DOC_PRODUCTS_META.find((p) => p.id === resolved || p.productCode === id);
}

export function productCodesByTab(tab: ApiServiceTab): ProductCode[] {
  return API_DOC_PRODUCTS_META.filter((p) => p.category === tab).map((p) => p.productCode);
}
