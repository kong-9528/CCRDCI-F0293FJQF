import type { ApiDocCatalog, ProductCode } from "./types";

/** 默认文档目录（mock，与 customer 展示一致） */
export const DEFAULT_API_DOC_CATALOGS: ApiDocCatalog[] = [
  { id: "cat_general", name: "通用接口", sort: 10 },
  { id: "cat_dci", name: "DCI核验接口", sort: 20 },
  { id: "cat_info", name: "版权登记信息核验接口", sort: 30 },
  { id: "cat_certificate", name: "版权登记证书核验接口", sort: 40 },
  { id: "cat_workReview", name: "作品智能辅助审核接口", sort: 50 },
];

/** 产品 → 默认目录 */
export const PRODUCT_DEFAULT_CATALOG: Record<ProductCode, string> = {
  dci: "cat_dci",
  info: "cat_info",
  certificate: "cat_certificate",
  workReview: "cat_workReview",
};

export function catalogIdForProduct(code: ProductCode): string {
  return PRODUCT_DEFAULT_CATALOG[code] ?? "cat_general";
}
