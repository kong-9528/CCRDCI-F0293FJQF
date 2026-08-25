import {
  API_DOC_PRODUCTS_META,
  AUTH_HEADER_PARAMS,
  getDocProductMeta,
  listOnlineByProduct,
  subscribeApiCatalog,
  type ApiEndpoint as CatalogEndpoint,
  type ApiErrorCode,
  type ApiParam,
} from "@ctp/api-catalog";

export type { ApiErrorCode, ApiParam };

export type ApiEndpoint = CatalogEndpoint & {
  /** 文档固定鉴权说明（合并进展示） */
  commonParams: ApiParam[];
};

export type ApiDocProduct = {
  id: string;
  productCode: string;
  name: string;
  summary: string;
  apis: ApiEndpoint[];
};

export const API_DOC_VERSION = "v2.1";

function toDocEndpoint(ep: CatalogEndpoint): ApiEndpoint {
  return {
    ...ep,
    commonParams: AUTH_HEADER_PARAMS,
  };
}

export function getApiDocProducts(): ApiDocProduct[] {
  return API_DOC_PRODUCTS_META.map((meta) => {
    const apis = listOnlineByProduct(meta.productCode).map(toDocEndpoint);
    return {
      id: meta.id,
      productCode: meta.productCode,
      name: meta.name,
      summary: meta.summary,
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
    apis: listOnlineByProduct(meta.productCode).map(toDocEndpoint),
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
    apis: listOnlineByProduct(meta.productCode).map(toDocEndpoint),
  };
}

export function getApiEndpoint(productId: string, apiId: string): ApiEndpoint | undefined {
  const prod = getApiDocProduct(productId);
  return prod?.apis.find((item) => item.id === apiId || item.apiCode === apiId);
}

export { subscribeApiCatalog };
