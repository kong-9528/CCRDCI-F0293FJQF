import type { ApiDocProductMeta, ApiServiceTab, ProductCode } from "./types";

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
    id: "cert",
    productCode: "certificate",
    name: "版权登记证书核验接口",
    summary: "证书真伪验证 · 证书下载 · 批量核验",
    category: "verify",
  },
  {
    id: "safety",
    productCode: "safety",
    name: "内容安全审核接口",
    summary: "文本审核 · 图片审核 · 视频审核 · 批量审核",
    category: "audit",
  },
  {
    id: "dedup",
    productCode: "duplicate",
    name: "作品登记查重接口",
    summary: "文本查重 · 图片查重 · 相似度报告",
    category: "audit",
  },
  {
    id: "infringe",
    productCode: "infringement",
    name: "疑似侵权审核接口",
    summary: "侵权检测 · 相似度分析 · 风险报告生成",
    category: "audit",
  },
];

export const PRODUCT_NAME: Record<ProductCode, string> = {
  dci: "DCI核验",
  info: "版权登记信息核验",
  certificate: "版权登记证书核验",
  safety: "内容安全审核",
  duplicate: "作品登记查重",
  infringement: "疑似侵权审核",
};

export const API_TAB_LABEL: Record<ApiServiceTab, string> = {
  verify: "版权核验接口管理",
  audit: "智能审核接口管理",
};

export const API_STATUS_LABEL: Record<"online" | "offline", string> = {
  online: "上线",
  offline: "下线",
};

/** 文档 URL 别名 → 产品文档 id */
export const PRODUCT_DOC_ALIASES: Record<string, string> = {
  certificate: "cert",
  duplicate: "dedup",
  infringement: "infringe",
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
