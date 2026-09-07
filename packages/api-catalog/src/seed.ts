import type {
  ApiEndpoint,
  ApiErrorCode,
  ApiOnlineStatus,
  ApiParam,
  HttpMethod,
  ProductCode,
} from "./types";

export const AUTH_HEADER_PARAMS: ApiParam[] = [
  {
    name: "X-Access-Key",
    type: "string",
    required: true,
    desc: "接入方标识，在密钥管理中获取",
    example: "ak_demo_xxxx",
  },
  {
    name: "X-Timestamp",
    type: "string",
    required: true,
    desc: "请求时间戳，格式：yyyy-MM-dd HH:mm:ss",
    example: "2026-08-25 12:00:00",
  },
  {
    name: "X-Sign",
    type: "string",
    required: true,
    desc: "请求签名，签名算法详见签名说明",
  },
];

const STANDARD_RESPONSE: ApiParam[] = [
  { name: "code", type: "number", required: true, desc: "业务状态码，0 表示成功", example: "0" },
  { name: "message", type: "string", required: true, desc: "提示信息", example: "ok" },
  { name: "data", type: "object", required: false, desc: "业务数据" },
  { name: "requestId", type: "string", required: true, desc: "请求追踪 ID" },
];

const STANDARD_ERRORS: ApiErrorCode[] = [
  { code: "0", desc: "成功" },
  { code: "40001", desc: "参数错误" },
  { code: "40101", desc: "鉴权失败" },
  { code: "40401", desc: "资源不存在" },
  { code: "42901", desc: "调用频率超限" },
  { code: "50001", desc: "服务内部错误" },
];

function p(
  name: string,
  type: string,
  required: boolean,
  desc: string,
  extra?: Partial<Pick<ApiParam, "defaultValue" | "validation" | "example">>,
): ApiParam {
  return { name, type, required, desc, ...extra };
}

function exampleOk(data: Record<string, unknown>) {
  return JSON.stringify({ code: 0, message: "ok", data, requestId: "req_demo_001" }, null, 2);
}

function formatParamLines(title: string, rows: ApiParam[]) {
  if (!rows.length) return "";
  const lines = rows.map((row) => {
    const req = row.required ? "必填" : "可选";
    const bits = [`${row.name}`, `(${row.type}, ${req})`];
    if (row.desc) bits.push(`: ${row.desc}`);
    return `- ${bits.join(" ")}`;
  });
  return `【${title}】\n${lines.join("\n")}`;
}

