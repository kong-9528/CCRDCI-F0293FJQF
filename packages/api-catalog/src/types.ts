export const PRODUCT_CODES = [
  "dci",
  "info",
  "certificate",
  "safety",
  "duplicate",
  "infringement",
] as const;

export type ProductCode = (typeof PRODUCT_CODES)[number];

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiOnlineStatus = "online" | "offline";
export type ApiServiceTab = "verify" | "audit";

export type ApiParam = {
  name: string;
  type: string;
  required: boolean;
  desc: string;
  defaultValue?: string;
  validation?: string;
  example?: string;
};

export type ApiErrorCode = {
  code: string;
  desc: string;
};

export type ApiEndpoint = {
  id: string;
  /** 接口唯一标识；新增可编辑，编辑后只读 */
  apiCode: string;
  apiName: string;
  path: string;
  method: HttpMethod;
  version: string;
  description: string;
  productCode: ProductCode;
  owner: string;
  status: ApiOnlineStatus;
  pathParams: ApiParam[];
  queryParams: ApiParam[];
  headerParams: ApiParam[];
  bodyParams: ApiParam[];
  responseParams: ApiParam[];
  errorCodes: ApiErrorCode[];
  exampleRequest: string;
  exampleResponse: string;
};

export type ApiEndpointInput = Omit<ApiEndpoint, "id" | "status"> & {
  status?: ApiOnlineStatus;
};

export type ApiEndpointUpdate = Partial<Omit<ApiEndpoint, "id" | "apiCode">> & {
  apiCode?: never;
};

export type ApiDocProductMeta = {
  /** 文档路由 id（可与 productCode 不同，如 cert） */
  id: string;
  productCode: ProductCode;
  name: string;
  summary: string;
  category: ApiServiceTab;
};
