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

export const API_DOC_VERSION = "v2.1";

const COMMON_PARAMS: ApiParam[] = [
  { name: "accessKey", type: "string", required: true, desc: "接入方标识，在密钥管理中获取" },
  { name: "timestamp", type: "string", required: true, desc: "请求时间戳，格式：yyyy-MM-dd HH:mm:ss" },
  { name: "sign", type: "string", required: true, desc: "请求签名，签名算法详见签名说明" },
];

const STANDARD_RESPONSE: ApiParam[] = [
  { name: "code", type: "number", required: true, desc: "业务状态码，0 表示成功" },
  { name: "message", type: "string", required: true, desc: "提示信息" },
  { name: "data", type: "object", required: false, desc: "业务数据" },
  { name: "requestId", type: "string", required: true, desc: "请求追踪 ID" },
];

function p(name: string, type: string, required: boolean, desc: string): ApiParam {
  return { name, type, required, desc };
}

function api(
  id: string,
  name: string,
  method: "GET" | "POST",
  path: string,
  requestParams: ApiParam[],
  description?: string,
): ApiEndpoint {
  return {
    id,
    name,
    method,
    path,
    description,
    commonParams: COMMON_PARAMS,
    requestParams,
    responseParams: STANDARD_RESPONSE,
  };
}

