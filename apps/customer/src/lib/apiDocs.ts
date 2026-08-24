export type ApiParam = {
  name: string;
  type: string;
  required: boolean;
  desc: string;
};

export type ApiEndpoint = {
  id: string;
  name: string;
  method: "GET" | "POST";
  path: string;
  description?: string;
  commonParams: ApiParam[];
  requestParams: ApiParam[];
  responseParams: ApiParam[];
};

export type ApiDocProduct = {
  id: string;
  name: string;
  summary: string;
  apis: ApiEndpoint[];
};

const COMMON_PARAMS: ApiParam[] = [
  { name: "accessKey", type: "string", required: true, desc: "接入方标识，在密钥管理中获取" },
  { name: "timestamp", type: "string", required: true, desc: "请求时间戳，格式：yyyy-MM-dd HH:mm:ss" },
  { name: "sign", type: "string", required: true, desc: "请求签名" },
];

const STANDARD_RESPONSE: ApiParam[] = [
  { name: "code", type: "number", required: true, desc: "业务状态码，0 表示成功" },
  { name: "message", type: "string", required: true, desc: "提示信息" },
  { name: "data", type: "object", required: false, desc: "业务数据" },
  { name: "requestId", type: "string", required: true, desc: "请求追踪 ID" },
];

/** 首版：6 产品骨架，每产品 1～2 个示例接口 */
export const API_DOC_PRODUCTS: ApiDocProduct[] = [
  {
    id: "dci",
    name: "DCI核验接口",
    summary: "DCI 编码核验 · 权属查询",
    apis: [
      {
        id: "dci-verify",
        name: "DCI编码核验",
        method: "POST",
        path: "/v1/verify/dci",
        description: "根据 DCI 码查询登记信息与权属状态。",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "dciCode", type: "string", required: true, desc: "DCI 编码" },
          { name: "workType", type: "string", required: false, desc: "software / work / dataset" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
      {
        id: "dci-batch",
        name: "批量 DCI 核验",
        method: "POST",
        path: "/v1/verify/dci/batch",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "dciCodes", type: "string[]", required: true, desc: "DCI 编码列表，单次上限 500" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
    ],
  },
  {
    id: "info",
    name: "版权信息核验接口",
    summary: "作品信息检索 · 权属链查询",
    apis: [
      {
        id: "info-search",
        name: "作品信息检索",
        method: "POST",
        path: "/v1/verify/info/search",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "keyword", type: "string", required: false, desc: "检索关键词" },
          { name: "category", type: "string", required: false, desc: "作品分类" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
    ],
  },
  {
    id: "cert",
    name: "版权证书核验接口",
    summary: "证书真伪验证 · 批量核验",
    apis: [
      {
        id: "cert-verify",
        name: "证书核验",
        method: "POST",
        path: "/v1/verify/certificate",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "certNo", type: "string", required: true, desc: "证书编号" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
    ],
  },
  {
    id: "safety",
    name: "内容安全审核接口",
    summary: "文本 · 图片 · 视频审核",
    apis: [
      {
        id: "safety-text",
        name: "文本审核",
        method: "POST",
        path: "/v1/review/safety/text",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "content", type: "string", required: true, desc: "待审核文本" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
    ],
  },
  {
    id: "dedup",
    name: "作品登记查重接口",
    summary: "文本查重 · 相似度报告",
    apis: [
      {
        id: "dedup-check",
        name: "登记查重",
        method: "POST",
        path: "/v1/review/duplicate/check",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "title", type: "string", required: true, desc: "作品名称" },
          { name: "contentHash", type: "string", required: false, desc: "内容指纹" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
    ],
  },
  {
    id: "infringe",
    name: "疑似侵权审核接口",
    summary: "侵权检测 · 相似度分析",
    apis: [
      {
        id: "infringe-detect",
        name: "侵权检测",
        method: "POST",
        path: "/v1/review/infringe/detect",
        commonParams: COMMON_PARAMS,
        requestParams: [
          { name: "sourceUrl", type: "string", required: true, desc: "待检测资源地址" },
        ],
        responseParams: STANDARD_RESPONSE,
      },
    ],
  },
];

export function getApiDocProduct(id: string): ApiDocProduct | undefined {
  return API_DOC_PRODUCTS.find((p) => p.id === id);
}