function deriveRequestParamsText(input: {
  requestParamsText?: string;
  pathParams: ApiParam[];
  queryParams: ApiParam[];
  headerParams: ApiParam[];
  bodyParams: ApiParam[];
}) {
  if (input.requestParamsText?.trim()) return input.requestParamsText;
  return [
    formatParamLines("Path", input.pathParams),
    formatParamLines("Query", input.queryParams),
    formatParamLines("Header", input.headerParams),
    formatParamLines("Body", input.bodyParams),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function deriveResponseFieldsText(input: {
  responseFieldsText?: string;
  responseParams: ApiParam[];
}) {
  if (input.responseFieldsText?.trim()) return input.responseFieldsText;
  return formatParamLines("响应字段", input.responseParams).replace(/^【响应字段】\n/, "") || "";
}

type SeedInput = {
  id: string;
  apiCode: string;
  apiName: string;
  path: string;
  method: HttpMethod;
  productCode: ProductCode;
  description: string;
  owner?: string;
  version?: string;
  status?: ApiOnlineStatus;
  createdAt?: string;
  updatedAt?: string;
  docFile?: ApiEndpoint["docFile"];
  requestParamsText?: string;
  responseFieldsText?: string;
  pathParams?: ApiParam[];
  queryParams?: ApiParam[];
  headerParams?: ApiParam[];
  bodyParams?: ApiParam[];
  responseParams?: ApiParam[];
  errorCodes?: ApiErrorCode[];
  exampleRequest?: string;
  exampleResponse?: string;
};

function ep(input: SeedInput): ApiEndpoint {
  const method = input.method;
  const body = input.bodyParams ?? [];
  const query = input.queryParams ?? [];
  const exampleRequest =
    input.exampleRequest ??
    (method === "GET"
      ? ""
      : JSON.stringify(
          Object.fromEntries(
            body
              .filter((x) => x.required || x.example)
              .map((x) => [x.name, x.example ?? (x.type === "array" ? [] : x.type === "number" ? 0 : "")]),
          ),
          null,
          2,
        ));

  const pathParams = input.pathParams ?? [];
  const headerParams = input.headerParams ?? [];
  const responseParams = input.responseParams ?? STANDARD_RESPONSE;

  return {
    id: input.id,
    apiCode: input.apiCode,
    apiName: input.apiName,
    path: input.path,
    method,
    version: input.version ?? "v1",
    description: input.description,
    productCode: input.productCode,
    owner: input.owner ?? "平台运营",
    status: input.status ?? "online",
    createdAt: input.createdAt ?? "2026-03-01 10:00:00",
    updatedAt: input.updatedAt ?? input.createdAt ?? "2026-03-01 10:00:00",
    docFile: input.docFile ?? null,
    requestParamsText: deriveRequestParamsText({
      requestParamsText: input.requestParamsText,
      pathParams,
      queryParams: query,
      headerParams,
      bodyParams: body,
    }),
    responseFieldsText: deriveResponseFieldsText({
      responseFieldsText: input.responseFieldsText,
      responseParams,
    }),
    pathParams,
    queryParams: query,
    headerParams,
    bodyParams: body,
    responseParams,
    errorCodes: input.errorCodes ?? STANDARD_ERRORS,
    exampleRequest,
    exampleResponse: input.exampleResponse ?? exampleOk({ result: "pass" }),
  };
}

/** 演示种子：对齐控制台原有丰富接口文档，并补全配置模型字段 */
export function buildSeedEndpoints(): ApiEndpoint[] {
  return [
    // —— DCI ——
    ep({
      id: "dci-single",
      apiCode: "dci_single",
      apiName: "DCI编码核验",
      path: "/v1/verify/dci/single",
      method: "POST",
      productCode: "dci",
      description: "提交 DCI 编码进行真伪与权属核验。",
      createdAt: "2026-03-12 10:15:00",
      updatedAt: "2026-03-20 14:30:00",
      docFile: {
        id: "doc-dci-single",
        name: "DCI编码核验接口文档.pdf",
        size: 420_000,
      },
      bodyParams: [p("dciCode", "string", true, "待核验 DCI 编码", { example: "DCI-2026-0001", validation: "非空" })],
      exampleResponse: exampleOk({ dciCode: "DCI-2026-0001", valid: true, owner: "示例公司" }),
    }),
    ep({
      id: "dci-ownership",
      apiCode: "dci_ownership",
      apiName: "权属信息查询",
      path: "/v1/verify/dci/ownership",
      method: "GET",
      productCode: "dci",
      description: "按 DCI 编码查询权属信息。",
      createdAt: "2026-03-10 09:00:00",
      updatedAt: "2026-03-18 11:20:00",
      queryParams: [p("dciCode", "string", true, "DCI 编码", { example: "DCI-2026-0001" })],
    }),
    ep({
      id: "dci-cert-verify",
      apiCode: "dci_cert_verify",
      apiName: "证书真伪验证",
      path: "/v1/verify/dci/cert-verify",
      method: "GET",
      productCode: "dci",
      description: "验证与 DCI 关联的证书真伪。",
      createdAt: "2026-03-08 09:00:00",
      updatedAt: "2026-03-15 16:00:00",
      queryParams: [p("certNo", "string", true, "证书编号", { example: "CERT-2026-001" })],
    }),
    ep({
      id: "dci-work-detail",
      apiCode: "dci_work_detail",
      apiName: "作品详情查询",
      path: "/v1/verify/dci/work-detail",
      method: "GET",
      productCode: "dci",
      description: "查询 DCI 对应作品详情。",
      createdAt: "2026-03-05 09:00:00",
      updatedAt: "2026-03-12 10:00:00",
      queryParams: [p("dciCode", "string", true, "DCI 编码")],
    }),
    ep({
      id: "dci-batch",
      apiCode: "dci_batch",
      apiName: "批量核验",
      path: "/v1/verify/dci/batch",
      method: "POST",
      productCode: "dci",
      description: "批量提交 DCI 编码核验，支持回调。",
      createdAt: "2026-03-14 09:00:00",
      updatedAt: "2026-03-22 09:45:00",
      bodyParams: [
        p("items", "array", true, "批量条目，每项含 dciCode", { example: '[{"dciCode":"DCI-2026-0001"}]' }),
        p("callbackUrl", "string", false, "异步回调地址（可选）"),
      ],
    }),
    ep({
      id: "dci-callback",
      apiCode: "dci_callback",
      apiName: "核验结果回调",
      path: "/v1/verify/dci/callback",
      method: "POST",
      productCode: "dci",
      description: "平台向客户回调地址推送核验结果（文档说明用）。",
      createdAt: "2026-03-01 09:00:00",
      updatedAt: "2026-03-09 08:30:00",
      bodyParams: [
        p("dciCode", "string", true, "DCI 编码"),
        p("result", "string", true, "核验结果"),
        p("callbackTime", "string", true, "回调时间"),
      ],
    }),

    // —— 信息 ——
    ep({
      id: "info-search",
      apiCode: "info_search",
      apiName: "作品信息检索",
      path: "/v1/verify/info/search",
      method: "POST",
      productCode: "info",
      description: "按关键词与分类检索作品版权信息。",
      bodyParams: [
        p("keyword", "string", false, "检索关键词", { example: "示例作品" }),
        p("category", "string", false, "作品分类"),
        p("page", "int", false, "页码", { defaultValue: "1", example: "1" }),
      ],
    }),
    ep({
      id: "info-ownership-chain",
      apiCode: "info_ownership_chain",
      apiName: "权属链查询",
      path: "/v1/verify/info/ownership-chain",
      method: "GET",
      productCode: "info",
      description: "按登记号查询权属链。",
      queryParams: [p("regNo", "string", true, "登记号")],
    }),
    ep({
      id: "info-reg-status",
      apiCode: "info_reg_status",
      apiName: "登记状态查询",
      path: "/v1/verify/info/reg-status",
      method: "GET",
      productCode: "info",
      description: "查询作品登记状态。",
      queryParams: [p("regNo", "string", true, "登记号")],
    }),
    ep({
      id: "info-rights-holder",
      apiCode: "info_rights_holder",
      apiName: "权利人信息查询",
      path: "/v1/verify/info/rights-holder",
      method: "GET",
      productCode: "info",
      description: "查询登记号对应权利人信息。",
      queryParams: [p("regNo", "string", true, "登记号")],
    }),
    ep({
      id: "info-category",
      apiCode: "info_category",
      apiName: "作品分类查询",
      path: "/v1/verify/info/category",
      method: "GET",
      productCode: "info",
      description: "查询作品分类树。",
      queryParams: [p("parentId", "string", false, "父分类 ID")],
    }),

    // —— 证书 ——
    ep({
      id: "cert-validate",
      apiCode: "cert_validate",
      apiName: "证书真伪验证",
      path: "/v1/verify/cert/validate",
      method: "POST",
      productCode: "certificate",
      description: "验证版权证书真伪。",
      bodyParams: [
        p("certNo", "string", true, "证书编号", { example: "CERT-2026-001" }),
        p("certImage", "string", false, "证书图片 URL"),
      ],
    }),
    ep({
      id: "cert-detail",
      apiCode: "cert_detail",
      apiName: "证书详情查询",
      path: "/v1/verify/cert/detail",
      method: "GET",
      productCode: "certificate",
      description: "查询证书详情。",
      queryParams: [p("certNo", "string", true, "证书编号")],
    }),
    ep({
      id: "cert-download",
      apiCode: "cert_download",
      apiName: "证书下载",
      path: "/v1/verify/cert/download",
      method: "GET",
      productCode: "certificate",
      description: "下载证书文件。",
      queryParams: [p("certNo", "string", true, "证书编号")],
    }),
    ep({
      id: "cert-batch",
      apiCode: "cert_batch",
      apiName: "批量证书核验",
      path: "/v1/verify/cert/batch",
      method: "POST",
      productCode: "certificate",
      description: "批量核验证书编号。",
      status: "offline",
      bodyParams: [
        p("certNos", "array", true, "证书编号列表"),
        p("callbackUrl", "string", false, "回调地址"),
      ],
    }),

    // —— 作品智能辅助审核（含原安全 / 查重 / 侵权能力） ——
    ep({
      id: "safety-text",
      apiCode: "safety_text",
      apiName: "文本审核",
      path: "/v1/review/safety/text",
      method: "POST",
      productCode: "workReview",
      description: "对文本内容进行安全审核。",
      bodyParams: [
        p("content", "string", true, "待审核文本"),
        p("scene", "string", false, "审核场景", { defaultValue: "default" }),
      ],
    }),
    ep({
      id: "safety-image",
      apiCode: "safety_image",
      apiName: "图片审核",
      path: "/v1/review/safety/image",
      method: "POST",
      productCode: "workReview",
      description: "对图片进行安全审核。",
      bodyParams: [
        p("imageUrl", "string", true, "图片 URL"),
        p("scene", "string", false, "审核场景"),
      ],
    }),
    ep({
      id: "safety-video",
      apiCode: "safety_video",
      apiName: "视频审核",
      path: "/v1/review/safety/video",
      method: "POST",
      productCode: "workReview",
      description: "异步视频安全审核。",
      bodyParams: [
        p("videoUrl", "string", true, "视频 URL"),
        p("callbackUrl", "string", true, "异步回调地址"),
      ],
    }),
    ep({
      id: "safety-batch",
      apiCode: "safety_batch",
      apiName: "批量审核",
      path: "/v1/review/safety/batch",
      method: "POST",
      productCode: "workReview",
      description: "批量提交审核任务。",
      bodyParams: [
        p("items", "array", true, "批量审核条目"),
        p("callbackUrl", "string", false, "回调地址"),
      ],
    }),
    ep({
      id: "safety-result",
      apiCode: "safety_result",
      apiName: "审核结果查询",
      path: "/v1/review/safety/result",
      method: "GET",
      productCode: "workReview",
      description: "按任务 ID 查询审核结果。",
      queryParams: [p("taskId", "string", true, "审核任务 ID")],
    }),
    ep({
      id: "safety-rule",
      apiCode: "safety_rule",
      apiName: "自定义规则配置",
      path: "/v1/review/safety/rule",
      method: "POST",
      productCode: "workReview",
      description: "配置自定义审核规则。",
      bodyParams: [
        p("ruleName", "string", true, "规则名称"),
        p("keywords", "array", false, "关键词列表"),
        p("action", "string", true, "处置动作 block / pass / review", { validation: "enum:block|pass|review" }),
      ],
    }),
    ep({
      id: "safety-notify",
      apiCode: "safety_notify",
      apiName: "审核回调通知",
      path: "/v1/review/safety/notify",
      method: "POST",
      productCode: "workReview",
      description: "平台向客户推送审核结果（文档说明用）。",
      bodyParams: [
        p("taskId", "string", true, "任务 ID"),
        p("result", "string", true, "审核结果"),
        p("labels", "array", false, "命中标签列表"),
      ],
    }),

    // —— 查重 ——
    ep({
      id: "dedup-text",
      apiCode: "dedup_text",
      apiName: "文本查重",
      path: "/v1/review/dedup/text",
      method: "POST",
      productCode: "workReview",
      description: "对文本作品进行登记查重。",
      bodyParams: [
        p("content", "string", true, "待查重文本"),
        p("category", "string", false, "作品分类"),
      ],
    }),
    ep({
      id: "dedup-image",
      apiCode: "dedup_image",
      apiName: "图片查重",
      path: "/v1/review/dedup/image",
      method: "POST",
      productCode: "workReview",
      description: "对图片作品进行相似度查重。",
      bodyParams: [
        p("imageUrl", "string", true, "图片 URL"),
        p("threshold", "number", false, "相似度阈值", { defaultValue: "0.85", example: "0.85" }),
      ],
    }),
    ep({
      id: "dedup-report",
      apiCode: "dedup_report",
      apiName: "相似度报告生成",
      path: "/v1/review/dedup/report",
      method: "GET",
      productCode: "workReview",
      description: "查询查重任务相似度报告。",
      queryParams: [p("taskId", "string", true, "查重任务 ID")],
    }),

    // —— 侵权 ——
    ep({
      id: "infringe-detect",
      apiCode: "infringe_detect",
      apiName: "侵权检测",
      path: "/v1/review/infringe/detect",
      method: "POST",
      productCode: "workReview",
      description: "检测目标内容是否疑似侵权。",
      status: "offline",
      bodyParams: [
        p("targetUrl", "string", true, "目标 URL"),
        p("originalDci", "string", true, "原创 DCI 编码"),
      ],
    }),
    ep({
      id: "infringe-similarity",
      apiCode: "infringe_similarity",
      apiName: "相似度分析",
      path: "/v1/review/infringe/similarity",
      method: "POST",
      productCode: "workReview",
      description: "对比原创与疑似侵权内容相似度。",
      bodyParams: [
        p("sourceContent", "string", true, "原创内容"),
        p("targetContent", "string", true, "疑似侵权内容"),
      ],
    }),
    ep({
      id: "infringe-report",
      apiCode: "infringe_report",
      apiName: "风险报告生成",
      path: "/v1/review/infringe/report",
      method: "GET",
      productCode: "workReview",
      description: "查询侵权分析风险报告。",
      queryParams: [p("taskId", "string", true, "分析任务 ID")],
    }),
    ep({
      id: "infringe-evidence",
      apiCode: "infringe_evidence",
      apiName: "侵权证据固定",
      path: "/v1/review/infringe/evidence",
      method: "POST",
      productCode: "workReview",
      description: "固定侵权相关证据。",
      status: "offline",
      bodyParams: [
        p("taskId", "string", true, "任务 ID"),
        p("evidenceType", "string", true, "证据类型 screenshot / hash", {
          validation: "enum:screenshot|hash",
        }),
      ],
    }),
  ];
}