/** 6 产品 · 共 29 个接口（对齐 console-prototype.html） */
export const API_DOC_PRODUCTS: ApiDocProduct[] = [
  {
    id: "dci",
    name: "DCI核验接口",
    summary: "DCI编码核验 · 作品信息核验 · 证书核验",
    apis: [
      api("dci-single", "DCI编码核验", "POST", "/v1/verify/dci/single", [
        p("dciCode", "string", true, "待核验 DCI 编码"),
      ]),
      api("dci-ownership", "权属信息查询", "GET", "/v1/verify/dci/ownership", [
        p("dciCode", "string", true, "DCI 编码"),
      ]),
      api("dci-cert-verify", "证书真伪验证", "GET", "/v1/verify/dci/cert-verify", [
        p("certNo", "string", true, "证书编号"),
      ]),
      api("dci-work-detail", "作品详情查询", "GET", "/v1/verify/dci/work-detail", [
        p("dciCode", "string", true, "DCI 编码"),
      ]),
      api("dci-batch", "批量核验", "POST", "/v1/verify/dci/batch", [
        p("items", "array", true, "批量条目，每项含 payload"),
        p("callbackUrl", "string", false, "异步回调地址（可选）"),
      ]),
      api("dci-callback", "核验结果回调", "POST", "/v1/verify/dci/callback", [
        p("dciCode", "string", true, "DCI 编码"),
        p("result", "string", true, "核验结果"),
        p("callbackTime", "string", true, "回调时间"),
      ]),
    ],
  },
  {
    id: "info",
    name: "版权信息核验接口",
    summary: "作品信息检索 · 权属链查询 · 登记状态查询",
    apis: [
      api("info-search", "作品信息检索", "POST", "/v1/verify/info/search", [
        p("keyword", "string", false, "检索关键词"),
        p("category", "string", false, "作品分类"),
        p("page", "int", false, "页码，默认 1"),
      ]),
      api("info-ownership-chain", "权属链查询", "GET", "/v1/verify/info/ownership-chain", [
        p("regNo", "string", true, "登记号"),
      ]),
      api("info-reg-status", "登记状态查询", "GET", "/v1/verify/info/reg-status", [
        p("regNo", "string", true, "登记号"),
      ]),
      api("info-rights-holder", "权利人信息查询", "GET", "/v1/verify/info/rights-holder", [
        p("regNo", "string", true, "登记号"),
      ]),
      api("info-category", "作品分类查询", "GET", "/v1/verify/info/category", [
        p("parentId", "string", false, "父分类 ID"),
      ]),
    ],
  },
  {
    id: "cert",
    name: "版权证书核验接口",
    summary: "证书真伪验证 · 证书下载 · 批量核验",
    apis: [
      api("cert-validate", "证书真伪验证", "POST", "/v1/verify/cert/validate", [
        p("certNo", "string", true, "证书编号"),
        p("certImage", "string", false, "证书图片 URL"),
      ]),
      api("cert-detail", "证书详情查询", "GET", "/v1/verify/cert/detail", [
        p("certNo", "string", true, "证书编号"),
      ]),
      api("cert-download", "证书下载", "GET", "/v1/verify/cert/download", [
        p("certNo", "string", true, "证书编号"),
      ]),
      api("cert-batch", "批量证书核验", "POST", "/v1/verify/cert/batch", [
        p("certNos", "array", true, "证书编号列表"),
        p("callbackUrl", "string", false, "回调地址"),
      ]),
    ],
  },
  {
    id: "safety",
    name: "内容安全审核接口",
    summary: "文本审核 · 图片审核 · 视频审核 · 批量审核",
    apis: [
      api("safety-text", "文本审核", "POST", "/v1/review/safety/text", [
        p("content", "string", true, "待审核文本"),
        p("scene", "string", false, "审核场景，默认 default"),
      ]),
      api("safety-image", "图片审核", "POST", "/v1/review/safety/image", [
        p("imageUrl", "string", true, "图片 URL"),
        p("scene", "string", false, "审核场景"),
      ]),
      api("safety-video", "视频审核", "POST", "/v1/review/safety/video", [
        p("videoUrl", "string", true, "视频 URL"),
        p("callbackUrl", "string", true, "异步回调地址"),
      ]),
      api("safety-batch", "批量审核", "POST", "/v1/review/safety/batch", [
        p("items", "array", true, "批量审核条目"),
        p("callbackUrl", "string", false, "回调地址"),
      ]),
      api("safety-result", "审核结果查询", "GET", "/v1/review/safety/result", [
        p("taskId", "string", true, "审核任务 ID"),
      ]),
      api("safety-rule", "自定义规则配置", "POST", "/v1/review/safety/rule", [
        p("ruleName", "string", true, "规则名称"),
        p("keywords", "array", false, "关键词列表"),
        p("action", "string", true, "处置动作 block / pass / review"),
      ]),
      api("safety-notify", "审核回调通知", "POST", "/v1/review/safety/notify", [
        p("taskId", "string", true, "任务 ID"),
        p("result", "string", true, "审核结果"),
        p("labels", "array", false, "命中标签列表"),
      ]),
    ],
  },
  {
    id: "dedup",
    name: "作品登记查重接口",
    summary: "文本查重 · 图片查重 · 相似度报告",
    apis: [
      api("dedup-text", "文本查重", "POST", "/v1/review/dedup/text", [
        p("content", "string", true, "待查重文本"),
        p("category", "string", false, "作品分类"),
      ]),
      api("dedup-image", "图片查重", "POST", "/v1/review/dedup/image", [
        p("imageUrl", "string", true, "图片 URL"),
        p("threshold", "number", false, "相似度阈值，默认 0.85"),
      ]),
      api("dedup-report", "相似度报告生成", "GET", "/v1/review/dedup/report", [
        p("taskId", "string", true, "查重任务 ID"),
      ]),
    ],
  },
  {
    id: "infringe",
    name: "疑似侵权审核接口",
    summary: "侵权检测 · 相似度分析 · 风险报告生成",
    apis: [
      api("infringe-detect", "侵权检测", "POST", "/v1/review/infringe/detect", [
        p("targetUrl", "string", true, "目标 URL"),
        p("originalDci", "string", true, "原创 DCI 编码"),
      ]),
      api("infringe-similarity", "相似度分析", "POST", "/v1/review/infringe/similarity", [
        p("sourceContent", "string", true, "原创内容"),
        p("targetContent", "string", true, "疑似侵权内容"),
      ]),
      api("infringe-report", "风险报告生成", "GET", "/v1/review/infringe/report", [
        p("taskId", "string", true, "分析任务 ID"),
      ]),
      api("infringe-evidence", "侵权证据固定", "POST", "/v1/review/infringe/evidence", [
        p("taskId", "string", true, "任务 ID"),
        p("evidenceType", "string", true, "证据类型 screenshot / hash"),
      ]),
    ],
  },
];

export const API_DOC_TOTAL_COUNT = API_DOC_PRODUCTS.reduce((n, prod) => n + prod.apis.length, 0);

const PRODUCT_ALIASES: Record<string, string> = {
  certificate: "cert",
  duplicate: "dedup",
  infringement: "infringe",
};

export function getApiDocProduct(id: string): ApiDocProduct | undefined {
  const resolved = PRODUCT_ALIASES[id] ?? id;
  return API_DOC_PRODUCTS.find((prod) => prod.id === resolved);
}

export function getApiEndpoint(productId: string, apiId: string): ApiEndpoint | undefined {
  const prod = getApiDocProduct(productId);
  return prod?.apis.find((item) => item.id === apiId);
}
