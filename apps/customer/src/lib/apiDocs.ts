import {
  API_DOC_PRODUCTS_META,
  collectRequestParams,
  getDocProductMeta,
  listOnlineByProduct,
  resolveRequestParamsText,
  resolveResponseFieldsText,
  subscribeApiCatalog,
  type ApiEndpoint,
  type ApiErrorCode,
  type ApiParam,
  type ApiServiceTab,
} from "@ctp/api-catalog";

export type { ApiEndpoint, ApiErrorCode, ApiParam };
export { collectRequestParams, resolveRequestParamsText, resolveResponseFieldsText };

export type ApiDocProduct = {
  id: string;
  productCode: string;
  name: string;
  summary: string;
  category: ApiServiceTab;
  apis: ApiEndpoint[];
};

export function getApiDocProducts(): ApiDocProduct[] {
  return API_DOC_PRODUCTS_META.map((meta) => {
    const apis = listOnlineByProduct(meta.productCode);
    return {
      id: meta.id,
      productCode: meta.productCode,
      name: meta.name,
      summary: meta.summary,
      category: meta.category,
      apis,
    };
  }).filter((prod) => prod.apis.length > 0);
}

/** 概览卡片用：含暂无上线接口的产品也展示（接口数为 0） */
export function getApiDocProductsForOverview(): ApiDocProduct[] {
  return API_DOC_PRODUCTS_META.map((meta) => ({
    id: meta.id,
    productCode: meta.productCode,
    name: meta.name,
    summary: meta.summary,
    category: meta.category,
    apis: listOnlineByProduct(meta.productCode),
  }));
}

export const API_DOC_PRODUCTS = getApiDocProductsForOverview();

export function getApiDocTotalCount() {
  return getApiDocProductsForOverview().reduce((n, prod) => n + prod.apis.length, 0);
}

export const API_DOC_TOTAL_COUNT = getApiDocTotalCount();

export function getApiDocProduct(id: string): ApiDocProduct | undefined {
  const meta = getDocProductMeta(id);
  if (!meta) return undefined;
  return {
    id: meta.id,
    productCode: meta.productCode,
    name: meta.name,
    summary: meta.summary,
    category: meta.category,
    apis: listOnlineByProduct(meta.productCode),
  };
}

export function getApiEndpoint(productId: string, apiId: string): ApiEndpoint | undefined {
  const prod = getApiDocProduct(productId);
  return prod?.apis.find((item) => item.id === apiId || item.apiCode === apiId);
}

export { subscribeApiCatalog };
