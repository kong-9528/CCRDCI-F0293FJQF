/** 与控制台 / ops 可售产品一致的 4 个 API 产品 */
export const PRODUCT_CODES = ["dci", "info", "certificate", "workReview"] as const;

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

/** 接口文档文件元数据 */
export type ApiDocFile = {
  id: string;
  name: string;
  size: number;
  /** object URL 或演示占位地址 */
  url?: string;
};

/** 文档目录（customer 左侧导航 / ops 可维护） */
export type ApiDocCatalog = {
  id: string;
  name: string;
  /** 越小越靠前 */
  sort: number;
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
  /**
   * 主产品（兼容旧逻辑）；等于 productCodes[0]，无产品时回退 dci
   * @deprecated 优先使用 productCodes
   */
  productCode: ProductCode;
  /** 关联产品（可多选，可为空） */
  productCodes: ProductCode[];
  /** 关联文档目录（可多选，至少 1 个） */
  catalogIds: string[];
  owner: string;
  status: ApiOnlineStatus;
  /** 创建时间 YYYY-MM-DD HH:mm:ss */
  createdAt: string;
  /** 最近更新时间 YYYY-MM-DD HH:mm:ss */
  updatedAt: string;
  /** 接口文档文件 */
  docFile?: ApiDocFile | null;
  /** 请求参数说明（多行文本，运营台编辑用） */
  requestParamsText?: string;
  /** 响应字段说明（多行文本，运营台编辑用） */
  responseFieldsText?: string;
  pathParams: ApiParam[];
  queryParams: ApiParam[];
  headerParams: ApiParam[];
  bodyParams: ApiParam[];
  responseParams: ApiParam[];
  errorCodes: ApiErrorCode[];
  exampleRequest: string;
  exampleResponse: string;
};

export type ApiEndpointInput = Omit<
  ApiEndpoint,
  "id" | "status" | "createdAt" | "updatedAt" | "productCode" | "productCodes" | "catalogIds"
> & {
  status?: ApiOnlineStatus;
  createdAt?: string;
  updatedAt?: string;
  productCode?: ProductCode;
  productCodes?: ProductCode[];
  catalogIds: string[];
};

export type ApiEndpointUpdate = Partial<
  Omit<ApiEndpoint, "id" | "apiCode" | "createdAt">
> & {
  apiCode?: never;
};

export type ApiDocProductMeta = {
  /** 文档路由 id（可与 productCode 不同，如历史 cert） */
  id: string;
  productCode: ProductCode;
  name: string;
  summary: string;
  category: ApiServiceTab;
};
